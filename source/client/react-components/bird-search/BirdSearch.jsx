"use strict";

import {ll_assert_native_type,
        ll_assert_type} from "../../assert.js"
import {BirdSearchResult} from "./BirdSearchResult.js";
import {BirdSearchBar} from "./BirdSearchBar.js";
import {LL_Bird} from "../../bird.js";

// Renders a search bar with which the user can search for specific entries in Lintulista's
// list of known birds; and displays a dynamic list of search results matching the user's
// query.
//
// Backend access should be provided via props.backend, which should be a BackendAccess()
// object with which the component can query the backend for the list of known birds, the
// user's current observations, etc.
//
export function BirdSearch(props = {})
{
    BirdSearch.validate_props(props);

    const knownBirds = ReactRedux.useSelector(state=>state.knownBirds);
    const isLoggedIn = ReactRedux.useSelector(state=>state.isLoggedIn);
    const observations = ReactRedux.useSelector(state=>state.observations);

    const [currentSearchResult, setCurrentSearchResult] = React.useState(false);

    return <div className="BirdSearch">

        <BirdSearchBar
            initialState="inactive"
            cbOnChange={refresh_search_results}
            cbOnInactivate={reset_search_results}
        />
                        
        <div className={`BirdSearchResultsDisplay
                        ${currentSearchResult? "active" : "inactive"}
                        ${isLoggedIn? "logged-in" : "not-logged-in"}`}>

            {
                currentSearchResult
                ? currentSearchResult.element
                : <></>
            }

        </div>

    </div>

    // Show search results for the given search string.
    function refresh_search_results(searchString = "")
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
            })(knownBirds.find(bird=>(bird.species.toLowerCase().includes(searchString.toLowerCase()))));
        })(knownBirds.find(bird=>(bird.species.toLowerCase() === searchString.toLowerCase())));

        function update_match(bird = LL_Bird)
        {
            ll_assert_type(LL_Bird, bird);

            if (!currentSearchResult ||
                (bird.species !== currentSearchResult.bird.species))
            {
                setCurrentSearchResult({bird, element:make_result_element(bird)});
            }
        }

        function make_result_element(bird = LL_Bird)
        {
            ll_assert_type(LL_Bird, bird);

            const observation = observations.find(obs=>obs.species === bird.species);

            return <BirdSearchResult
                       key={bird.species}
                       bird={bird}
                       backend={props.backend}
                       observation={observation? observation : null}
                       userHasEditRights={isLoggedIn}
                       cbCloseSelf={reset_search_results}
                   />;
        }
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
    ll_assert_native_type("object", props, props.backend);

    return;
}
