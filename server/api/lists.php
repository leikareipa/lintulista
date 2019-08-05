<?php

header("Cache-Control: no-store");

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Allows the client to address queries to the backend about Lintulista's lists. Any return
 * data will be in the form of a JSON string.
 * 
 * Methods:
 * 
 *     - GET: Return public information about the list; such as its view key.
 * 
 *            Parameters:
 *                - 'list': The view key or edit key identifying the list on which to operate.
 * 
 *     - POST: Create a new list. Will return the view and edit keys to the list.
 * 
 *            Parameters:
 *                - (none)
 * 
 */

// Assume we're in /server/api/; we want to get to /server/.
chdir("../");

require_once "list-key.php";
require_once "database.php";
require_once "return.php";

// Validate the input parameters.
if ($_SERVER["REQUEST_METHOD"] !== "POST")
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

switch ($_SERVER["REQUEST_METHOD"])
{
    case "POST":
    {
        $keys = create_new_list();
        exit(return_success(json_encode($keys)));
    }
    case "GET":
    {
        $listInfo = get_list_information($_GET["list"]);
        exit(return_success(json_encode($listInfo)));
    }
    default: exit(return_failure("Unknown method \"{$_SERVER["REQUEST_METHOD"]}\"."));
}

function get_list_information()
{
    $viewKey = (new DatabaseAccess())->get_corresponding_view_key($_GET["list"]);

    return ["viewKey"=>$viewKey];
}

// Appends a new list into the database. Returns as an array the keys to the new list.
// 
// The return array will be of the following form:
// 
//     [
//        keys:
//         {
//             editKey: "...",
//             viewKey: "..."
//         }
//     ]
//
function create_new_list()
{
    // For rudimentary prevention of clients spamming new list creation, we'll force a wait
    // time on creating a list.
    //
    /// TODO: In the future, you might e.g. adjust this value based on how many lists the
    /// client has created in the last x minutes, going from no or very little delay to more
    /// of it.
    if (sleep(8) === false)
    {
        exit(return_failure("Server-side error."));
    }

    $backendLimits = new BackendLimits();
    $database = new DatabaseAccess();
    $ipHash = substr(hash("sha256", $_SERVER['REMOTE_ADDR'], false), 0, $backendLimits->value_of("ipHashLength"));

    // Attempt to create a new list with unique keys. We'll keep looping until the database
    // informs us that the keys were valid and that it created the desired list.
    $attempts = 0;
    while (++$attempts < 20)
    {
        $keys = ["editKey"=>generate_random_edit_key(),
                 "viewKey"=>generate_random_view_key()];

        $wasSuccessful = $database->create_new_list($keys, time(), $ipHash);

        if ($wasSuccessful === true)
        {
            return ["keys"=>$keys];
        }
        else if ($wasSuccessful === -1)
        {
            break;
        }
        // Otherwise, keep looping.
    }

    return [];
}

?>
