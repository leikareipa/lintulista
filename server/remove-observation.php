<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Removes an observation from the given list. Expects the request body to contain a
 * JSON object giving the name of the bird of whom to remove the observation, like so:
 * 
 *     {birdName:"Naakka"}
 * 
 * The above will remove an observation of the bird called Naakka. If no observation
 * of that bird exists in the list, success will be returned without further action.
 * 
 * Note that you are expected to remove only one observation per request.
 * 
 */

$targetObservation = json_decode(file_get_contents("php://input"), true);

// Validate the input parameters.
{
    if (!isset($_GET["list"]))
    {
        exit(failure("Missing the required \"list\" parameter."));
    }

    // Sanitize the list id.
    if (strlen($_GET["list"]) < 10 ||
        strlen($_GET["list"]) > 40 ||
        !preg_match('/^[0-9a-zA-Z!]+$/', $_GET["list"]))
    {
        exit(failure("Malformed \"list\" parameter."));
    }
}

// Validate the input data.
{
    if (!isset($targetObservation["birdName"]))
    {
        exit(failure("The given observation data is missing the required \"birdName\" property."));
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
        $idx = array_search($targetObservation["birdName"],
                            array_map(function($observation){return $observation["birdName"];}, $observationData["observations"]));

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
