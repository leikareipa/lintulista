/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "./assert.js";
import {animate} from "./animate.js";

// Renders a modal dialog component into a new <div> container. Closes the dialog and deletes
// the container when the user accepts or rejects the dialog.
//
// There are two ways to interact with the return value of the dialog via this function:
//
//     First, the function returns a Promise that resolves when the user closes the dialog.
//     If the dialog was rejected, null is returned; otherwise, a single parameter giving the
//     dialog's return data is returned. Note that the dialog element will be removed prior
//     to the Promise resolving.
//
//     Second, async callbacks for when the dialog is rejected/accepted can be given via
//     parameters.onAccept and parameters.onReject. The onReject callback receives no parameters,
//     while onAccept receives the dialog's return data as a single parameter. Both callbacks
//     are expected to return a Promise that resolves once the callback is finished.
//
//     The benefit of using callbacks is that they can access the dialog's return data prior
//     to the dialog element being removed. The dialog will not be removed before the respective
//     callback's Promise resolves.
//
// The dialog component to be rendered should be provided via 'dialog', which should be a
// React component that calls props.onDialogAccept/props.onDialogReject when the dialog is
// ready to be closed and unrendered.
//
// The parameters (props) to be passed to the dialog component are given via args.parameters;
// which should be an object containing the desired parameters.
// 
export function open_modal_dialog(dialog, parameters = {})
{
    panic_if_undefined(dialog);

    const dialogContainer = document.createElement("div");

    return new Promise(resolve=>
    {
        if (!dialogContainer)
        {
            panic("Can't find the container to render the observation list into.");
            return;
        }

        const dialogElement = React.createElement(dialog,
        {
            ...parameters,
            onDialogAccept: async(returnData)=>
            {
                if (typeof parameters.onAccept === "function")
                {
                    await parameters.onAccept(returnData);
                }

                close_this_dialog();
                resolve(returnData);
            },
            onDialogReject: async()=>
            {
                if (typeof parameters.onReject === "function")
                {
                    await parameters.onReject();
                }

                close_this_dialog();
                resolve(null);
            },
        });

        document.body.appendChild(dialogContainer);
        ReactDOM.render(dialogElement, dialogContainer);
    });

    // Removes the dialog from the DOM.
    async function close_this_dialog()
    {
        if (dialogContainer.childElementCount)
        {
            /// WIP. Temporary animation.
            await animate(dialogContainer.firstChild, "fadeout");
            ReactDOM.unmountComponentAtNode(dialogContainer);
            dialogContainer.remove();
        }
        else
        {
            dialogContainer.remove();
        }
    }
}
