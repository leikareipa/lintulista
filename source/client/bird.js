/*
 * 2019, 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        expect_true,
        ll_assert} from "./assert.js";
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
    ll_assert(LL_Bird.is_parent_of(bird), "Invalid arguments.");
    return LL_Bird(bird.species);
}

// Runs basic tests on this unit. Returns true if all tests passed; false otherwise.
LL_Bird.test = ()=>
{
    const bird = Bird({species:"Test1", family:"Test2", order:"Test3", thumbnailUrl:"Test4"});

    return expect_true([()=>(Object.isFrozen(bird)),
                        ()=>(bird.species === "Test1"),
                        ()=>(bird.family === "Test2"),
                        ()=>(bird.order === "Test3"),
                        ()=>(bird.thumbnailUrl === "Test4")]);
}
