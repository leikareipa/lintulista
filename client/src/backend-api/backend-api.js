/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 */

"use strict";

import {error, panic_if_undefined} from "../assert.js";
import {bird} from "../bird/bird.js";

export function backend_api({listId})
{
    const backendAddress = Object.freeze(
    {
        knownBirds: "./server/get-known-birds-list.php",
        observations: "./server/get-observations.php",
        postObservation: "./server/add-observation.php",
    });

    const publicInterface =
    {
        // Submits the given bird as an observation to be appended to the given list. Will
        // return the given observation object, with the 'success' property set to true if
        // the observation was successfully added and false otherwise.
        post_observation: async(observation = {})=>
        {
            panic_if_undefined(observation.birdName, observation.timestamp);

            const fail =  {...observation, addedSuccessfully:false};
            const success = {...observation, addedSuccessfully:true};

            return fetch(`${backendAddress.postObservation}?list=${listId}`,
                   {
                       method: "POST",
                       cache: "no-store",
                       headers: {"Content-Type": "application/json"},
                       body: JSON.stringify(
                       {
                           birdName: observation.birdName,
                           timestamp: observation.timestamp,
                       }),
                   })
                   .then(response=>
                   {
                       return (response.ok? response.json() : null);
                   })
                   .then(ticket=>
                   {
                       if (!ticket)
                       {
                           return fail;
                       }

                       if (!ticket.valid)
                       {
                           throw (ticket.message? ticket.message : "unknown");
                       }

                       return success;
                   })
                   .catch(errorMessage=>
                   {
                       error(`Client-to-server query for "${backendAddress.postObservation}" failed. Cause: ${errorMessage}`);
                       return fail;
                   });
        },

        // Returns the observations associated with the given list. The observations will
        // be returned as an array of objects, like so:
        //
        //     [
        //         {birdName, timestamp},
        //         {birdName, timestamp},
        //         ...
        //     ]
        //
        // The 'birdName' property gives the name of the bird observed; and the 'timestamp'
        // property the time of the observation as a Unix epoch value.
        //
        // As such, the array returned might be akin to the following:
        //
        //     [
        //         {
        //             birdName: "Harakka",
        //             timestamp: 1563090679
        //         },
        //         ...
        //     ]
        //
        // If the fetching fails, an empty array will be returned.
        //
        fetch_observations: async()=>
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

                       return JSON.parse(ticket.data);
                   })
                   .catch(errorMessage=>
                   {
                       error(`Client-to-server query for "${backendAddress.observations}" failed. Cause: ${errorMessage}`);
                       return [];
                   });
        },

        // Returns a list of the bird names Lintulista recognizes. The list will be returned
        // as an array of objects, like so:
        //
        //     [
        //         {name, thumbnailUrl},
        //         {name, thumbnailUrl},
        //         ...
        //     ]
        //
        // The 'name' property gives the name of the bird as a string; and the 'thumbnailUrl'
        // a full URL pointing to an image file that can be displayed as a user-facing thumb-
        // nail for that bird.
        //
        // As such, you might expect the return array to resemble something like this:
        //
        //     [
        //         {
        //             name: "Harakka",
        //             thumbnailUrl: "https://www.somewebsite.ch/birds/harakka.jpg"
        //         },
        //         ...
        //     ]
        //
        // If the fetching fails, an empty array will be returned.
        //
        fetch_known_birds_list: async()=>
        {
            return fetch(backendAddress.knownBirds)
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
                           name: b.name,
                           thumbnailUrl: `http://www.luontoportti.com/suomi/images/${b.thumbnail}`,
                       }));
                   })
                   .catch(errorMessage=>
                   {
                       error(`Client-to-server query for "${backendAddress.knownBirds}" failed. Cause: ${errorMessage}`);
                       return [];
                   });
        }
    };

    return publicInterface;
}
