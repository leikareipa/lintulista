/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {LL_Observation} from "./observation.js";
import {LL_Bird} from "./bird.js";
import {LL_Action} from "./action.js";
import {ll_assert_native_type,
        ll_assert_type} from "./assert.js";

export const lla_add_observation = LL_Action({
    failMessage: "Failed to add the observation",
    act: async function({bird, backend})
    {
        ll_assert_type(LL_Bird, bird);
        ll_assert_native_type("object", backend);

        const date = new Date();

        const observation = LL_Observation({
            species: bird.species,
            day: date.getDate(),
            month: (date.getMonth() + 1),
            year: date.getFullYear(),
        });

        await backend.add_observation(observation)
    },
});
