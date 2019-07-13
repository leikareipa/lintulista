/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

export function bird(args = {})
{
    args = {...bird.defaultArgs, ...args}

    const publicInterface = Object.freeze(
    {
        name: args.name,
        thumbnailUrl: args.thumbnailUrl,
    });
    
    return publicInterface;
}

bird.defaultArgs = 
{
    name: "?",
    thumbnailUrl: "",
}
