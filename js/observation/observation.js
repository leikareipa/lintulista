/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {warn} from "../assert.js";
import {bird} from "../bird/bird.js";

export function observation(birdName, dateObserved, dateAdded)
{
    if (!(dateAdded instanceof Date))
    {
        warn("Invalid creation date for an observation.");
        return false;
    }

    if (!(dateObserved instanceof Date))
    {
        warn("Invalid obsevation date. Resetting it.");
        return false;
    }

    if (typeof birdName !== "string")
    {
        warn("Expected the bird name to be a string.");
        return false;
    }

    const observedBird = bird(birdName);

    if (!observedBird)
    {
        return false;
    }

    const publicInterface = Object.freeze(
    {
        bird: observedBird,
        dateObserved,
        dateAdded,
    });
    
    return publicInterface;
}
