<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 */

require_once "backend-limits.php";

// Provides convenience wrappers for dealing with keys in Lintulista.
//
// Lintulista's keys are unique strings used to identify particular observation lists. Each
// list is associated with two keys: a view key, and an edit key. The view key can be used
// to access the list's public data but cannot be used to modify that data; whereas the edit
// key can be used to both view and modify the list's data. (The idea behind this being that
// the user keeps the edit key private, but can share the view key to others.)
//
class ListKey
{
    // Checks whether the surface features of the key are invalid; i.e. whether it's composed
    // of incorrect characters. Note that this function does not make a distinction between
    // view keys and edit keys, nor does it check whether the given key exists in the system;
    // it just verifies the key's superficial validity.
    static function is_key_malformed(string $key): bool
    {
        return (preg_match("/^[0-9a-zA-Z]+$/", $key) !== 1);
    }

    // Generates and returns a random view key. Note that the function will not store the
    // key in the system, it just generates a key string and returns it. It's up to the
    // caller whether they want to e.g. request a new list to be generated with the key.
    static function generate_random_view_key(): string
    {
        $viewKey = self::generate_pseudorandom_key_string((new BackendLimits())->value_of("viewKeyLength"), true);

        if (self::is_key_malformed($viewKey))
        {
            exit(ReturnObject::failure("Failed to generate a valid list key."));
        }

        return $viewKey;
    }

    // Generates and returns a random edit key. Note that the function will not store the
    // key in the system, it just generates a key string and returns it. It's up to the
    // caller whether they want to e.g. request a new list to be generated with the key.
    static function generate_random_edit_key(): string
    {
        $editKey = self::generate_pseudorandom_key_string((new BackendLimits())->value_of("editKeyLength"));

        if (self::is_key_malformed($editKey))
        {
            exit(ReturnObject::failure("Failed to generate a valid list key."));
        }

        return $editKey;
    }

    private static function generate_pseudorandom_key_string(int $length, bool $onlyLetters = false): string
    {
        $string = "";
        $charset = "abcdefghijklmnopqrstuvwxyz0123456789";

        for ($i = 0; $i < $length; $i++)
        {
            $string .= $charset[random_int(0, ($onlyLetters? 25 : 35))];
        }

        if (strlen($string) !== $length)
        {
            exit(ReturnObject::failure("Failed to generate a valid pseudorandom key string."));
        }

        if (self::is_key_malformed($string))
        {
            exit(ReturnObject::failure("Failed to generate a valid pseudorandom key string."));
        }
        
        return $string;
    }
}

?>
