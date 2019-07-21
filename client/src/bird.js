/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "./assert.js";

export function bird(args = {})
{
    panic_if_undefined(args.species, args.thumbnailUrl, args.family, args.order);

    const publicInterface = Object.freeze(
    {
        order: args.order,
        family: args.family,
        species: args.species,
        thumbnailUrl: args.thumbnailUrl,
    });
    
    return publicInterface;
}
