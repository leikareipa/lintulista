/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 */

"use strict";

import {error, panic_if_undefined, warn} from "./assert.js";
import {observation} from "./observation.js";
import {bird} from "./bird.js";

// Provides mediated access to the given list's data in Lintulista's backend.
export async function backend_access({listId})
{
    const backendAddress = Object.freeze(
    {
        knownBirds: "./server/get-known-birds-list.php",
        observations: "./server/get-observations.php",
        postObservation: "./server/post-observation.php",
        deleteObservation: "./server/remove-observation.php",
    });

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

    async function http_delete_observation(observation)
    {
        panic_if_undefined(observation, observation.unixTimestamp, observation.bird);

        const postData =
        {
            species: observation.bird.species,
        }

        return fetch(`${backendAddress.deleteObservation}?list=${listId}`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(postData),
                })
                .then(response=>
                {
                    return (response.ok? response.json() : false);
                })
                .then(ticket=>
                {
                    if (!ticket)
                    {
                        return false;
                    }

                    if (!ticket.valid)
                    {
                        throw (ticket.message? ticket.message : "unknown");
                    }

                    return true;
                })
                .catch(errorMessage=>
                {
                    error(`Client-to-server query for "${backendAddress.deleteObservation}" failed. Cause: ${errorMessage}`);
                    return false;
                });
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
        }

        return fetch(`${backendAddress.postObservation}?list=${listId}`,
                {
                    method: "POST",
                    cache: "no-store",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(postData),
                })
                .then(response=>
                {
                    return (response.ok? response.json() : false);
                })
                .then(ticket=>
                {
                    if (!ticket)
                    {
                        return false;
                    }

                    if (!ticket.valid)
                    {
                        throw (ticket.message? ticket.message : "unknown");
                    }

                    return true;
                })
                .catch(errorMessage=>
                {
                    error(`Client-to-server query for "${backendAddress.postObservation}" failed. Cause: ${errorMessage}`);
                    return false;
                });
    }

    // Returns as an array of observation() objects the observations associated with the
    // current list; or, on failure, an empty array.
    async function http_fetch_observations()
    {
        return fetch(`${backendAddress.observations}?list=${listId}`, {cache: "no-store"})
                .then(response=>
                {
                    if (!response.ok)
                    {
                        throw "Failed to load server-side observation data.";
                    }

                    return response.json();
                })
                .then(ticket=>
                {
                    if (!ticket.valid || (typeof ticket.data === "undefined"))
                    {
                        throw (ticket.message? ticket.message : "unknown");
                    }

                    const observationData = JSON.parse(ticket.data);

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
                })
                .catch(errorMessage=>
                {
                    error(`Client-to-server query for "${backendAddress.observations}" failed. Cause: ${errorMessage}`);
                    return [];
                });
    }

    // Returns a list of the birds recognized by Lintulista. Birds not on this list can't
    // be added as observations. The list will be returned as an array of bird() objects;
    // or, on failure, as an empty array.
    async function http_fetch_known_birds_list()
    {
        return fetch(backendAddress.knownBirds, {cache: "no-store"})
                .then(response=>
                {
                    if (!response.ok)
                    {
                        throw "Failed to load the master bird list from the server.";
                    }

                    return response.json();
                })
                .then(ticket=>
                {
                    if (!ticket.valid || (typeof ticket.data === "undefined"))
                    {
                        throw (ticket.message? ticket.message : "unknown");
                    }

                    const birdData = JSON.parse(ticket.data);

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
                })
                .catch(errorMessage=>
                {
                    error(`Client-to-server query for "${backendAddress.knownBirds}" failed. Cause: ${errorMessage}`);
                    return [];
                });
    }
}
