/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "./assert.js";
import {LL_Throwable} from "./throwable.js";

/// TODO.
export function ll_message_popup(message = "")
{
    ll_assert_native_type("string", message);

    console.log(message);

    return;
}

/// TODO.
export function ll_error_popup__(errorMessage = "")
{
    ll_assert_native_type("string", errorMessage);

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
    else {
        console.log(`External error: ${errorMessage}`);
    }
}
