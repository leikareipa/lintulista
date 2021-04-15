/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {QueryLoginCredentials} from "./react-components/dialogs/QueryLoginCredentials.js";
import {LL_Action} from "./action.js";
import {LL_Backend} from "./backend.js";
import {lla_open_dialog} from "./action-open-dialog.js";
import {lla_close_dialog} from "./action-close-dialog.js";
import {ll_assert_type} from "./assert.js";
import {ll_message_popup} from "./message-popup.js";

export const lla_log_in = LL_Action({
    failMessage: "Login failed",
    act: async function({backend})
    {
        ll_assert_type(LL_Backend, backend);

        const credentials = await lla_open_dialog.async({
            dialog: QueryLoginCredentials
        }, true);

        if (credentials) {
            await backend.login(credentials.username, credentials.password);
            ll_message_popup("Logged in");
        }

        return;
    },
    // We close the dialog only after the action has finished, with the dialog's
    // async spinner indicating to the user in the meantime that the action is ongoing.
    finally: async function()
    {
        await lla_close_dialog.async({
            dialog: QueryLoginCredentials,
        });
    }
});
