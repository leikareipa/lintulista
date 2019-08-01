<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Convenience wrapper for accessing information about known birds.
 * 
 * Known birds in Lintulista are those birds of whom observations can be added.
 * 
 */

require_once "return.php";

$knownBirds = json_decode(file_get_contents("./assets/metadata/known-birds.json"), true);

if (!$knownBirds ||
    !isset($knownBirds["birds"]))
{
    exit(return_failure("Server-side IO failure. The list of known birds is invalid."));
}

// Returns the index in the list of known birds of the given species; or false if such
// a species could not be found in the list. Note that this search is case sensitive.
function known_birds_id_for_species_name(string $speciesName)
{
    global $knownBirds;

    return array_search($speciesName, array_map(function($bird){return $bird["species"];}, $knownBirds["birds"]));
}

// Returns true if the given species name is recognized; false otherwise. Note that this
// search is case sensitive.
function is_known_species(string $speciesName)
{
    return (known_birds_id_for_species_name($speciesName) !== false);
}

?>
