/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 * The only exported object is backend_access().
 * 
 */

"use strict";

import {error, panic_if_undefined, warn, panic_if_not_type} from "./assert.js";
import {observation} from "./observation.js";
import {bird} from "./bird.js";

// Functions that interact with Lintulista's backend via HTTP.
const httpRequests = Object.freeze(
{
    // All of Lintulista's URLs for client-to-backend HTTP requests.
    backendURLs: Object.freeze(
    {
        deleteObservation: "./server/delete-observation.php",
        getBackendLimits: "./server/get-backend-limits.php",
        postObservation: "./server/put-observation.php",
        getObservations: "./server/get-observations.php",
        getKnownBirds: "./server/get-known-birds-list.php",
        createList: "./server/create-new-list.php",
        getViewKey: "./server/get-view-key.php",
    }),

    // Performs an async fetch on the given URL and with the given parameters (corresponding
    // to fetch()'s 'init' parameter), and returns an array of the following kind:
    //
    //     [wasSuccessful, data]
    //
    // The 'wasSuccessful' variable is a boolean describing whether the fetch succeeded;
    // and the 'data' variable returns the response data, if any. If the fetch failed,
    // 'data' will be null, and an error message may be printed into the console.
    //
    send_request: function(url, params = {})
    {
        panic_if_not_type("string", url);
        panic_if_not_type("object", params);

        return fetch(url, params)
                .then(response=>
                {
                    if (!response.ok)
                    {
                        throw response.statusText;
                    }

                    return response.json();
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
    },

    delete_observation: async function(listKey, observation)
    {
        panic_if_undefined(observation, observation.unixTimestamp, observation.bird);

        const [wasSuccessful,] = await this.send_request(`${this.backendURLs.deleteObservation}?list=${listKey}`,
        {
            method: "DELETE",
            body: JSON.stringify({
                key: listKey,
                species: observation.bird.species,
            }),
        });

        return wasSuccessful;
    },

    // Returns the view key associated with the given edit key.
    get_view_key: async function(listKey)
    {
        panic_if_not_type("string", listKey);

        const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.getViewKey}?list=${listKey}`,
        {
            method: "GET",
        });

        if (wasSuccessful)
        {
            const data = JSON.parse(responseData);

            panic_if_not_type("string", data.view_key);

            return data.view_key;
        }
        else
        {
            panic("Failed to fetch the view key from the server.");
        }
    },

    // Returns a list of the birds recognized by Lintulista. Birds not on this list can't
    // be added as observations. The list will be returned as an array of bird() objects;
    // or, on failure, as an empty array.
    get_known_birds_list: async function()
    {
        const [wasSuccessful, responseData] = await this.send_request(this.backendURLs.getKnownBirds,
        {
            method: "GET",
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
    },

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
    get_backend_limits: async function()
    {
        const [wasSuccessful, responseData] = await this.send_request(this.backendURLs.getBackendLimits,
        {
            method: "GET",
        });

        if (wasSuccessful)
        {
            return JSON.parse(responseData);
        }
        else
        {
            return {};
        }
    },

    // Returns as an array of observation() objects the observations associated with the
    // given list; or, on failure, an empty array. You should provide as the second parameter
    // a list of the birds accepted as valid observees. Any observations submitted from the
    // server that are not found on this list will be ignored.
    get_observations: async function(listKey, knownBirds = [])
    {
        panic_if_not_type("string", listKey);
        panic_if_not_type("object", knownBirds)

        const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.getObservations}?list=${listKey}`,
        {
            method: "GET",
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
                bird: knownBirds.find(b=>(b.species === obs.species)),
                date: new Date(obs.timestamp*1000),
                place: obs.place,
            }));
        }
        else
        {
            return [];
        }

        // Returns true if the given bird species name is recognized and valid; false otherwise.
        function is_known_bird_species(species)
        {
            return Boolean(knownBirds.map(b=>b.species.toLowerCase()).includes(species.toLowerCase()));
        }
    },

    // Submits the given bird as an observation to be appended to the given list. Returns
    // true if succeeded; false otherwise.
    put_observation: async function(listKey, observation)
    {
        panic_if_not_type("string", listKey);
        panic_if_not_type("object", observation, observation.bird);
        panic_if_undefined(observation.unixTimestamp);

        const [wasSuccessful,] = await this.send_request(`${this.backendURLs.postObservation}?list=${listKey}`,
        {
            method: "PUT",
            body: JSON.stringify({
                species: observation.bird.species,
                timestamp: observation.unixTimestamp,
                place: observation.place,
            }),
        });

        return wasSuccessful;
    },

    // Asks the backend to create a new list. If a new list was successfully created, returns
    // an object of the following kind:
    //
    //     {
    //         viewKey: "...",
    //         editKey: "...",
    //     }
    //
    // If a new list could not be created, returns false.
    //
    create_new_list: async function()
    {
        const [wasSuccessful, responseData] = await this.send_request(this.backendURLs.createList,
        {
            method: "POST",
        });

        if (wasSuccessful)
        {
            return JSON.parse(responseData).keys;
        }
        else
        {
            return false;
        }
    },
});

