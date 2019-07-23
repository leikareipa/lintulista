/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {shades} from "./shades.js"

export function panic(errorMessage = "")
{
    // Draw a black screen over the entire page, blocking user interaction.
    const blackScreen = shades(
    {
        container: document.body,
        opacity: 1,
        onClick: ()=>{},
        z: 1000, // Should be above everything else on the page.
    });

    blackScreen.put_on();

    alert(`Lintulista is in a panic: ${errorMessage}`);
    throw Error(`Lintulista is in a panic: ${errorMessage}`);
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
