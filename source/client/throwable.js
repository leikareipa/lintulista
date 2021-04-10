/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

const errorId = "lintulista-throwable";

// For errors whose message can be shown as-is to the user.
export function public_error(message = "")
{
    return {
        id: errorId,
        isPrivate: false,
        message: (message || "Unknown error."),
    };
}

// For errors whose specific message should not be shown to the user.
export function private_error(message = "")
{
    return {
        id: errorId,
        isPrivate: true,
        message: (message || "Unknown error."),
    };
}

// Returns true if the given catch() error is one of ours; false otherwise.
export function is_public_ll_error(error)
{
    return ((typeof error === "object") &&
            error.hasOwnProperty("id") &&
            error.hasOwnProperty("isPrivate") &&
            (error.id === errorId) &&
            (error.isPrivate === false));
}
