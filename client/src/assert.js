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
            panic("A required property is undefined.");
        }
    });
}

export function panic_if_not_type(typeName, ...properties)
{
    properties.forEach(property=>
    {
        if (typeof property !== typeName)
        {
            panic(`A property is of the wrong type; expected a ${typeName}.`);
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
