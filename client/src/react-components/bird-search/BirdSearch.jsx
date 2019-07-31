"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js"
import {BirdSearchResultsDisplay} from "./BirdSearchResultsDisplay.js";
import {BirdSearchResultElement} from "./BirdSearchResultElement.js";
import {BirdSearchField} from "./BirdSearchField.js";

// Displays a search bar and corresponding search results on bird names. Expects the names
// to be provided in props.birds, being an array of bird() objects. The 'name' property of
// each bird will be matched to the user-generated search string, and elements providing a
// full or partial match will be displayed as a list in association with the search bar.
export function BirdSearch(props = {})
{
    BirdSearch.validate_props(props);

    const [currentSearchResultElements, setCurrentSearchResultElements] = React.useState([]);

    const [searchFieldState, setSearchFieldState] = React.useState("inactive");

    // Implements a click handler that clears away any search results and inactivates the
    // search field when the user clicks outside of the search element.
    React.useEffect(()=>
    {
        window.addEventListener("click", handle_search_click);
        return ()=>window.removeEventListener("keydown", handle_search_click);

        function handle_search_click(clickEvent)
        {
            const clickedOnSearchElement = (()=>
            {
                let node = clickEvent.target;
                while (node)
                {
                    if (node.classList &&
                        (node.classList.contains("BirdSearchResultsDisplay") ||
                         node.classList.contains("BirdSearchField")))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            if (!clickedOnSearchElement)
            {
                inactivate_search_field();
            }
        }
    }, []);

    return <div className="BirdSearch">
               <BirdSearchField state={searchFieldState}
                                onFocus={activate_search_field}
                                onChange={regenerate_search_results}/>
               <BirdSearchResultsDisplay className="BirdSearchResultsDisplay"
                                         resultElements={currentSearchResultElements}/>
           </div>

    // Called when the user selects one of the search results.
    async function select_bird(bird)
    {
        panic_if_not_type("object", bird);

        if (searchFieldState === "active")
        {
            inactivate_search_field();
        }

        props.selectionCallback(bird);
    }

    function inactivate_search_field()
    {
        setCurrentSearchResultElements([]);
        setSearchFieldState("inactive");
    }

    function activate_search_field()
    {
        setSearchFieldState("active");
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
                                                                clickCallback={(bird)=>select_bird(bird)}
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
    panic_if_undefined(props.backend, props.selectionCallback);

    return;
}
