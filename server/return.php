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
    // Error reponses should not be cached. Note that this assumes that no other
    // output has been produced from any of the scripts that ran prior to calling
    // this function.
    header("Cache-Control: no-store");

    echo json_encode(["valid"=>false, "message"=>$errorMessage], JSON_UNESCAPED_UNICODE);
}

?>
