<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 * Provides functions for returning standard responses to client queries. You could e.g.
 * call these with exit, such as exit(return_success(...)).
 * 
 */

function return_success($data = "")
{
    echo json_encode(["valid"=>true, "data"=>$data], JSON_UNESCAPED_UNICODE);
}

function return_failure($errorMessage = "")
{
    echo json_encode(["valid"=>false, "message"=>$errorMessage], JSON_UNESCAPED_UNICODE);
}

?>
