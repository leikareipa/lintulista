/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic, panic_if_undefined} from "../assert.js";
import {ObservationList} from "../react-components/observation-list/ObservationList.js";
import {shades} from "../shades.js";

// Renders a list of the user's observations, the data of which is fetched from the
// given backend.
export function render_observation_list(backend)
{
    panic_if_undefined(backend);

    const container = document.getElementById("observation-list");

    if (!container)
    {
        panic("Can't find the container to render the observation list into.");
        return;
    }

    // Darken all elements on the page while actions are undertaken about the
    // observation list (like deleting an observation).
    const observationShades = shades(
    {
        z: 110,
        opacity: 0.3,
        container: document.body,
        onClick: null,
    });

    const observationListElement = React.createElement(ObservationList,
    {
        backend,
        shades: observationShades,
    });

    ReactDOM.unmountComponentAtNode(container)
    ReactDOM.render(observationListElement, container);
}
