/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {warn, panic_if_undefined} from "../assert.js";

export function observation(args = {})
{
    panic_if_undefined(args.date, args.bird);
    
    if (!(args.date instanceof Date))
    {
        warn("Invalid date for the observation.");
        return false;
    }

    const publicInterface = Object.freeze(
    {
        bird: args.bird,
        date: args.date,
    });
    
    return publicInterface;
}
