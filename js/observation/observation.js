/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {warn} from "../assert.js";
import {bird} from "../bird/bird.js";

export function observation(bird, date)
{
    if (!(date instanceof Date))
    {
        warn("Invalid date for the observation.");
        return false;
    }

    const publicInterface = Object.freeze(
    {
        bird,
        date,
    });
    
    return publicInterface;
}
