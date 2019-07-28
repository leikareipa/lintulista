<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 */

function is_valid_list_id(string $id)
{
    return preg_match("/^[0-9a-zA-Z]+$/", $id);
}

?>
