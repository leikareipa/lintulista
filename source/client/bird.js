/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, expect_true} from "./assert.js";

// Represents a bird of a given kind, identified by its species name, family, and order.
export function Bird(args = {})
{
    panic_if_not_type("object", args);
    panic_if_not_type("string", args.species);

    // The generic image to be displayed for this bird's thumbnail if no specific image
    // URL was provided.
    const nullThumbnailUrl = "./img/null-bird-thumbnail.png";

    const publicInterface = Object.freeze(
    {
        species: args.species,
        order: (args.order || "Tuntematon"),
        family: (args.family || "Tuntematon"),
        thumbnailUrl: (args.thumbnailUrl || nullThumbnailUrl),
        nullThumbnailUrl
    });
    
    return publicInterface;
}

Bird.clone = function(bird = Bird)
{
    panic_if_not_type("object", bird);
    panic_if_not_type("string", bird.species, bird.family, bird.order);

    return Bird({
        species: bird.species,
        family: bird.family,
        order: bird.order,
        thumbnailUrl: bird.thumbnailUrl,
    });
}

// Runs basic tests on this unit. Returns true if all tests passed; false otherwise.
Bird.test = ()=>
{
    const bird = Bird({species:"Test1", family:"Test2", order:"Test3", thumbnailUrl:"Test4"});

    return expect_true([()=>(Object.isFrozen(bird)),
                        ()=>(bird.species === "Test1"),
                        ()=>(bird.family === "Test2"),
                        ()=>(bird.order === "Test3"),
                        ()=>(bird.thumbnailUrl === "Test4")]);
}
