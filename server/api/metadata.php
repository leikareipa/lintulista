<?php

// Note: For type=knownBirds, the cache header will be reset to allow some caching.
header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns relevant backend metadata about Lintulista. Any return data will be in the
 * form of a JSON string.
 * 
 * Methods:
 * 
 *     - GET: Return particular metadata.
 * 
 *         Parameters:
 *             - 'type': Identify the metadata to return. Either "knownBirds" or
 *                       "backendLimits".
 * 
 */

// Assume we're in /server/api/; we want to get to /server/.
chdir("../");

require_once "backend-limits.php";
require_once "known-birds.php";
require_once "return.php";

// Validate the input parameters.
{
    if (!isset($_GET["type"]))
    {
        exit(ReturnObject::failure("Missing the required 'type' parameter."));
    }
}

switch ($_SERVER["REQUEST_METHOD"])
{
    case "GET":
    {
        switch ($_GET["type"])
        {
            case "knownBirds":
            {
                $knownBirds = get_known_birds();

                // We don't expect the list of known birds to change very often, and it's
                // a mildly large dataset at ~50 KB, so best allow some caching of it.
                header("Cache-Control: max-age=604800");

                exit(ReturnObject::success(json_encode($knownBirds)));
            }
            case "backendLimits":
            {
                $backendLimits = get_backend_limits();
                exit(ReturnObject::success(json_encode($backendLimits)));
            }
            default: exit(ReturnObject::failure("Unknown metadata type '{$_GET["type"]}'."));
        }
    }
    default: exit(ReturnObject::failure("Unknown method '{$_SERVER["REQUEST_METHOD"]}'."));
}

function get_known_birds()
{
    return (new KnownBirds())->public_data();
}

function get_backend_limits()
{
    $backendLimits = new BackendLimits();

    $returnData = [];
    $returnData["maxPlaceNameLength"] = $backendLimits->value_of("maxPlaceNameLength");

    return $returnData;
}

?>
