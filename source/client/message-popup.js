/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {tr} from "./translator.js";
import {LL_PublicError} from "./public-error.js";
import {LL_PrivateError} from "./private-error.js";

// Takes in an Error object (e.g. from catch()) and, so far as it's relevant to Lintulista,
// presents its message to the user.
export function ll_error_popup(error = {})
{
    if (LL_PublicError.is_parent_of(error)) {
        /// TODO: Pop up an error message.
        console.log(tr("Encountered an error"), error.message);
    }
    else if (LL_PrivateError.is_parent_of(error)) {
        console.error("Lintulista:", error.message);
    }
    // Not a Lintulista error.
    else {
        throw error;
    }
}
