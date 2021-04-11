/*
 * 2019, 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert,
        panic_if_undefined,
        panic_if_not_type,
        panic} from "./assert.js";
import {birdThumbnailFilename} from "./bird-thumbnail-filename.js";
import {LL_Observation} from "./observation.js";
import {LL_Bird} from "./bird.js";

const backendURLs = {
    lists: "http://localhost:8080",
    login: "http://localhost:8080/login",
    metadata: "./server/api/metadata.php",
    knownBirdSpecies: "./server/metadata/known-birds.json",
};

export const BackendRequest = {
    // All of Lintulista's URLs for client-to-backend HTTP requests.
    

    // Performs an async fetch on the given URL and with the given parameters (corresponding
    // to fetch()'s 'init' parameter), and returns an array of the following kind:
    //
    //     [wasSuccessful, data]
    //
    // The 'wasSuccessful' variable is a boolean describing whether the fetch succeeded;
    // and the 'data' variable returns the response data, if any. If the fetch failed,
    // 'data' will be null, and an error message may be printed into the console.
    //
    make_request: function(url, params = {})
    {
        panic_if_not_type("string", url);
        panic_if_not_type("object", params);

        return fetch(url, params)
               .then(response=>{
                   if (!response.ok) {
                       throw response.statusText;
                   }
                    return response.json();
               })
               .then(ticket=>{
                   if (!ticket ||
                       !ticket.valid)
                   {
                       throw (ticket.message? ticket.message : "Unknown error.");
                   }

                   return [true, ticket.data];
               })
               .catch((errorMessage)=>{
                   console.error("Lintulista server error:", errorMessage);
                   return [false, null];
               });
    },

    login: async function(listKey, username, password)
    {
        const [wasSuccessful, responseData] = await this.make_request(`${backendURLs.login}?list=${listKey}`,
        {
            method: "POST",
            body: JSON.stringify({username, password}),
        });

        return (wasSuccessful? responseData : false);
    },

    logout: async function(listKey, token)
    {
        const [wasSuccessful,] = await this.make_request(`${backendURLs.login}?list=${listKey}`,
        {
            method: "DELETE",
            body: JSON.stringify({token}),
        });

        return wasSuccessful;
    },

    delete_observation: async function(observation, listKey, token)
    {
        panic_if_undefined(observation, listKey, token);

        const [wasSuccessful,] = await this.make_request(`${backendURLs.lists}?list=${listKey}`,
        {
            method: "DELETE",
            body: JSON.stringify({
                token,
                species: observation.species,
            }),
        });

        return wasSuccessful;
    },

    // Returns a list of the birds recognized by Lintulista. Birds not on this list can't
    // be added as observations. The list will be returned as an array of LL_Bird() objects;
    // or, on failure, as an empty array.
    get_known_birds_list: async function()
    {
        let response = await fetch(backendURLs.knownBirdSpecies);

        if (!response.ok) {
            panic(`The server responded with an error: ${response.statusText}`);
            return false;
        }
        else {
            response = await response.json();
        }

        panic_if_not_type("array", response.birds);

        return response.birds.map(b=>LL_Bird(b.species));
    },

    // Returns as an array of LL_Observation() objects the observations associated with the
    // given list; or, on failure, an empty array.
    get_observations: async function(listKey)
    {
        panic_if_not_type("string", listKey);

        const [wasSuccessful, responseData] = await this.make_request(`${backendURLs.lists}?list=${listKey}`,
        {
            method: "GET",
        });
        
        if (!wasSuccessful) {
            return [];
        }

        panic_if_not_type("array", responseData.observations);

        return responseData.observations.map(obs=>LL_Observation(obs));
    },

    // Submits the given bird as an observation to be appended to the given list. Returns
    // true if succeeded; false otherwise.
    put_observation: async function(observation = LL_Observation,
                                    listKey = "",
                                    token = "")
    {
        panic_if_not_type("string", listKey, token);
        ll_assert(LL_Observation.is_parent_of(observation), "Invalid arguments.");

        const [wasSuccessful,] = await this.make_request(`${backendURLs.lists}?list=${listKey}`,
        {
            method: "PUT",
            body: JSON.stringify({
                token,
                species: observation.species,
                day: observation.day,
                month: observation.month,
                year: observation.year,
            }),
        });

        return wasSuccessful;
    },
};
