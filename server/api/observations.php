<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Handles client-to-server-to-client interaction with Lintulista's observations. Any
 * return data will be in the form of a JSON string.
 * 
 * Methods:
 * 
 *     - GET: Return all of the list's observations.
 * 
 *         Parameters:
 *             - 'list': The view key or edit key identifying the list on which to operate.
 * 
 *     - PUT: Add/update a particular observation to/on the list.
 * 
 *         Parameters:
 *             - 'list': The edit key identifying the list on which to operate. Note that
 *                       the view key is not allowed this operation.
 * 
 *         Body: {species, timestamp}
 * 
 *     - DELETE: Delete a particular observation from the list.
 * 
 *         Parameters:
 *             - 'list': The edit key identifying the list on which to operate. Note that
 *                       the view key is not allowed this operation.
 * 
 *         Body: {species}
 *            
 * 
 */

// Assume we're in /server/api/; we want to get to /server/.
chdir("../");

require_once "backend-limits.php";
require_once "database.php";
require_once "list-key.php";
require_once "return.php";

// Validate the input parameters.
{
    if (!isset($_GET["list"]))
    {
        exit(ReturnObject::failure("Missing the required 'list' parameter."));
    }

    if (ListKey::is_key_malformed($_GET["list"]))
    {
        exit(ReturnObject::failure("Invalid 'list' parameter."));
    }
}

switch ($_SERVER["REQUEST_METHOD"])
{
    case "GET":
    {
        $returnData = get_observations($_GET["list"]);
        exit(ReturnObject::success(json_encode($returnData, JSON_UNESCAPED_UNICODE)));
    }
    case "PUT":
    {
        $observation = json_decode(file_get_contents("php://input"), true);
        put_observation($_GET["list"], $observation);
        exit(ReturnObject::success());
    }
    case "DELETE":
    {
        $observation = json_decode(file_get_contents("php://input"), true);
        delete_observation($_GET["list"], $observation);
        exit(ReturnObject::success());
    }
    default: exit(ReturnObject::failure("Unknown method '{$_SERVER["REQUEST_METHOD"]}'."));
}

// Removes the given observation from the given list.
function delete_observation(string $listKey, array $observation)
{
    // Validate the input data.
    {
        if (!isset($observation["species"]))
        {
            exit(ReturnObject::failure("The given observation data is missing the required 'species' property."));
        }
    }

    (new DatabaseAccess())->remove_observations_of_species_from_list($_GET["list"], $observation["species"]);

    return;
}

// Stores the given observation in the given list. The observation will be created if
// it didn't already exist in the list; otherwise, the entry in the list will be modified
// according to the given observation.
function put_observation(string $listKey, array $observation)
{
    (new DatabaseAccess())->put_observation_to_list($_GET["list"], $observation);

    return;
}

// Returns all observations in the given list as an array of [[species,timestamp], [...], ...].
function get_observations(string $listKey)
{
    $observations = (new DatabaseAccess())->get_observations_in_list($_GET["list"]);

    // Pick out the relevant properties to be returned.
    {
        $returnData = [];
        foreach ($observations as $observation)
        {
            if (!isset($observation["species"]))
            {
                exit(ReturnObject::failure("Server-side IO failure. The observation list is missing the required 'species' property."));
            }

            if (!isset($observation["timestamp"]))
            {
                exit(ReturnObject::failure("Server-side IO failure. The observation list is missing the required 'timestamp' property."));
            }

            $returnData[] = ["species"=>$observation["species"],
                             "timestamp"=>$observation["timestamp"]];
        }
    }

    // By default, the data are in chronological order of entry; so let's sort them in
    // some other manner to hide the original ordering from public view.
    usort($returnData, function($a, $b)
    {
        return ($a["timestamp"] == $b["timestamp"])? 0
                                                   : ($a["timestamp"] > $b["timestamp"])? -1
                                                                                        : 1;
    });

    return $returnData;
}

?>
