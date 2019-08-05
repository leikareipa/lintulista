"use strict";

import {panic_if_not_type} from "../../assert.js"
import {BirdSearchResult} from "./BirdSearchResult.js";
import {BirdSearchBar} from "./BirdSearchBar.js";

// Renders a search bar with which the user can search for specific entries in Lintulista's
// list of known birds; and displays a dynamic list of search results matching the user's
// query.
//
// Backend access should be provided via props.backend, which should be a backend_access()
// object with which the component can query the backend for the list of known birds, the
// user's current observations, etc.
//
// A callback provided via props.callbackSelectedBird will be called when the user clicks on
// a search result. The callback will be passed one parameter: a bird() object representing
// the type of bird that was clicked.
//
export function BirdSearch(props = {})
{
    BirdSearch.validate_props(props);

    const [currentSearchResult, setCurrentSearchResult] = React.useState(false);

    return <div className="BirdSearch">
               <BirdSearchBar initialState="inactive"
                              callbackOnChange={refresh_search_results}
                              callbackOnInactivate={reset_search_results}/>
               <div className={`BirdSearchResultsDisplay ${currentSearchResult? "active" : "inactive"}`.trim()}>
                   {currentSearchResult? currentSearchResult.element : <></>}
               </div>
           </div>

    // Show search results for the given search string.
    function refresh_search_results(searchString)
    {
        searchString = searchString.trim();

        if (!searchString.length)
        {
            reset_search_results();
            return;
        }

        // First, see if we have an exact match.
        ((exactMatch)=>
        {
            if (exactMatch)
            {
                update_match(exactMatch);
                return;
            }

            // Second, otherwise, get the closest partial match, if any.
            ((partialMatch)=>
            {
                if (partialMatch)
                {
                    update_match(partialMatch);
                    return;
                }
            })(props.backend.known_birds().find(bird=>(bird.species.toLowerCase().includes(searchString.toLowerCase()))));
        })(props.backend.known_birds().find(bird=>(bird.species.toLowerCase() === searchString.toLowerCase())));

        function update_match(bird)
        {
            if (!currentSearchResult ||
                (bird.species !== currentSearchResult.bird.species))
            {
                setCurrentSearchResult({bird, element:make_result_element(bird)});
            }
        }

        function make_result_element(bird)
        {
            const observation = props.backend.observations().find(obs=>obs.bird.species === bird.species);

            return <BirdSearchResult key={bird.species}
                                     bird={bird}
                                     clickCallback={select_bird}
                                     dateObserved={observation? observation.dateString : null}
                                     placeObserved={observation? observation.place : null}/>;
        }
    }

    // Called when the user selects one of the search results.
    async function select_bird(bird)
    {
        panic_if_not_type("object", bird);

        await props.callbackSelectedBird(bird);

        reset_search_results();
    }

    function reset_search_results()
    {
        setCurrentSearchResult(false);
    }
}

BirdSearch.defaultProps =
{
    // How many search results to display, at most.
    maxNumResultElements: 1,
};

BirdSearch.validate_props = function(props)
{
    panic_if_not_type("object", props, props.backend);
    panic_if_not_type("function", props.callbackSelectedBird);

    return;
}
