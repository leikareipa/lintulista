<?php

/*
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * Lintulista
 * 
 */

// Functions to call in tandem with exit() to provide the client with a JSON response from
// the script.
//
// For instance, you might call exit(ReturnObject::success()) to convey to the client that
// that their call succeeded; or exit(ReturnObject::failure("This did not go well.")) for
// the opposite.
//
class ReturnObject
{
    static function success(string $data = "")
    {
        echo json_encode(["valid"=>true, "data"=>$data], JSON_UNESCAPED_UNICODE);
    }

    static function failure(string $errorMessage = "")
    {
        // Error reponses should not be cached. Note that this assumes that no other
        // output has been produced from any of the scripts that ran prior to calling
        // this function.
        header("Cache-Control: no-store");
    
        echo json_encode(["valid"=>false, "message"=>$errorMessage], JSON_UNESCAPED_UNICODE);
    }
}

?>
