/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {LL_Throwable} from "./throwable.js";

/// TODO.
export function ll_error_popup__(errorMessage = "")
{
    window.alert(errorMessage);

    return;
}


// Takes in an Error object (e.g. from catch()) and, so far as it's relevant to Lintulista,
// presents its message to the user.
export function ll_error_popup(error = {})
{
    const errorMessage = (error.message || error.reason.message || "Unknown error");

    if (LL_Throwable.is_parent_of(error)) {
        console.error(`Lintulista: ${errorMessage}`);
    }
    // Not a Lintulista error.
    else {
        console.log(`External error: ${errorMessage}`);
    }
}
