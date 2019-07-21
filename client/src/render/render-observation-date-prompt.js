/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationDatePrompt} from "../react-components/observation-date-prompt/ObservationDatePrompt.js";
import {shades} from "../shades.js";
import { panic_if_undefined } from "../assert.js";

// The DOM container to render the dialog into.
const containerId = "set-date-dialog";

// Draws a modal dialog that prompts the user to enter a new date for the given observation.
// Returns a promise that resolves once the user has closed the dialog.
export function render_observation_date_prompt(observation)
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

        const datePrompt = React.createElement(ObservationDatePrompt,
        {
            observation,
            receiveDate: (date)=>
            {
                resolve(date);
            },
        });

        unrender_observation_date_prompt();
        ReactDOM.render(datePrompt, container);
    });
}

// Removes the prompt from view.
export function unrender_observation_date_prompt()
{
    ReactDOM.unmountComponentAtNode(document.getElementById(containerId));
}
