<?php

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

include "return.php";
include "list-id.php";

$newObservation = json_decode(file_get_contents("php://input"), true);

// Validate the input parameters.
{
    if (!isset($_GET["list"]))
    {
        exit(return_failure("Missing the required \"list\" parameter."));
    }

    if (!is_valid_list_id($_GET["list"]))
    {
        exit(return_failure("Invalid \"list\" parameter."));
    }
}

// Validate the input data.
{
    if (!isset($newObservation["species"]))
    {
        exit(return_failure("The given observation data is missing the required \"species\" property."));
    }

    if (!isset($newObservation["timestamp"]))
    {
        exit(return_failure("The given observation data is missing the required \"timestamp\" property."));
    }

    // Note: The 'place' property is optional and doesn't need to be checked for.
}

// See whether the new observation is valid.
{
    // We only allow known birds to be added.
    {
        $knownBirdsData = json_decode(file_get_contents("./assets/metadata/known-birds.json"), true);

        if (!isset($knownBirdsData["birds"]))
        {
            exit(return_failure("Server-side IO failure. The known birds list is missing the required \"birds\" property."));
        }

        if (!in_array($newObservation["species"], array_map(function($bird){return $bird["species"];}, $knownBirdsData["birds"])))
        {
            exit(return_failure("The given observation is of an unrecognized bird \"" . $newObservation["species"] . "\"."));
        }
    }
}

$baseFilePath = ("./assets/lists/" . $_GET["list"] . "/");

// Append the new observation to the current ones.
{
    $observationData = json_decode(file_get_contents($baseFilePath . "observations.json"), true);

    if (!$observationData)
    {
        exit(return_failure("Server-side IO failure. Could not read the list of observations."));
    }

    if (!isset($observationData["observations"]))
    {
        exit(return_failure("Server-side IO failure. The observation list is missing the required \"observations\" property."));
    }

    // Find if an observation of this species already exists in the list.
    $idx = array_search($newObservation["species"],
                        array_map(function($observation){return $observation["species"];}, $observationData["observations"]));

    // If the species is already on the list, we'll modify the existing entry rather than
    // adding a new one.
    if ($idx !== false)
    {
        if (isset($newObservation["place"]))
        {
            $observationData["observations"][$idx]["place"] = $newObservation["place"];
        }

        if (isset($newObservation["timestamp"]))
        {
            $observationData["observations"][$idx]["timestamp"] = $newObservation["timestamp"];
        }
    }
    // Otherwise, add the observation into the list as a new entry.
    else
    {
        $observationData["observations"][] = ["species"=>$newObservation["species"], "timestamp"=>$newObservation["timestamp"]] +
                                             (isset($newObservation["place"])? ["place"=>$newObservation["place"]] : []);
    }
}

file_put_contents(($baseFilePath . "observations.json"), json_encode($observationData, JSON_UNESCAPED_UNICODE));

exit(return_success());

?>
