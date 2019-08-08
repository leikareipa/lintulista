/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "./assert.js";

export function bird(args = {})
{
    panic_if_not_type("object", args);
    panic_if_not_type("string", args.species, args.family, args.order);

    // The generic image to be displayed for this bird's thumbnail if no specific image
    // URL was provided.
    const nullThumbnailUrl = "./client/assets/images/null-bird-thumbnail.png";

    if (!args.thumbnailUrl)
    {
        args.thumbnailUrl = nullThumbnailUrl;
    }

    const publicInterface = Object.freeze(
    {
        order: args.order,
        family: args.family,
        species: args.species,
        thumbnailUrl: args.thumbnailUrl,
        nullThumbnailUrl
    });
    
    return publicInterface;
}
