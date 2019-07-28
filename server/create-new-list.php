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

require_once "backend-limits.php";
require_once "database.php";
require_once "return.php";

// Attempt to create a new list with unique keys. We'll keep looping until the database
// informs us that the keys were valid and that it created the desired list.
{
    $attempts = 0;

    while (++$attempts < 20)
    {
        $keys = ["editKey"=>pseudorandom_string(backend_limits("editKeyLength")),
                 "viewKey"=>pseudorandom_string(backend_limits("viewKeyLength"), true)];

        $wasSuccessful = database_add_list($keys, time(), ip_hash());

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

function pseudorandom_string(int $length, bool $onlyLetters = false)
{
    $string = "";
    $charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for ($i = 0; $i < $length; $i++)
    {
        $string .= $charset[random_int(0, ($onlyLetters? 25 : 35))];
    }

    if (strlen($string) !== $length)
    {
        exit(return_failure("Failed to generate a pseudorandom string."));
    }
    
    return $string;
}

function ip_hash()
{
    return substr(hash("sha256", $_SERVER['REMOTE_ADDR'], false), 0, backend_limits("ipHashLength"));
}

?>
