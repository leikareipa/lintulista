/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 */

"use strict";

import {error, panic_if_undefined, warn, panic_if_not_type} from "./assert.js";
import {observation} from "./observation.js";
import {bird} from "./bird.js";

// Provides mediated access to the given list's data in Lintulista's backend.
export async function backend_access({listId})
{
    const backendAddress = Object.freeze(
    {
        deleteObservation: "./server/remove-observation.php",
        postObservation: "./server/post-observation.php",
        backendLimits: "./server/get-backend-limits.php",
        observations: "./server/get-observations.php",
        knownBirds: "./server/get-known-birds-list.php",
    });

    const backendLimits = Object.freeze(await http_fetch_backend_limits());

    const localCache =
    {
        knownBirds: Object.freeze([]),
        observations: Object.freeze([]),

        refresh: async function()
        {
            await this.refresh_known_birds();
            await this.refresh_observations();
        },

        refresh_observations: async function()
        {
            this.observations = Object.freeze(await http_fetch_observations());
        },

        refresh_known_birds: async function()
        {
            this.knownBirds = Object.freeze(await http_fetch_known_birds_list());
        }
    };
    await localCache.refresh();

    const publicInterface =
    {
        known_birds: ()=>localCache.knownBirds,
        observations: ()=>localCache.observations,
        backend_limits: ()=>backendLimits,

        is_known_bird_species,

        // Removes the given observation from the server-side list of observations. Updates
        // the local cache of observations, accordingly. Returns true if successful; false
        // otherwise.
        delete_observation: async(existingObservation)=>
        {
            const deletedSuccessfully = await http_delete_observation(existingObservation);

            if (!deletedSuccessfully)
            {
                error("Failed to delete an observation.");
                return false;
            }

            await localCache.refresh_observations();

            return true;
        },

        // Appends the given observation to the server-side list of observations. Updates
        // the local cache of observations, accordingly. Returns true if successful; false
        // otherwise.
        post_observation: async(newObservation)=>
        {
            panic_if_undefined(newObservation, newObservation.bird, newObservation.unixTimestamp);

            const addedSuccessfully = await http_post_observation(newObservation);
            
            if (!addedSuccessfully)
            {
                error("Failed to add a new observation.");
                return false;
            }

            await localCache.refresh_observations();

            return true;
        },
    };

    return publicInterface;

    // Returns true if the given bird species name is recognized and valid; false otherwise.
    function is_known_bird_species(species)
    {
        return Boolean(localCache.knownBirds.map(b=>b.species.toLowerCase()).includes(species.toLowerCase()));
    }

    // Performs the given async fetch and returns an array of the following kind:
    //
    //     [wasSuccessful, data]
    //
    // The 'wasSuccessful' variable is a boolean describing whether the fetch succeeded;
    // and the 'data' variable returns the response data, if any. If the fetch failed,
    // 'data' will be null, and an error message may be printed into the console.
    //
    async function http_fetch(url, params)
    {
        panic_if_not_type("string", url);
        panic_if_not_type("object", params);

        return fetch(url, params)
                .then(response=>
                {
                    return (response.ok? response.json() : undefined);
                })
                .then(ticket=>
                {
                    if (!ticket)
                    {
                        return [false, null];
                    }

                    if (!ticket.valid)
                    {
                        throw (ticket.message? ticket.message : "unknown");
                    }

                    return [true, ticket.data];
                })
                .catch(errorMessage=>
                {
                    error(`Client-to-server query for "${url}" failed. Cause: ${errorMessage}`);
                    return [false, null];
                });
    }

    async function http_delete_observation(observation)
    {
        panic_if_undefined(observation, observation.unixTimestamp, observation.bird);

        const postData =
        {
            species: observation.bird.species,
        };

        const [wasSuccessful,] = await http_fetch(`${backendAddress.deleteObservation}?list=${listId}`,
        {
            method: "POST",
            cache: "no-store",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(postData),
        });

        return wasSuccessful;
    }

    // Submits the given bird as an observation to be appended to the given list. Returns
    // true if succeeded; false otherwise.
    async function http_post_observation(observation)
    {
        panic_if_undefined(observation, observation.unixTimestamp, observation.bird);

        const postData =
        {
            species: observation.bird.species,
            timestamp: observation.unixTimestamp,
            place: observation.place,
        };

        const [wasSuccessful,] = await http_fetch(`${backendAddress.postObservation}?list=${listId}`,
        {
            method: "POST",
            cache: "no-store",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(postData),
        });

        return wasSuccessful;
    }

    // Returns as an array of observation() objects the observations associated with the
    // current list; or, on failure, an empty array.
    async function http_fetch_observations()
    {
        const [wasSuccessful, responseData] = await http_fetch(`${backendAddress.observations}?list=${listId}`,
        {
            cache: "no-store",
        });

        if (wasSuccessful)
        {
            const observationData = JSON.parse(responseData);

            observationData.filter(obs=>!is_known_bird_species(obs.species))
                           .forEach(unknownObs=>
            {
                warn(`Unknown bird in the observation list: ${unknownObs.species}. Skipping it.`); 
            });

            return observationData.filter(obs=>is_known_bird_species(obs.species))
                                  .map(obs=>observation(
            {
                bird: localCache.knownBirds.find(b=>b.species === obs.species),
                date: new Date(obs.timestamp*1000),
                place: obs.place,
            }));
        }
        else
        {
            return [];
        }
    }

    // Returns a list of the birds recognized by Lintulista. Birds not on this list can't
    // be added as observations. The list will be returned as an array of bird() objects;
    // or, on failure, as an empty array.
    async function http_fetch_known_birds_list()
    {
        const [wasSuccessful, responseData] = await http_fetch(backendAddress.knownBirds,
        {
            cache: "no-store",
        });

        if (wasSuccessful)
        {
            const birdData = JSON.parse(responseData);

            if (typeof birdData.birds === "undefined")
            {
                throw "Missing required data in the master bird list.";
            }

            return birdData.birds.map(b=>bird(
            {
                order: b.order,
                family: b.family,
                species: b.species,
                thumbnailUrl: (b.thumbnail? `http://www.luontoportti.com/suomi/images/${b.thumbnail}`
                                          : "./client/assets/images/null-bird-thumbnail.png"),
            }));
        }
        else
        {
            return [];
        }
    }

    // Returns as an object backend-enforced limits on certain things; e.g. the length of
    // the string describing the place of an observation.
    //
    // The return object will be of the following form:
    // 
    //     {
    //         limitA: ...,
    //         limitB: ...,
    //         limitC: ...,
    //         ...,
    //     }
    //
    async function http_fetch_backend_limits()
    {
        const [wasSuccessful, responseData] = await http_fetch(backendAddress.backendLimits,
        {
            cache: "no-store",
        });

        if (wasSuccessful)
        {
            return JSON.parse(responseData);
        }
        else
        {
            return {};
        }
    }
}
