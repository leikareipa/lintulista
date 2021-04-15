/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for asserting conditions, displaying error messages, and the like.
 * 
 */

"use strict";

import {LL_BaseType} from "./base-type.js"
import {LL_Throwable} from "./throwable.js"

export function ll_assert(condition, failMessage = "")
{
    if (!condition) {
        throw LL_Throwable(failMessage);
    }

    return;
}

export function ll_assert_type(type, ...objects)
{
    ll_assert(LL_BaseType.is_known_type(type), "Unrecognized type.");

    for (const object of objects)
    {
        if (!type.is_parent_of(object)) {
            throw LL_Throwable(`Unexpected object type. Expected ${type.name}.`);
        }
    }

    return;
}

export function ll_assert_native_type(typeName, ...variables)
{
    for (const variable of variables)
    {
        let isOfType = false;

        if (typeof typeName === "string")
        {
            switch (typeName) {
                case "array": (isOfType = Array.isArray(variable)); break;
                default: (isOfType = (typeof variable === typeName)); break;
            }
        }
        else if (typeof typeName === "function")
        {
            isOfType = (variable instanceof typeName);
        }

        if (!isOfType) {
            throw LL_Throwable(`Unexpected variable type "${typeof variable}". Expected "${typeName}".`);
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
