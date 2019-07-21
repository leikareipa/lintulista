/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "./assert.js";

export function bird(args = {})
{
    panic_if_undefined(args.name, args.thumbnailUrl, args.family, args.order);

    const publicInterface = Object.freeze(
    {
        name: args.name,
        order: args.order,
        family: args.family,
        thumbnailUrl: args.thumbnailUrl,
    });
    
    return publicInterface;
}
