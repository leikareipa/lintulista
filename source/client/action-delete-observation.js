/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ConfirmObservationDeletion} from "./react-components/dialogs/ConfirmObservationDeletion.js";
import {LL_Observation} from "./observation.js";
import {LL_Bird} from "./bird.js";
import {LL_Action} from "./action.js";
import {LL_Backend} from "./backend.js";
import {lla_exec_dialog} from "./action-exec-dialog.js";
import {ll_assert_type} from "./assert.js";

export const lla_delete_observation = LL_Action({
    failMessage: "Failed to delete the observation",
    act: async function({bird, backend})
    {
        ll_assert_type(LL_Bird, bird);
        ll_assert_type(LL_Backend, backend);

        const observation = LL_Observation({species: bird.species});

        const userGivesConsent = await lla_exec_dialog.async_nocatch({
            dialog: ConfirmObservationDeletion,
            args: {observation}
        });

        if (userGivesConsent) {
            await backend.delete_observation(observation);
        }

        return;
    },
});
