/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "./assert.js";
import {LL_BaseType} from "./base-type.js";

export const LL_PublicError = function(message = "Unknown error")
{
    panic_if_not_type("string", message);

    const publicInterface = {
        isPrivate: false,
        message,

        ...LL_BaseType(LL_PublicError)
    };

    return publicInterface;
}

LL_PublicError.is_parent_of = function(candidate)
{
    return ((LL_BaseType.type_of(candidate) === LL_PublicError) &&
            candidate.hasOwnProperty("isPrivate") &&
            candidate.hasOwnProperty("message") &&
            (candidate.isPrivate === false));
}
