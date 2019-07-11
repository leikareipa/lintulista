/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

export function panic(errorMessage = "")
{
    alert(`Lintulista: ${errorMessage}`);
    throw Error(`Lintulista: ${errorMessage}`);
}

export function warn(errorMessage = "")
{
    console.warn(`Lintulista: ${errorMessage}`);
}
