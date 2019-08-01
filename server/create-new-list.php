<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Appends a new list into the database. Returns as a JSON object the keys to the new
 * list.
 * 
 * The return data is of the following form:
 * 
 *     {
 *         keys:
 *         {
 *             editKey: "...",
 *             viewKey: "..."
 *         }
 *     }
 * 
 */

require_once "list-key.php";
require_once "database.php";
require_once "return.php";

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

$database = new DatabaseAccess();

// Attempt to create a new list with unique keys. We'll keep looping until the database
// informs us that the keys were valid and that it created the desired list.
{
    $attempts = 0;

    while (++$attempts < 20)
    {
        $keys = ["editKey"=>generate_random_edit_key(),
                 "viewKey"=>generate_random_view_key()];

        $wasSuccessful = $database->create_new_list($keys, time(), ip_hash());

        if ($wasSuccessful === true)
        {
            exit(return_success(json_encode(["keys"=>$keys])));
        }
        else if ($wasSuccessful === -1)
        {
            break;
        }
        // Otherwise, keep looping.
    }
}

exit(return_failure("Failed to create a new list."));

function ip_hash()
{
    return substr(hash("sha256", $_SERVER['REMOTE_ADDR'], false), 0, backend_limits("ipHashLength"));
}

?>
