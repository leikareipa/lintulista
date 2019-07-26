<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Convenience wrapper for querying backend limits.
 * 
 */

// Returns the named limitation; or null if a limitation by that name was not found. For
// instance, backend_limits("maxPlaceNameLength") returns the maximum place name length.
// For a list of the property names available, see server/assets/metadata/backend-limits.json.
function backend_limits(string $property)
{
    $limits = json_decode(file_get_contents("./assets/metadata/backend-limits.json"), true);

    if (!isset($limits["limits"]))
    {
        return null;
    }

    return (isset($limits["limits"][$property])? $limits["limits"][$property] : null);
}

?>
