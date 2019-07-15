<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns as a JSON response a list of the birds we recognize. The user will be able to
 * add observations of any bird on that list, but not of others.
 * 
 */

$knownBirdsData = file_get_contents("./assets/metadata/known-birds.json");

if (!$knownBirdsData)
{
    exit(failure("Server-side IO failure. Could not read the list of known birds."));
}

exit(success($knownBirdsData));

function success($data)
{
    echo json_encode(["valid"=>true, "data"=>$data], JSON_UNESCAPED_UNICODE);
}

function failure($errorMessage = "")
{
    echo json_encode(["valid"=>false, "message"=>$errorMessage], JSON_UNESCAPED_UNICODE);
}

?>
