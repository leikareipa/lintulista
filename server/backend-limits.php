<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Convenience wrapper for querying backend limits.
 * 
 */

class BackendLimits
{
    private $backendLimits;

    function __construct()
    {
        $this->backendLimits = json_decode(file_get_contents("./assets/metadata/backend-limits.json"), true);

        if (!$this->backendLimits ||
            !isset($this->backendLimits["limits"]))
        {
            exit(return_failure("Server-side IO failure. The list of known birds is invalid."));
        }
    }

    // Returns the named limitation. If a limitation by that name was not found, exits the script
    // with an error message. If an empty string "" is given, returns all limitations as an array;
    // or null if no list of limitations was available.
    //
    // For instance, value_of("maxPlaceNameLength") returns the maximum place name length; while
    // value_of() returns an array containing, among other things, maxPlaceNameLength, should such
    // a property exist in the list of limitations.
    //
    // For a list of the property names available, see server/assets/metadata/backend-limits.json.
    //
    function value_of(string $property = "")
    {
        $property = trim($property);

        if (empty($property))
        {
            return $this->backendLimits["limits"];
        }

        if (isset($this->backendLimits["limits"][$property]))
        {
            return $this->backendLimits["limits"][$property];
        }

        exit(return_failure("Server-side IO failure. Can't find a limit for \"{$property}\""));
    }
}

?>
