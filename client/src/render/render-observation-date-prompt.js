/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationDatePrompt} from "../react-components/observation-date-prompt/ObservationDatePrompt.js";
import {shades} from "../shades.js";

// Draws a modal dialog that prompts the user to enter a new date for the given observation.
// Returns a promise that resolves once the user has closed the dialog.
export function render_observation_date_prompt(observation)
{
    return new Promise(resolve=>
    {
        const container = document.getElementById("set-date-dialog");

        if (!container)
        {
            panic("Can't find the container to render the observation list into.");
            return;
        }

        const dialogShades = shades(
        {
            z: 110,
            opacity: 0.8,
            container: document.body,
            onClick: async()=>
            {
                ReactDOM.unmountComponentAtNode(container);

                await dialogShades.pull_off();

                resolve();
            }
        });
        
        const dialog = React.createElement(ObservationDatePrompt,
        {
            observation,
            shades: dialogShades,
            receiveDate: ({year, month, day})=>{console.log(day, month, year)},
        });

        dialogShades.put_on();

        ReactDOM.unmountComponentAtNode(container)
        ReactDOM.render(dialog, container);
    });
}
