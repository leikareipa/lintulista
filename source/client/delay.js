/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 */

"use strict";

// Allows for rudimentary sleep() behavior when called with "await delay(x)" in an async
// function. Adapted from https://stackoverflow.com/a/33292942.
export function delay(ms)
{
    return new Promise(resolve=>setTimeout(resolve, ms));
}
