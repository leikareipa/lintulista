<?php

// In general, we don't expect the list of known birds to change very often.
header("Cache-Control: max-age=604800");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response a list of the birds we recognize. The user will be able to
 * add observations of any bird on that list, but not of others.
 * 
 */

// Assume we're in /server/api/.
chdir("../");

require_once "return.php";

$knownBirdsData = file_get_contents("./assets/metadata/known-birds.json");

if (!$knownBirdsData)
{
    exit(return_failure("Server-side IO failure. Could not read the list of known birds."));
}

exit(return_success($knownBirdsData));

?>
