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

    const [currentSearchResultElements, setCurrentSearchResultElements] = React.useState([]);

    return <div className="BirdSearch">
               <BirdSearchBar initialState="inactive"
                              callbackOnChange={refresh_search_results}
                              callbackOnInactivate={reset_search_results}/>
               <div className="BirdSearchResultsDisplay">
                   {currentSearchResultElements}
               </div>
           </div>

    function refresh_search_results(searchString)
    {
        if (!searchString)
        {
            reset_search_results();
            
            return;
        }

        const searchResults = [];

        props.backend.known_birds().forEach(bird=>
        {
            if (searchResults.length >= props.maxNumResultElements)
            {
                return;
            }

            if (bird.species.toLowerCase().startsWith(searchString.toLowerCase()))
            {
                const observation = props.backend.observations().find(obs=>obs.bird.species === bird.species);

                searchResults.push(<BirdSearchResult key={bird.species}
                                                     bird={bird}
                                                     clickCallback={select_bird}
                                                     dateObserved={observation? observation.dateString : null}
                                                     placeObserved={observation? observation.place : null}/>);
            }
        });

        setCurrentSearchResultElements(searchResults);
    }

    // Called when the user selects one of the search results.
    async function select_bird(bird)
    {
        panic_if_not_type("object", bird);

        reset_search_results();
        
        props.callbackSelectedBird(bird);
    }

    function reset_search_results()
    {
        setCurrentSearchResultElements([]);
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
