/*
 * 2019, 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        ll_assert_type,
        expect_true} from "./assert.js";
import {birdThumbnailFilename} from "./bird-thumbnail-filename.js";
import {LL_BaseType} from "./base-type.js";

export const LL_Bird = function(species = "")
{
    ll_assert_native_type("string", species);

    /// TODO: Verify that this is a known bird species.

    const publicInterface = Object.freeze({
        species,
        thumbnailUrl: birdThumbnailFilename.hasOwnProperty(species)
                      ? `./img/bird-thumbnails/${birdThumbnailFilename[species]}`
                      : LL_Bird.nullThumbnailUrl,

        ...LL_BaseType(LL_Bird)
    });
    
    return publicInterface;
}

LL_Bird.is_parent_of = function(candidate)
{
    return ((LL_BaseType.type_of(candidate) === LL_Bird) &&
            candidate.hasOwnProperty("species") &&
            candidate.hasOwnProperty("thumbnailUrl"));
}

LL_Bird.nullThumbnailUrl = "./img/null-bird-thumbnail.png";

LL_Bird.clone = function(bird = LL_Bird)
{
    ll_assert_type(LL_Bird, bird);
    return LL_Bird(bird.species);
}
