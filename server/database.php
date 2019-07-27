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
    if (!$response)
    {
        exit(return_failure("Server-side IO failure. Failed to query the database with \"{$queryString}\""));
    }

    return mysqli_fetch_all($response, MYSQLI_ASSOC);
}

// Wrapper function for sending queries to the database such that no data is expected in response.
// E.g. database_command("UPDATE table SET x = 5 WHERE id = 1") modifies the database but returns no
// data in response.
function database_command(string $commandString)
{
    global $database;

    $response = mysqli_query($database, $commandString);
    if (!$response)
    {
        exit(return_failure("Server-side IO failure. Failed to command the database with \"{$commandString}\""));
    }

    return;
}

// Returns all observations associated with the given list.
function database_get_observations(int $listId)
{
    $result = database_query("SELECT * FROM lintulista_observations WHERE list_id = {$listId}");

    if (!is_array($result))
    {
        exit(return_failure("Failed to fetch the observations of list #\"{$listId}\"."));
    }

    return $result;
}

// Returns the observation of the given species in the given list; or null if no such
// observation could be found.
function database_get_observation_of_species(int $listId, string $species)
{
    $result = database_query("SELECT * FROM lintulista_observations WHERE list_id = {$listId} AND species = '{$species}'");

    if (!is_array($result))
    {
        exit(return_failure("Failed to fetch observations of \"{$species}\"."));
    }

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

function database_get_list_id_of_edit_key(string $editKey)
{
    $result = database_query("SELECT list_id FROM lintulista_lists WHERE edit_key = '{$editKey}'");

    if (!is_array($result))
    {
        exit(return_failure("Failed to fetch observations of \"{$species}\"."));
    }

    if ((count($result) != 1) ||
        !isset($result[0]["list_id"]))
    {
        exit(return_failure("Invalid list id data for key \"{$editKey}\"."));
    }

    return $result[0]["list_id"];
}

// Insert or update the given observation in the given list. If the observation already
// exists in the list, its data are overwritten by those of the given observation; otherwise
// a new observation entry is created in the list.
function database_store_observation(int $listId, array $observation)
{
    $species = isset($observation["species"])? $observation["species"]
                                             : exit(return_failure("The given observation is missing the required \"species\" property."));

    $timestamp = isset($observation["timestamp"])? $observation["timestamp"]
                                                 : exit(return_failure("The given observation is missing the required \"timestamp\" property."));

    $place = isset($observation["place"])? substr($observation["place"], 0, backend_limits("maxPlaceNameLength"))
                                         : null;

    if (!known_birds_is_valid_species($species))
    {
        exit(return_failure("Unable to find a bird species called \"{$species}\"."));
    }

    $existingObservation = database_get_observation_of_species($listId, $species);
    if ($existingObservation)
    {
        if ($species) database_command("UPDATE lintulista_observations SET species = '{$species}' WHERE list_id = {$listId}");
        if ($timestamp) database_command("UPDATE lintulista_observations SET `timestamp` = {$timestamp} WHERE list_id = {$listId}");
        if (isset($place)) database_command("UPDATE lintulista_observations SET place = '{$place}' WHERE list_id = {$listId}");
    }
    else
    {
        database_command("INSERT INTO lintulista_observations (list_id, species, `timestamp`, place) VALUES " .
                         "({$listId}, '{$species}', {$timestamp}, '{$place}')");
    }

    return;
}

?>
