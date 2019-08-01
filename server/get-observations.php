<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response the observations associated with a particular list.
 * 
 */

require_once "backend-limits.php";
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

$observations = database_get_observations_in_list($_GET["list"]);

// Pick out the relevant properties to be returned.
{
    $maxPlaceNameLength = backend_limits("maxPlaceNameLength");

    $returnData = [];
    foreach ($observations as $observation)
    {
        if (!isset($observation["species"]))
        {
            exit(return_failure("Server-side IO failure. The observation list is missing the required \"species\" property."));
        }

        if (!isset($observation["timestamp"]))
        {
            exit(return_failure("Server-side IO failure. The observation list is missing the required \"timestamp\" property."));
        }

        $place = null;
        if (isset($observation["place"]))
        {
            $place = mb_substr($observation["place"], 0, $maxPlaceNameLength, "utf-8");
        }

        $returnData[] = ["species"=>$observation["species"],
                         "timestamp"=>$observation["timestamp"],
                         "place"=>$place];
    }
}

/// FIXME: Odd bug here - if $maxPlaceNameLength is 2, $returnData evaluates to 'false'.
exit(return_success(json_encode($returnData, JSON_UNESCAPED_UNICODE)));

?>
