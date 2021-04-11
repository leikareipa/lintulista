/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_error_popup} from "./message-popup.js";
import {panic_if_undefined, is_function} from "./assert.js";
import {darken_viewport} from "./darken_viewport.js";

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
// A callback to be called when the dialog closes (whether the user accepted or rejected it)
// can be provided via props.onClose. The callback will be provided no parameters.
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

    // Will be used to darken the viewport.
    let shades = null;

    return (async()=>
    {
        if (!dialogContainer)
        {
            panic("Can't find the container to render the observation list into.");
            return;
        }

        shades = await darken_viewport({z:110, opacity:0.5})

        const dialogElement = React.createElement(dialog,
        {
            ...parameters,
            onDialogAccept: async(returnData)=>{
                await run_callback(parameters.onAccept, returnData);
                close_this_dialog();
                return returnData;
            },
            onDialogReject: async()=>{
                await run_callback(parameters.onReject)
                close_this_dialog();
                return;
            },
        });

        document.body.appendChild(dialogContainer);
        ReactDOM.render(dialogElement, dialogContainer);
    })();

    async function run_callback(fn = async function(){},
                                args = {})
    {
        if (is_function(fn))
        {
            try {
                await fn(args);
            }
            catch (error) {
                ll_error_popup(error);
            }
        }

        return;
    }

    // Removes the dialog from the DOM.
    async function close_this_dialog()
    {
        if (dialogContainer.childElementCount)
        {
            ReactDOM.unmountComponentAtNode(dialogContainer);
        }

        dialogContainer.remove();

        if (is_function(parameters.onClose))
        {
            parameters.onClose();
        }

        await shades.remove();
    }
}
