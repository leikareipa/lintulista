/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for asserting conditions, displaying error messages, and the like.
 * 
 */

"use strict";

import {darken_viewport} from "./darken_viewport.js"
import {LL_PrivateError} from "./private-error.js"
import {LL_PublicError} from "./public-error.js"

export function ll_assert(condition, failMessage = "")
{
    if (!condition) {
        throw LL_PrivateError(failMessage);
    }

    return;
}

export function ll_public_assert(condition, failMessage = "")
{
    if (!condition) {
        throw LL_PublicError(failMessage);
    }

    return;
}

export function panic(errorMessage = "")
{
    // Draw a black screen over the entire page, blocking user interaction.
    darken_viewport({
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

// Takes in an array of functions, and returns true if the return values of all the
// functions in the array evaluate to strictly true. False is returned otherwise.
//
// For instance,
//
//     expect_true([()=>(1 === 1),
//                  ()=>(2 == "2")])
//
// will return true, as both functions return strictly true. On the other hand,
//
//     expect_true([()=>(1 === 1),
//                  ()=>(1 === 2)])
//
// and
//
//     expect_true([()=>(1 === 1),
//                  ()=>({})])
// 
// will return false, as the second function in neither case returns strictly true.
//
export function expect_true(expect = [])
{
    panic_if_not_type("array", expect);

    const expectFailed = expect.map((test, idx)=>({run:test, idx})).filter(test=>(test.run() !== true));

    if (expectFailed.length)
    {
        console.error(...["Not strictly true:\n",
                          ...expectFailed.map(failedTest=>`#${failedTest.idx+1}: ${failedTest.run.toString()}\n`)]);
    }

    return !expectFailed.length;
}

// Takes in an array of functions, and throws "assertion failure" if the return values
// of any of the functions in the array fail to evaluate to strictly true. See
// expect_true() for more info.
export function throw_if_not_true(expect = [])
{
    panic_if_not_type("array", expect);

    if (!expect_true(expect))
    {
        throw "assertion failure";
    }

    return;
}