// Provides mediated access to the given list's data in Lintulista's backend.
export async function backend_access(listKey)
{
    const backendLimits = Object.freeze(await httpRequests.get_backend_limits());

    // Do a basic client-side check for whether the given key has edit rights. Note that
    // this does not necessarily reflect whether the server would allow this key to make
    // edits, nor does its value enable the client to make server-side changes; it's
    // rather just a shortcut for certain client-side UI matters etc.
    const hasEditRights = (()=>
    {
        /// TODO: Make a better check. But for now, since edit keys are quite long, while
        /// non-edit keys are short, we can approximate based on key length.
        return Boolean(listKey.length > 15);
    })();

    // If the user is editing the list with an edit key, we also want to inform them of
    // the more publically sharable view key. For that, we need to fetch the view key from
    // the server.
    const viewKey = await (async()=>
    {
        // The list key is the view key if it has no edit rights.
        if (!hasEditRights)
        {
            return listKey;
        }

        return httpRequests.get_view_key(listKey);
    })();

    // We'll cache some server responses here, so that their elements can be queried in-
    // code without invoking the browser's cache every time. 
    const localCache =
    {
        knownBirds: Object.freeze([]),
        observations: Object.freeze([]),

        refresh: async function()
        {
            await this.refresh_known_birds();
            await this.refresh_observations();
        },

        refresh_known_birds: async function()
        {
            this.knownBirds = await httpRequests.get_known_birds_list();
        },

        refresh_observations: async function()
        {
            this.observations = await httpRequests.get_observations(listKey, this.knownBirds);
        }
    };
    await localCache.refresh();

    const publicInterface =
    {
        hasEditRights,
        viewKey,

        known_birds: ()=>localCache.knownBirds,
        observations: ()=>localCache.observations,
        backend_limits: ()=>backendLimits,

        // Removes the given observation from the server-side list of observations. Updates
        // the local cache of observations, accordingly. Returns true if successful; false
        // otherwise.
        delete_observation: async(existingObservation)=>
        {
            panic_if_not_type("string", listKey);
            panic_if_not_type("object", existingObservation);

            const obsIdx = localCache.observations.findIndex(obs=>(obs.bird.species === existingObservation.bird.species));

            if (obsIdx === -1)
            {
                error("Can't delete an unknown observation.");
                return false;
            }

            const deletedSuccessfully = await httpRequests.delete_observation(listKey, existingObservation);

            if (!deletedSuccessfully)
            {
                error("Failed to delete an observation.");
                return false;
            }

            localCache.observations.splice(obsIdx, 1);

            return true;
        },

        // Appends the given observation to the server-side list of observations. Updates
        // the local cache of observations, accordingly. Returns true if successful; false
        // otherwise.
        put_observation: async(newObservation)=>
        {
            panic_if_undefined(newObservation, newObservation.bird, newObservation.unixTimestamp);

            const obsIdx = localCache.observations.findIndex(obs=>(obs.bird.species === newObservation.bird.species));

            const postedSuccessfully = await httpRequests.put_observation(listKey, newObservation);
            
            if (!postedSuccessfully)
            {
                error("Failed to POST an observation.");
                return false;
            }

            localCache.observations.splice(obsIdx, (obsIdx !== -1), newObservation);

            return true;
        },
    };

    return publicInterface;
}

// Convenience aliases.
backend_access.create_new_list = ()=>httpRequests.create_new_list();
backend_access.get_known_birds_list = ()=>httpRequests.get_known_birds_list();
