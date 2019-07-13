<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response the observations associated with a particular list.
 * 
 */

if (!isset($_GET["list"]))
{
    exit(failure("Missing the required \"list\" parameter."));
}

// Sanitize the list id.
if (strlen($_GET["list"]) < 10 ||
    strlen($_GET["list"]) > 30 ||
    !preg_match('/^[0-9a-zA-Z!]+$/', $_GET["list"]))
{
    exit(failure("Malformed \"list\" parameter."));
}

$baseFilePath = ("./assets/lists/" . $_GET["list"] . "/");

$observationData = json_decode(file_get_contents($baseFilePath . "observations.json"), true);

if (!$observationData)
{
    exit(failure("Server-side IO failure: Could not read the list of observations."));
}

if (!isset($observationData["observations"]))
{
    exit(failure("Server-side IO failure: The observation list is missing the required \"observations\" property."));
}

// Pick out the relevant properties to be returned.
$returnData = [];
foreach ($observationData["observations"] as $observation)
{
    if (!isset($observation["birdName"]))
    {
        exit(failure("Server-side IO failure: The observation list is missing the required \"birdName\" property."));
    }

    if (!isset($observation["timestamp"]))
    {
        exit(failure("Server-side IO failure: The observation list is missing the required \"timestamp\" property."));
    }

    $returnData[] = ["bird"=>$observation["birdName"], "timestamp"=>$observation["timestamp"]];
}

exit(success(json_encode($returnData)));

function success($data)
{
    echo json_encode(["valid"=>true, "data"=>$data]);
}

function failure($errorMessage = "")
{
    echo json_encode(["valid"=>false, "message"=>$errorMessage]);
}

?>
