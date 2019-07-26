<?php

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

include "backend-limits.php";
include "return.php";

$limits = backend_limits();

if ($limits === null)
{
    exit(return_failure("Server-side IO failure. Could not read the list of backend limitations."));
}

// Construct the return object.
{
    $returnData = [];
    
    add_property_to_return_data("maxPlaceNameLength");
    add_property_to_return_data("maxPlaceNameLength2");
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
