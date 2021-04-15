/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {QueryNewObservationDate} from "./react-components/dialogs/QueryNewObservationDate.js";
import {lla_exec_dialog} from "./action-exec-dialog.js";
import {LL_Observation} from "./observation.js";
import {LL_Action} from "./action.js";
import {ll_assert_native_type,
        ll_assert_type} from "./assert.js";

export const lla_change_observation_date = LL_Action({
    failMessage: "Failed to change the observation date",
    act: async function({observation, backend})
    {
        ll_assert_type(LL_Observation, observation);
        ll_assert_native_type("object", backend);

        const newDate = await lla_exec_dialog.async({
            dialog: QueryNewObservationDate,
            args: {observation}
        }, true);

        if (newDate) {
            const modifiedObservation = LL_Observation({
                species: observation.species,
                day: newDate.day,
                month: newDate.month,
                year: newDate.year,
            });

            await backend.add_observation(modifiedObservation);
        }
    },
});
