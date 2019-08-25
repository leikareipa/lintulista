/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for asserting conditions, displaying error messages, and the like.
 * 
 */

"use strict";

import {darken_viewport} from "./darken_viewport.js"

export function panic(errorMessage = "")
{
    // Draw a black screen over the entire page, blocking user interaction.
    darken_viewport(
    {
        opacity: 1,
        z: 1000, // Should be above everything else on the page.
    });

    alert(`Lintulista is in a panic: ${errorMessage}`);
    throw Error(`Lintulista is in a panic: ${errorMessage}`);
}

export function panic_if_undefined(...properties)
{
    properties.forEach(property=>
    {
        if (!is_defined(property))
        {
            panic("A required property is undefined.");
        }
    });
}

export function panic_if_not_type(typeName, ...properties)
{
    properties.forEach(property=>
    {
        const isOfType = (()=>
        {
            switch (typeName)
            {
                case "array": return Array.isArray(property);
                default: return (typeof property === typeName);
            }
        })();

        if (!isOfType)
        {
            panic(`A property is of the wrong type; expected "${typeName}".`);
        }
    });
}

export function is_function(property)
{
    return (typeof property === "function");
}

export function is_defined(property)
{
    return (typeof property !== "undefined");
}

export function error(errorMessage = "")
{
    console.error(`Lintulista: ${errorMessage}`);
    alert(`Lintulista: ${errorMessage}`);
}

export function warn(errorMessage = "")
{
    console.warn(`Lintulista: ${errorMessage}`);
}

export function debug(debugMessage = "")
{
    console.debug(`Lintulista: ${debugMessage}`);
}
