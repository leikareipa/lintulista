<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Adds an observation to the given list. The observation data to be added is expected
 * as a JSON object of the following form:
 * 
 *     {birdName:"Naakka", timestamp:5058748}
 * 
 * The birdName property gives the name of the bird that this observation is of, and the
 * timestamp the Unix epoch, in seconds, of when the observation was made.
 * 
 * Note that you are expected to add only one observation per request.
 * 
 */

$newObservation = json_decode(file_get_contents("php://input"), true);

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
    if (!isset($newObservation["birdName"]))
    {
        exit(failure("The given observation data is missing the required \"birdName\" property."));
    }

    if (!isset($newObservation["timestamp"]))
    {
        exit(failure("The given observation data is missing the required \"timestamp\" property."));
    }
}

// See whether the new observation is valid.
{
    // We only allow known birds to be added.
    {
        $knownBirdsData = json_decode(file_get_contents("./assets/metadata/known-birds.json"), true);

        if (!isset($knownBirdsData["birds"]))
        {
            exit(failure("Server-side IO failure. The known birds list is missing the required \"birds\" property."));
        }

        if (!in_array($newObservation["birdName"], array_map(function($bird){return $bird["name"];}, $knownBirdsData["birds"])))
        {
            exit(failure("The given observation is of an unrecognized bird \"" . $newObservation["birdName"] . "\"."));
        }
    }
}

$baseFilePath = ("./assets/lists/" . $_GET["list"] . "/");

// Append the new observation to the current ones.
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

    $observationData["observations"][] = ["birdName"=>$newObservation["birdName"], "timestamp"=>$newObservation["timestamp"]];
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
