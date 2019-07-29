<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Provides functions for interacting with Lintulista's database.
 * 
 * Work in progress.
 * 
 */

require_once "backend-limits.php";
require_once "known-birds.php";
require_once "return.php";

// Connect to the database.
{
    $databaseCredentials = json_decode(file_get_contents("../../lintulista-sql.json"), true);
    if (!$databaseCredentials ||
        !isset($databaseCredentials["host"]) ||
        !isset($databaseCredentials["user"]) ||
        !isset($databaseCredentials["password"]) ||
        !isset($databaseCredentials["database"]))
    {
        exit(return_failure("Server-side IO failure. Malformed database credentials."));
    }

    $database = mysqli_connect($databaseCredentials["host"],
                               $databaseCredentials["user"],
                               $databaseCredentials["password"],
                               $databaseCredentials["database"]);
    if (!$database)
    {
        exit(return_failure("Failed to connect to the server-side database. Error #" . mysqli_connect_errno()));
    }
}

// Wrapper function for sending queries to the database such that data is expected in response.
// E.g. database_query("SELECT * FROM table WHERE x = 10") returns such columns' values where x = 10.
function database_query(string $queryString)
{
    global $database;

    $response = mysqli_query($database, $queryString);

    if (($response === false) ||
        (mysqli_errno($database) !== 0))
    {
        exit(return_failure("Server-side IO failure. Failed to query the database with \"{$queryString}\" (" . mysqli_error($database) . ")."));
    }

    return mysqli_fetch_all($response, MYSQLI_ASSOC);
}

// Wrapper function for sending queries to the database such that the database is expected to return
// no data in reponse. E.g. database_command("UPDATE table SET x = 5 WHERE id = 1") modifies the data-
// base but returns no data in response.
//
// The function returns the last error code associated with executing the command; or 0 if no error
// occurred.
//
function database_command(string $commandString)
{
    global $database;

    mysqli_query($database, $commandString);

    return mysqli_errno($database);
}

// Returns the corresponding list id of the given list key.
//
// If requireEditRights is set to true, the given key must match a list's edit key. If it
// does not match any list's edit key, the script will terminate with an error message. If
// requireEditRights is set to false, the key can be found among either the edit keys or the
// view keys.
//
// If the key does not match to that of any list, the script will terminate with an error
// message.
//
// In practice, when you're requesting the list id of a key with the intent of modifying the
// list's data, set requireEditRights to true.
//
function database_get_list_id_of_key(string $listKey, bool $requireEditRights = true)
{
    if ($requireEditRights)
    {
        $response = database_query("SELECT list_id FROM lintulista_lists WHERE edit_key = '{$listKey}'");
    }
    else
    {
        $response = database_query("SELECT list_id FROM lintulista_lists WHERE view_key = '{$listKey}' OR edit_key = '{$listKey}'");
    }

    if (empty($response))
    {
        exit(return_failure("Unknown list key."));
    }

    if (count($response) > 1)
    {
        exit(return_failure("Detected duplicate list ids for key \"{$listKey}\"."));
    }

    return $response[0]["list_id"];
}

// Returns all observations associated with the given list.
function database_get_observations_in_list(string $listKey)
{
    $listId = database_get_list_id_of_key($listKey, false);

    return database_query("SELECT * FROM lintulista_observations WHERE list_id = {$listId}");
}

// Returns the observation of the given species in the given list; or null if no such
// observation could be found.
function database_get_observation_of_species(string $listKey, string $species)
{
    $listId = database_get_list_id_of_key($listKey. false);

    $result = database_query("SELECT * FROM lintulista_observations WHERE list_id = {$listId} AND species = '{$species}'");

    if (count($result) === 0)
    {
        return null;
    }

    if (count($result) > 1)
    {
        exit(return_failure("Detected duplicate observations of \"{$species}\"."));
    }

    return $result[0];
}

// Adds into the database a new observation list with the given parameters. Returns true
// on success; false if any of the given keys were not unique in the table of lists; and
// -1 on other errors.
//
// Generally, if false is returned, you might generate a new set of keys and try again.
//
function database_create_list(array $keys, int $timestamp, string $creatorHash)
{
    if (!isset($keys["viewKey"]) ||
        !isset($keys["editKey"]))
    {
        exit(return_failure("Was asked to add a list to the database, but was not given the required keys for it."));
    }

    $returnValue = database_command("INSERT INTO lintulista_lists (view_key, edit_key, creation_timestamp, creator_hash) VALUES " .
                                    "('{$keys["viewKey"]}', '{$keys["editKey"]}', {$timestamp}, '{$creatorHash}')");

    switch ($returnValue)
    {
        case 1062: return false; // 1062 = MySQLi ER_DUP_ENTRY, duplicate entry. The given keys are probably already in use.
        case 0: return true;     // Successfully added the list.
        default: return -1;      // Something went badly wrong.
    }
}

// Insert or update the given observation in the given list. If the observation already
// exists in the list, its data are overwritten by those of the given observation; otherwise
// a new observation entry is created in the list.
function database_store_observation(string $listKey, array $observation)
{
    $species = isset($observation["species"])? $observation["species"]
                                             : exit(return_failure("The given observation is missing the required \"species\" property."));

    $timestamp = isset($observation["timestamp"])? $observation["timestamp"]
                                                 : exit(return_failure("The given observation is missing the required \"timestamp\" property."));

    $place = isset($observation["place"])? mb_substr($observation["place"], 0, backend_limits("maxPlaceNameLength"), "utf-8")
                                         : null;

    if (!known_birds_is_valid_species($species))
    {
        exit(return_failure("Unable to find a bird species called \"{$species}\"."));
    }

    $existingObservation = database_get_observation_of_species($listKey, $species);
    if ($existingObservation)
    {
        $listId = database_get_list_id_of_key($listKey, true);

        $combinedValues = [];

        // Collect together the values that need to be updated.
        {
            if (isset($timestamp))
            {
                $combinedValues[] = "`timestamp` = {$timestamp}";
            }

            if (isset($place))
            {
                $combinedValues[] = "place = '{$place}'";
            }
        }

        if (count($combinedValues))
        {
            database_command("UPDATE lintulista_observations SET " . join(", ", $combinedValues) . " WHERE list_id = {$listId} AND species = '{$species}'");
        }
    }
    else
    {
        database_command("INSERT INTO lintulista_observations (list_id, species, `timestamp`, place) VALUES " .
                         "({$listId}, '{$species}', {$timestamp}, '{$place}')");
    }

    return;
}

?>