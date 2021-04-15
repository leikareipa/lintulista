/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {LL_Action} from "./action.js";
import {ll_assert_native_type} from "./assert.js";

export const lla_log_out = LL_Action({
    failMessage: "Logout failed",
    act: async function({backend})
    {
        ll_assert_native_type("object", backend);

        await backend.logout();
    },
});
