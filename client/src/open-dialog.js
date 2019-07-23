/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "./assert.js";
import {animate} from "./animate.js";

// Renders a dialog component into a new <div> container. Closes the dialog and deletes the
// container when the user accepts or rejects the dialog via onDialogAccept/onDialogReject.
//
// If the user rejects the dialog, null is returned via resolve(); otherwise resolve() directs
// to the caller the return data provided by the dialog.
//
// The dialog component to be rendered should be provided via dialog. It should be a
// React component that calls props.onDialogAccept/props.onDialogReject when the dialog is
// ready to be closed and unrendered.
//
// The parameters (props) to be passed to the dialog component are given via args.parameters;
// which should be an object containing the desired parameters.
//
export function open_dialog(dialog, parameters = {})
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
            onDialogAccept: (returnData)=>
            {
                close_this_dialog();
                resolve(returnData);
            },
            onDialogReject: ()=>
            {
                close_this_dialog();
                resolve(null);
            },
        });

        document.body.appendChild(dialogContainer);
        ReactDOM.render(dialogElement, dialogContainer);
    });

    // Removes the dialog from the DOM.
    function close_this_dialog()
    {
        if (dialogContainer.childElementCount)
        {
            /// WIP. Temporary animation.
            animate(dialogContainer.firstChild, "fadeout", ()=>
            {
                ReactDOM.unmountComponentAtNode(dialogContainer);
                dialogContainer.remove();
            });
        }
        else
        {
            dialogContainer.remove();
        }
    }
}
