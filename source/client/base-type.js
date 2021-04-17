/*
 * 2019, 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert,
        ll_assert_native_type} from "./assert.js";

const typeKey = "__$ll_type";

const knownTypes = [];

// The base type acts as an object identifier, allowing us to assert that a given
// object has been created by a particular factory function. It's kind of like a
// very light class inheritance interface.
//
// All Lintulista factory functions that want to identified in this way should add
// "...LL_BaseType(<typename>)" to their public interface, where <typename> is e.g.
// LL_Bird for the LL_Bird() factory. Each such factory should also implement the
// .is_parent_of() function - e.g. LL_Bird.is_parent_of() (see some of the existing
// factories for examples of how this function should behave).
export const LL_BaseType = function(type)
{
    ll_assert_native_type("function", type);

    knownTypes.push(type);

    return {
        [typeKey]: type,
    }
}

// Mark the given interface object as being of the given type (e.g. LL_Bird). This
// should only be called inside function factories on their interface object, rather
// than on objects generally.
LL_BaseType.assign = function(type, dstObject = {})
{
    ll_assert_native_type("function", type);
    ll_assert_native_type("object", dstObject);
    ll_assert(!dstObject.hasOwnProperty(typeKey), "Type key collision.");

    dstObject[typeKey] = type;
    knownTypes.push(type);

    return;
}

// Returns true if the given object inherits from the base type; false otherwise.
LL_BaseType.is_known_type = function(type)
{
    return (knownTypes.includes(type) &&
            (typeof type.is_parent_of === "function"));
}

// Returns the underlying type of the given object, or null if the object
// has no recognizable type. For instance, type_of(LL_Bird(...)) === LL_Bird,
// but type_of({a:1,b_2} === null.
LL_BaseType.type_of = function(object = {})
{
    if ((typeof object !== "object") ||
        !object.hasOwnProperty(typeKey))
    {
        return null;
    }

    return object[typeKey];
}
