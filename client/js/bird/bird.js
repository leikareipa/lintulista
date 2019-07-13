/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../assert.js";

export function bird(args = {})
{
    panic_if_undefined(args.name, args.thumbnailUrl);

    const publicInterface = Object.freeze(
    {
        name: args.name,
        thumbnailUrl: args.thumbnailUrl,
    });
    
    return publicInterface;
}
