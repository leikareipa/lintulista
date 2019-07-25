<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Removes an observation from the given list. Expects the request body to contain a
 * JSON object giving the species name of the bird of whom to remove the observation,
 * like so:
 * 
 *     {species: "Naakka"}
 * 
 * The above will remove an observation of the species "Naakka". If no observation of
 * that bird exists in the list, success will be returned without further action.
 * 
 * Note that you are expected to remove only one observation per request.
 * 
 */

include "list-id.php";

$targetObservation = json_decode(file_get_contents("php://input"), true);

// Validate the input parameters.
{
    if (!isset($_GET["list"]))
    {
        exit(failure("Missing the required \"list\" parameter."));
    }

    if (!is_valid_list_id($_GET["list"]))
    {
        exit(failure("Invalid \"list\" parameter."));
    }
}

// Validate the input data.
{
    if (!isset($targetObservation["species"]))
    {
        exit(failure("The given observation data is missing the required \"species\" property."));
    }
}

$baseFilePath = ("./assets/lists/" . $_GET["list"] . "/");

// Remove the given observation from the list of observation.
{
    $observationData = json_decode(file_get_contents($baseFilePath . "observations.json"), true);

    if (!$observationData)
    {
        exit(failure("Server-side IO failure. Could not read the list of observations."));
    }

    if (!isset($observationData["observations"]))
    {
        exit(failure("Server-side IO failure. The observation list is missing the required \"observations\" property."));
    }

    // Find the observation in the list, and remove it.
    {
        $idx = array_search($targetObservation["species"],
                            array_map(function($observation){return $observation["species"];}, $observationData["observations"]));

        if ($idx !== false)
        {
            unset($observationData["observations"][$idx]);
            $observationData["observations"] = array_values($observationData["observations"]);
        }
    }
}

file_put_contents(($baseFilePath . "observations.json"), json_encode($observationData, JSON_UNESCAPED_UNICODE));

exit(success());

function success()
{
    echo json_encode(["valid"=>true], JSON_UNESCAPED_UNICODE);
}

function failure($errorMessage = "")
{
    echo json_encode(["valid"=>false, "message"=>$errorMessage], JSON_UNESCAPED_UNICODE);
}

?>
