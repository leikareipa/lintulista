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

export function ll_assert_native_type(typeName, ...variables)
{
    for (const variable of variables)
    {
        let isOfType = false;

        switch (typeName) {
            case "array": (isOfType = Array.isArray(variable)); break;
            default: (isOfType = (typeof variable === typeName)); break;
        }

        if (!isOfType) {
            throw LL_PrivateError(`Unexpected variable type "${typeof variable}". Expected "${typeName}".`);
        }
    }

    return;
}

export function is_defined(property)
{
    return (typeof property !== "undefined");
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
    ll_assert_native_type("array", expect);

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
    ll_assert_native_type("array", expect);

    if (!expect_true(expect))
    {
        throw "assertion failure";
    }

    return;
}
