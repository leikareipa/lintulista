"use strict";

import {BirdSearchResultsDisplay} from "./BirdSearchResultsDisplay.js";
import {BirdSearchResultElement} from "./BirdSearchResultElement.js";
import {panic_if_undefined} from "../../assert.js"
import {BirdSearchField} from "./BirdSearchField.js";

// Displays a search bar and corresponding search results on bird names. Expects the names
// to be provided in props.birds, being an array of bird() objects. The 'name' property of
// each bird will be matched to the user-generated search string, and elements providing a
// full or partial match will be displayed as a list in association with the search bar.
export function BirdSearch(props = {})
{
    BirdSearch.validate_props(props);

    const [currentSearchResultElements, setCurrentSearchResultElements] = React.useState([]);

    return <>
               <BirdSearchField onFocus={props.shades.put_on}
                                onChange={regenerate_search_results}
                                onBlur={remove_shades_if_lost_focus} />
               <BirdSearchResultsDisplay className="BirdSearchResultsDisplay"
                                         resultElements={currentSearchResultElements} />
           </>

    function remove_shades_if_lost_focus()
    {
        if (!currentSearchResultElements.length)
        {
            props.shades.pull_off();
        }
    }

    // Refresh the list of search results that match the current text in the search field.
    function regenerate_search_results(inputEvent)
    {
        const searchString = inputEvent.target.value.trim();
        const searchResults = [];

        if (searchString.length)
        {
            props.backend.known_birds().forEach(bird=>
            {
                if (bird.species.toLowerCase().includes(searchString.toLowerCase()))
                {
                    const observation = props.backend.observations().find(obs=>obs.bird.species === bird.species);

                    searchResults.push(<BirdSearchResultElement key={bird.species}
                                                                bird={bird}
                                                                clickCallback={(bird)=>{
                                                                    props.shades.pull_off();
                                                                    props.selectionCallback(bird);
                                                                }}
                                                                dateObserved={observation? observation.dateString : null} />);
                }
            });
        }

        searchResults.length = Math.min(props.maxResultElements, searchResults.length);

        setCurrentSearchResultElements(searchResults);
    }
}

BirdSearch.defaultProps =
{
    // How many search results to display, at most.
    maxResultElements: 4,
};

BirdSearch.validate_props = function(props)
{
    panic_if_undefined(props.backend, props.selectionCallback, props.shades);

    return;
}
