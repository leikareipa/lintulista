<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Removes an observation from the given list. Expects the request body to contain a
 * JSON object giving the species name of the bird of whom to remove the observation,
 * like so:
 * 
 *     {species: "Naakka"}
 * 
 * The above will remove an observation of the species "Naakka". If no observation of
 * that bird exists in the list, success will be returned without further action.
 * 
 */

require_once "database.php";
require_once "list-key.php";
require_once "return.php";

$targetObservation = json_decode(file_get_contents("php://input"), true);

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

// Validate the input data.
{
    if (!isset($targetObservation["species"]))
    {
        exit(return_failure("The given observation data is missing the required \"species\" property."));
    }
}

(new DatabaseAccess())->remove_observations_of_species_from_list($_GET["list"], $targetObservation["species"]);

exit(return_success());

?>
