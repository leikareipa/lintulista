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
// The callback provided via props.callbackAddObservation will be called when the user clicks
// to add to the list a search result whose bird is not already on the list. The callback
// will be passed one parameter: a bird() object representing the type of bird in question.
//
// The callback provided via props.callbackRemoveObservation will be called when the user
// clicks to remove from the list a search result whose bird is on the list. The callback
// will be passed one parameter: a bird() object representing the type of bird in question.
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
                                     observation={observation? observation : null}
                                     userHasEditRights={props.backend.hasEditRights}
                                     callbackAddObservation={add_bird_to_list}
                                     callbackRemoveObservation={remove_bird_from_list}
                                     callbackChangeObservationDate={change_observation_date}/>;
        }
    }

    // Called when the user selects to add the search result's bird to their list of
    // observations. The 'bird' parameter is expected to be a bird() object.
    async function add_bird_to_list(bird)
    {
        panic_if_not_type("object", bird);

        await props.callbackAddObservation(bird);

        reset_search_results();
    }

    // Called when the user selects to remove the search result's bird from their list of
    // observations. The 'bird' parameter is expected to be a bird() object.
    async function remove_bird_from_list(bird)
    {
        panic_if_not_type("object", bird);

        reset_search_results();

        await props.callbackRemoveObservation(bird);
    }

    // Called when the user selects to change the date of an observation.
    async function change_observation_date(bird)
    {
        reset_search_results();

        await props.callbackChangeObservationDate(bird);
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
    panic_if_not_type("function", props.callbackAddObservation);

    return;
}
