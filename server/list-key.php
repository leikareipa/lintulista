<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 */

function is_valid_list_key(string $id)
{
    return preg_match("/^[0-9a-zA-Z]+$/", $id);
}

// Generates a valid, random view key.
function generate_random_view_key()
{
    return pseudorandom_string((new BackendLimits())->value_of("viewKeyLength"), true);
}

// Generates a valid, random edit key.
function generate_random_edit_key()
{
    return pseudorandom_string((new BackendLimits())->value_of("editKeyLength"));
}

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

?>
