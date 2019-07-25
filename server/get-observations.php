<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response the observations associated with a particular list.
 * 
 */

include "return.php";
include "list-id.php";

if (!isset($_GET["list"]))
{
    exit(return_failure("Missing the required \"list\" parameter."));
}

if (!is_valid_list_id($_GET["list"]))
{
    exit(return_failure("Invalid \"list\" parameter."));
}

$baseFilePath = ("./assets/lists/" . $_GET["list"] . "/");

$observationData = json_decode(file_get_contents($baseFilePath . "observations.json"), true);

if (!$observationData)
{
    exit(return_failure("Server-side IO failure. Could not read the list of observations."));
}

if (!isset($observationData["observations"]))
{
    exit(return_failure("Server-side IO failure. The observation list is missing the required \"observations\" property."));
}

// Pick out the relevant properties to be returned.
$returnData = [];
foreach ($observationData["observations"] as $observation)
{
    if (!isset($observation["species"]))
    {
        exit(return_failure("Server-side IO failure. The observation list is missing the required \"species\" property."));
    }

    if (!isset($observation["timestamp"]))
    {
        exit(return_failure("Server-side IO failure. The observation list is missing the required \"timestamp\" property."));
    }

    // Note: The 'place' property is optional and doesn't need to be checked for.

    $returnData[] = ["species"=>$observation["species"],
                     "timestamp"=>$observation["timestamp"],
                     "place"=>(isset($observation["place"])? $observation["place"] : null)];
}

exit(return_success(json_encode($returnData, JSON_UNESCAPED_UNICODE)));

?>
