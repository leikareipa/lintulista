<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Convenience wrapper for querying backend limits.
 * 
 */

$backendLimits = json_decode(file_get_contents("./assets/metadata/backend-limits.json"), true);

if (!$backendLimits ||
    !is_array($backendLimits["limits"]))
{
    exit(return_failure("Server-side IO failure. Can't read the list of backend limits."));
}

// Returns the named limitation. If a limitation by that name was not found, exits the script
// with an error message. If an empty string "" is given, returns all limitations as an array;
// or null if no list of limitations was available.
//
// For instance, backend_limits("maxPlaceNameLength") returns the maximum place name length;
// while backend_limits() returns an array containing, among other things, maxPlaceNameLength,
// should such a property exist in the list of limitations.
//
// For a list of the property names available, see server/assets/metadata/backend-limits.json.
//
function backend_limits(string $property = "")
{
    global $backendLimits;
    
    $property = trim($property);

    if (empty($property))
    {
        return $backendLimits["limits"];
    }

    if (isset($backendLimits["limits"][$property]))
    {
        return $backendLimits["limits"][$property];
    }

    exit(return_failure("Server-side IO failure. Can't find a limit for \"{$property}\""));
}

?>
