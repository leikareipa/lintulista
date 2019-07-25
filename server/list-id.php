<?php

function is_valid_list_id(string $id)
{
    return (strlen($id) >= 10 &&
            strlen($id) <= 40 &&
            preg_match("/^[0-9a-zA-Z]+$/", $id));
}

?>
