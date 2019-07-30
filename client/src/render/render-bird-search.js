/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {render_observation_list} from "../render/render-observation-list.js";
import {panic_if_undefined} from "../assert.js";
import {observation} from "../observation.js";
import {BirdSearch} from "../react-components/bird-search/BirdSearch.js";
import {shades} from "../shades.js";

// Renders a search bar into which the user can type bird names. As the user types, search
// results are generated into a list below the search bar. The user can then click on one
// of the results to add that bird into their observation list. The list of bird names that
// the search recognizes is fetched from the given backend.
export function render_bird_search(backend)
{
    panic_if_undefined(backend);

    const container = document.getElementById("search-widget");

    if (!container)
    {
        panic("Can't find the container to render the observation list into.");
        return;
    }

    // Darken all other elements on the page while the bird search has focus.
    const searchShades = shades(
    {
        z: 99,
        opacity: 0.5,
        container: document.body,
        onClick: ()=>
        {
            searchShades.pull_off();

            // Clear the search bar and its results.
            render_bird_search(backend);
        }
    });

    const searchElement = React.createElement(BirdSearch,
    {
        backend,
        shades: searchShades,

        // Called when the user clicks on a search result. Will add the corresponding
        // bird to the list as a new observation.
        selectionCallback: async(bird)=>
        {
            // Clear the search bar and its results.
            render_bird_search(backend);

            await searchShades.pull_off();

            const newObservation = observation({bird, date:new Date()});

            await backend.post_observation(newObservation);

            // Refresh the observation list.
            render_observation_list(backend);
        },
    });
    
    ReactDOM.unmountComponentAtNode(container)
    ReactDOM.render(searchElement, container);
}
