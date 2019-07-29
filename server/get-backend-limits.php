<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response a list of backend limitations. Note that the properties
 * included in that list are only those that would be of interest to the client.
 * 
 * The return object will be of the following form:
 * 
 *     {
 *         limitA: ...,
 *         limitB: ...,
 *         limitC: ...,
 *         ...,
 *     }
 * 
 */

require_once "backend-limits.php";
require_once "return.php";

$limits = backend_limits();

// Construct the return object.
{
    $returnData = [];
    
    add_property_to_return_data("maxPlaceNameLength");
}

exit(return_success(json_encode($returnData)));

function add_property_to_return_data(string $propertyName)
{
    global $limits, $returnData;

    if (isset($limits[$propertyName]))
    {
        $returnData[$propertyName] = $limits[$propertyName];
    }

    return;
}

?>
