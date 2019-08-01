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
require_once "list-key.php";
require_once "return.php";

// A wrapper for interacting with Lintulista's database.
//
// Currently, the following functions make up the class's public interface:
//
//     - remove_observations_of_species_from_list()
//     - get_corresponding_view_key()
//     - get_observations_in_list()
//     - post_observation_to_list()
//     - create_new_list()
//
// These functions correspond to the commands available to the frontend client; they allow the
// client to access - and possibly modify - the public data in a given list.
//
// The client will query the server with a list key (a string identifying a particular list)
// and the desired action to perform on that list. A server-side script receives that request
// and calls on the relevant public function in database class to carry it out. The database
// class will thus receive a request and a key string - it must first convert the key string
// into an internal list ID before issuing any requests to the database against that list.
//
// There are two kinds of list keys in Lintulista: an edit key and a view key. Each list has one
// of both - the edit key can be used to modify the list's data, while the view key can be used
// to view the list's public data but not modify it. The internal database functions must thus
// verify that the key string received from the client has the required rights to perform the
// requested action; such that e.g. a request to add an observation to a list using its view key
// should not be carried out.
//
// In practice, any function in the database class that invokes the database (e.g. "SELECT ..."
// or "UPDATE ...") should first call get_list_id_of_key() to transform the list key into a list
// ID, then use the ID when invoking the database (e.g. "SELECT ... FROM ... WHERE list_id = ..."
// rather than "SELECT ... FROM ... WHERE edit_key = ...").
//
//     The function get_list_id_of_key() takes as parameters the key string and a boolean
//     specifying whether the key is required to have edit rights. When requesting the list
//     ID of a key with intent to modify the database, call get_list_id_of_key("...", true).
//     This will verify that the given key has the rights to make changes to the database;
//     i.e. whether it's an edit key or a view key. If the key lacks those rights, the script
//     will return to the client with an error. If you do not intend a query using the list ID
//     to modify the database, you can call get_list_id_of_key("...", false).
//
class DatabaseAccess
{
    // An object returned from mysqli_connect() for accessing the database. Will be
    // initialized by the class constructor.
    private $database;

    function __construct()
    {
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

            $this->database = mysqli_connect($databaseCredentials["host"],
                                             $databaseCredentials["user"],
                                             $databaseCredentials["password"],
                                             $databaseCredentials["database"]);
            if (!$this->database)
            {
                exit(return_failure("Failed to connect to the server-side database. Error #" . mysqli_connect_errno()));
            }
        }
    }

    // Returns the view key corresponding to the given edit key. If the edit key can't be found
    // in the database, a random string of the view key's length will be returned.
    function get_corresponding_view_key(string $editKey)
    {
        $listId = $this->get_list_id_of_key($editKey, false);

        $result = $this->database_query("SELECT view_key FROM lintulista_lists WHERE list_id = '{$listId}'");

        if (count($result) !== 1)
        {
            return generate_random_view_key();
        }

        return $result[0];
    }

    // Returns all observations associated with the given list.
    function get_observations_in_list(string $listKey)
    {
        $listId = $this->get_list_id_of_key($listKey, false);

        return $this->database_query("SELECT species, place, `timestamp` FROM lintulista_observations WHERE list_id = {$listId}");
    }

    // Adds into the database a new observation list with the given parameters. Returns true
    // on success; false if any of the given keys were not unique in the table of lists; and
    // -1 on other errors.
    //
    // Generally, if false is returned, you might generate a new set of keys and try again.
    //
    function create_new_list(array $keys, int $timestamp, string $creatorHash)
    {
        if (!isset($keys["viewKey"]) ||
            !isset($keys["editKey"]))
        {
            exit(return_failure("Was asked to add a list to the database, but was not given the required keys for it."));
        }

        $returnValue = $this->database_command("INSERT INTO lintulista_lists (view_key, edit_key, creation_timestamp, creator_hash) VALUES " .
                                               "('{$keys["viewKey"]}', '{$keys["editKey"]}', {$timestamp}, '{$creatorHash}')");

        switch ($returnValue)
        {
            case 1062: return false; // 1062 = MySQLi ER_DUP_ENTRY, duplicate entry. The given keys are probably already in use.
            case 0: return true;     // Successfully added the list.
            default: return -1;      // Something went badly wrong.
        }
    }

    // Deletes any observations from the given list where the species name matches the given one.
    function remove_observations_of_species_from_list(string $listKey, string $speciesName)
    {
        $listId = $this->get_list_id_of_key($listKey, true);

        $this->database_command("DELETE FROM lintulista_observations WHERE list_id = {$listId} AND species = '{$speciesName}'");

        return;
    }

    // Insert or update the given observation in the given list. If the observation already
    // exists in the list, its data are overwritten by those of the given observation; otherwise
    // a new observation entry is created in the list.
    function post_observation_to_list(string $listKey, array $observation)
    {
        $species = isset($observation["species"])? $observation["species"]
                                                 : exit(return_failure("The given observation is missing the required \"species\" property."));

        $timestamp = isset($observation["timestamp"])? $observation["timestamp"]
                                                     : exit(return_failure("The given observation is missing the required \"timestamp\" property."));

        $place = isset($observation["place"])? mb_substr($observation["place"], 0, backend_limits("maxPlaceNameLength"), "utf-8")
                                             : null;

        if (!is_known_species($species))
        {
            exit(return_failure("Unable to recognize the species \"{$species}\"."));
        }

        $listId = $this->get_list_id_of_key($listKey, true);
        $existingObservation = $this->get_observation_of_species($listId, $species);
        
        if ($existingObservation)
        {
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
                $this->database_command("UPDATE lintulista_observations SET " . join(", ", $combinedValues) . " WHERE list_id = {$listId} AND species = '{$species}'");
            }
        }
        else
        {
            $this->database_command("INSERT INTO lintulista_observations (list_id, species, `timestamp`, place) VALUES " .
                                    "({$listId}, '{$species}', {$timestamp}, '{$place}')");
        }

        return;
    }

    // Returns the observation of the given species in the given list; or null if no such
    // observation could be found.
    private function get_observation_of_species(string $listId, string $species)
    {
        $result = $this->database_query("SELECT species, place, `timestamp` FROM lintulista_observations WHERE list_id = {$listId} AND species = '{$species}'");

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
    private function get_list_id_of_key(string $listKey, bool $requireEditRights = true)
    {
        if ($requireEditRights)
        {
            $response = $this->database_query("SELECT list_id FROM lintulista_lists WHERE edit_key = '{$listKey}'");
        }
        else
        {
            $response = $this->database_query("SELECT list_id FROM lintulista_lists WHERE view_key = '{$listKey}' OR edit_key = '{$listKey}'");
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

    // Wrapper function for sending queries to the database such that data is expected in response.
    // E.g. database_query("SELECT * FROM table WHERE x = 10") returns such columns' values where x = 10.
    private function database_query(string $queryString)
    {
        $response = mysqli_query($this->database, $queryString);

        if (($response === false) ||
            (mysqli_errno($this->database) !== 0))
        {
            exit(return_failure("Server-side IO failure. Failed to query the database with \"{$queryString}\" (" . mysqli_error($this->database) . ")."));
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
    private function database_command(string $commandString)
    {
        mysqli_query($this->database, $commandString);

        return mysqli_errno($this->database);
    }
}

?>
