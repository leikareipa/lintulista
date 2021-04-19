/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {LL_Action} from "./action.js";
import {ll_assert_native_type} from "./assert.js";
import {darken_viewport} from "./darken-viewport.js";
import {store} from "./redux-store.js";

const dialogContainerClass = "ll-dialog-container";

// Renders a modal dialog component into a new <div> container. Closes the dialog
// and deletes the container when the user accepts or rejects the dialog.
//
// The 'dialog' property defines which React dialog component is to be displayed.
//
// The 'args' property allows arguments to be passed to the dialog. These will
// be available as 'props.args' in the dialog component.
//
// The action will return the dialog's 'props.return' object; or null if
// the dialog is canceled.
//
export const lla_open_dialog = LL_Action({
    failMessage: "Failed to execute a dialog",
    act: async function({dialog, args = {}})
    {
        ll_assert_native_type("function", dialog);
        ll_assert_native_type("object", args);

        const dialogContainer = document.createElement("div");
        ll_assert_native_type(Element, dialogContainer);

        dialogContainer.className = `${dialogContainerClass} ${dialog.name}`;

        await darken_viewport({z:110, opacity:0.5});

        const dataFromDialog = await new Promise(resolve=>
        {
            const dataReturned = {};

            const dialogElement = React.createElement(dialog, {
                args,
                return: dataReturned,
                onAccept: ()=>resolve(dataReturned),
                onReject: ()=>resolve(null),
            });

            document.body.appendChild(dialogContainer);

            ReactDOM.render(<ReactRedux.Provider
                                store={store}>
                    
                                {dialogElement}
                    
                            </ReactRedux.Provider>,
                            dialogContainer);


        });

        return dataFromDialog;
    }
});
