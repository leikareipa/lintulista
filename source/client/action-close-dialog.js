/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {LL_Action} from "./action.js";
import {ll_assert_native_type} from "./assert.js";

const dialogContainerClass = "ll-modal-dialog";

// Closes the React dialog component identified by 'dialog'. Does nothing if
// a dialog of that kind isn't open.
export const lla_close_dialog = LL_Action({
    failMessage: "Failed to close dialogs",
    act: async function({dialog})
    {
        ll_assert_native_type("function", dialog);

        const dialogs = document.querySelectorAll(`.${dialogContainerClass}.${dialog.name}`);

        for (let i = 0; i < dialogs.length; i++) {
            dialogs[i].remove();
        }

        // Remove any shades. This is kind of a kludge for now, until we can
        // more accurately identify which shades are associated with the
        // specific dialog we're closing.
        {
            const shades = Array.from(document.querySelectorAll("[id^=shades-generated]"));

            for (const shade of shades) {
                shade.remove();
            }
        }

        return;
    }
});
