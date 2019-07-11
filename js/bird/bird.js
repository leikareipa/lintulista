/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

export function bird(birdName = "")
{
    /// TODO: Check to make sure the bird's name is valid.

    const publicInterface = Object.freeze(
    {
        birdName,
    });
    
    return publicInterface;
}
