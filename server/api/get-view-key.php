<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Returns the view key corresponding to the given edit key.
 * 
 * The key will be returned as a JSON response, contained in the following kind of
 * JSON object:
 * 
 *     {
 *         view_key: "..."
 *     }
 * 
 */

// Assume we're in /server/api/.
chdir("../");

require_once "database.php";
require_once "list-key.php";
require_once "return.php";

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

$viewKey = (new DatabaseAccess())->get_corresponding_view_key($_GET["list"]);

exit(return_success(json_encode($viewKey)));

?>
