<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Adds an observation of the bird species to the given list. The observation data to be
 * added is expected as a JSON object of the following general form:
 * 
 *     {species:"Naakka", timestamp:5058748, place:"Tampereen keskusta"}
 * 
 * The 'species' property gives the species name of the bird that this observation is of,
 * and 'timestamp' the Unix epoch, in seconds, of when the observation was made. The 'place'
 * property is optional, and gives as a free-form string the place where the observation
 * took place.
 * 
 * Note that you are expected to add only one observation per request.
 * 
 */

require_once "database.php";
require_once "list-key.php";
require_once "return.php";

// Validate the input parameters.
{
    if (!isset($_GET["list"]))
    {
        exit(return_failure("Missing the required \"list\" parameter."));
    }

    if (!is_valid_list_key($_GET["list"]))
    {
        exit(return_failure("Invalid \"list\" parameter."));
    }
}

$newObservation = json_decode(file_get_contents("php://input"), true);

(new DatabaseAccess())->store_observation($_GET["list"], $newObservation);

exit(return_success());

?>
