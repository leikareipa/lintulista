/*
 * 2019, 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 * Provides functions for client-to-backend interaction.
 * 
 */

"use strict";

import {tr} from "./translator.js";
import {public_assert,
        error,
        panic_if_undefined,
        panic_if_not_type} from "./assert.js";
import {Observation} from "./observation.js";
import {BackendRequest} from "./backend-request.js";
import {Bird} from "./bird.js";

// Provides mediated access to the given list's data in Lintulista's backend.
export async function BackendAccess(listKey, reduxStore)
{
    const knownBirds = Object.freeze(await BackendRequest.get_known_birds_list());

    const observations = (await BackendRequest.get_observations(listKey)).map(obs=>Observation({
        bird: knownBirds.find(b=>(b.species === obs.species)),
        date: new Date(), /// TODO.
    }));

    reduxStore.dispatch({
        type: "set-observations",
        observations: observations.reduce((list, obs)=>{
            list.push(Observation.clone(obs));
            return list;
        }, [])
    });

    reduxStore.dispatch({
        type: "set-known-birds",
        knownBirds: knownBirds.reduce((list, bird)=>{
            list.push(Bird.clone(bird));
            return list;
        }, [])
    });

    let loginToken = null;
    let loginValidUntil = undefined;

    // Public interface functions will throw on error.
    const publicInterface =
    {
        login: async function(username, password)
        {
            const loginDetails = await BackendRequest.login(listKey, username, password);
            
            public_assert(loginDetails, tr("Login failed"));

            public_assert(((typeof loginDetails.token === "string") &&
                           (typeof loginDetails.until === "number")),
                          tr("Invalid server response"));

            loginToken = loginDetails.token;
            loginValidUntil = loginDetails.until;
            reduxStore.dispatch({type: "set-logged-in", isLoggedIn: true});

            return;
        },

        logout: async function()
        {
            public_assert((loginToken !== null), tr("Not logged in."));

            public_assert(await BackendRequest.logout(listKey, loginToken),
                          tr("Logout failed"));

            loginToken = null;
            loginValidUntil = undefined;
            reduxStore.dispatch({type: "set-logged-in", isLoggedIn: false});

            return;
        },

        // Removes the given observation from the server-side list of observations. Updates
        // the local cache of observations, accordingly. Returns true if successful; false
        // otherwise.
        delete_observation: async function(observation = Observation)
        {
            panic_if_not_type("string", listKey);
            panic_if_not_type("object", observation);

            const obsIdx = observations.findIndex(obs=>(obs.bird.species === observation.bird.species));
            public_assert((obsIdx >= 0), tr("Unrecognized observation data"));

            const wasSuccess = await BackendRequest.delete_observation(observation, listKey, loginToken);
            public_assert(wasSuccess, tr("Failed to remove the observation"));

            reduxStore.dispatch({
                type: "delete-observation",
                observation: observation,
            });

            observations.splice(obsIdx, 1);

            return;
        },

        // Appends the given observation to the server-side list of observations. If an
        // observation of this species already exists, it'll be updated with this new info.
        // Returns true if successful; false otherwise.
        add_observation: async function(observation = Observation)
        {
            panic_if_not_type("object", observation,
                                        observation.bird);

            const obsIdx = observations.findIndex(obs=>(obs.bird.species === observation.bird.species));
            const isExistingObservation = (obsIdx >= 0);
            const wasSuccess = await BackendRequest.put_observation(observation, listKey, loginToken);

            public_assert(wasSuccess,
                          tr(isExistingObservation
                             ? "Failed to update the observation"
                             : "Failed to add the observation"));
            
            reduxStore.dispatch({
                type: "add-observation",
                observation,
            });

            observations.splice(obsIdx, (obsIdx !== -1), observation);

            return;
        },
    };

    return publicInterface;
}

// Convenience aliases.
BackendAccess.create_new_list = BackendRequest.create_new_list;
BackendAccess.get_known_birds_list = BackendRequest.get_known_birds_list;
