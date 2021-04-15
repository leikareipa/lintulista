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
import {lla_exec_dialog} from "./action-exec-dialog.js";
import {ll_assert_type} from "./assert.js";

export const lla_log_in = LL_Action({
    failMessage: "Login failed",
    act: async function({backend})
    {
        ll_assert_type(LL_Backend, backend);

        const credentials = await lla_exec_dialog.async({
            dialog: QueryLoginCredentials
        }, true);

        if (credentials) {
            await backend.login(credentials.username, credentials.password);
        }

        return;
    },
});
