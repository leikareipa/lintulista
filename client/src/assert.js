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

export function panic_if_undefined(...properties)
{
    properties.forEach(property=>
    {
        if (typeof property === "undefined")
        {
            panic("A required property was undefined.");
        }
    });
}

export function error(errorMessage = "")
{
    console.error(`Lintulista: ${errorMessage}`);
}

export function warn(errorMessage = "")
{
    console.warn(`Lintulista: ${errorMessage}`);
}

export function debug(debugMessage = "")
{
    console.debug(`Lintulista: ${debugMessage}`);
}
