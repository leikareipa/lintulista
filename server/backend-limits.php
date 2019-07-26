<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Convenience wrapper for querying backend limits.
 * 
 */

// Returns the named limitation; or null if a limitation by that name was not found. If an empty
// string "" is given, returns all limitations as an array; or null if no list of limitations
// was available.
//
// For instance, backend_limits("maxPlaceNameLength") returns the maximum place name length;
// while backend_limits() returns an array containing, among other things, maxPlaceNameLength,
// should such a property exist in the list of limitations.
//
// For a list of the property names available, see server/assets/metadata/backend-limits.json.
//
function backend_limits(string $property = "")
{
    $property = trim($property);
    
    $limits = json_decode(file_get_contents("./assets/metadata/backend-limits.json"), true);

    if (!isset($limits["limits"]))
    {
        return null;
    }

    if (empty($property))
    {
        return $limits["limits"];
    }

    if (isset($limits["limits"][$property]))
    {
        return $limits["limits"][$property];
    }

    return null;
}

?>
