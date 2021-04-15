/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {darken_viewport} from "./darken-viewport.js";
import {ll_assert_native_type} from "./assert.js";
import {store} from "./redux-store.js";

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
export async function exec_modal_dialog(dialog, args = {})
{
    let shades;
    let dialogContainer;

    try
    {
        dialogContainer = document.createElement("div");
        ll_assert_native_type(Element, dialogContainer);

        shades = await darken_viewport({z:110, opacity:0.5});

        const dataFromDialog = await new Promise(resolve=>
        {
            const data = {};

            const dialogElement = React.createElement(dialog, {
                args,
                return: data,
                onAccept: ()=>resolve(data),
                onReject: ()=>resolve(false),
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
    catch (error) {
        /// TODO.
    }
    finally {
        await close_dialog();
    }

    return null;

    async function close_dialog()
    {
        if (dialogContainer)
        {
            if (dialogContainer.childElementCount) {
                ReactDOM.unmountComponentAtNode(dialogContainer);
            }

            dialogContainer.remove();
        }

        if (shades) {
            await shades.remove();
        }
    }
}
