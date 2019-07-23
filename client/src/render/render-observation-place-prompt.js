/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationPlacePrompt} from "../react-components/dialogs/ObservationPlacePrompt.js";
import {panic_if_undefined} from "../assert.js";
import {animate} from "../animate.js";

// The DOM container to render the dialog into.
const containerId = "set-place-dialog";

// Draws a modal dialog that prompts the user to enter a new place for the given observation.
// Returns a promise that resolves once the user has closed the dialog.
export function render_observation_place_prompt(observation)
{
    panic_if_undefined(observation);

    return new Promise(resolve=>
    {
        const container = document.getElementById(containerId);

        if (!container)
        {
            panic("Can't find the container to render the observation list into.");
            return;
        }

        const placePrompt = React.createElement(ObservationPlacePrompt,
        {
            observation,
            onDialogAccept: (place)=>
            {
                unrender_observation_place_prompt();
                resolve(place);
            },
            onDialogReject: ()=>
            {
                unrender_observation_place_prompt();
                resolve(null);
            },
        });

        unrender_observation_place_prompt();
        ReactDOM.render(placePrompt, container);
    });
}

// Removes the prompt from view.
export function unrender_observation_place_prompt()
{
    if (document.getElementById(containerId).childElementCount)
    {
        /// WIP. Temporary animation.
        animate(document.getElementById(containerId).firstChild, "fadeout", ()=>
        {
            ReactDOM.unmountComponentAtNode(document.getElementById(containerId));
        });
    }
}
