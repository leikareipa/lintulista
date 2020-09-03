"use strict";

import {panic_if_not_type, throw_if_not_true} from "../../assert.js"
import {BirdSearchResult} from "./BirdSearchResult.js";
import {BirdSearchBar} from "./BirdSearchBar.js";
import {Observation} from "../../observation.js";
import {Bird} from "../../bird.js";

// Renders a search bar with which the user can search for specific entries in Lintulista's
// list of known birds; and displays a dynamic list of search results matching the user's
// query.
//
// Backend access should be provided via props.backend, which should be a BackendAccess()
// object with which the component can query the backend for the list of known birds, the
// user's current observations, etc.
//
// The callback provided via props.callbackAddObservation will be called when the user clicks
// to add to the list a search result whose bird is not already on the list. The callback
// will be passed one parameter: a Bird() object representing the type of bird in question.
//
// The callback provided via props.callbackRemoveObservation will be called when the user
// clicks to remove from the list a search result whose bird is on the list. The callback
// will be passed one parameter: a Bird() object representing the type of bird in question.
//
export function BirdSearch(props = {})
{
    BirdSearch.validate_props(props);

    const [currentSearchResult, setCurrentSearchResult] = React.useState(false);

    return <div className="BirdSearch">
               <BirdSearchBar initialState="inactive"
                              callbackOnChange={refresh_search_results}
                              callbackOnInactivate={reset_search_results}/>
               <div className={`BirdSearchResultsDisplay ${currentSearchResult? "active" : "inactive"}
                                                         ${props.backend.hasEditRights? "edit-rights" : "no-edit-rights"}`.trim()}>
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
    // observations. The 'bird' parameter is expected to be a Bird() object.
    async function add_bird_to_list(bird)
    {
        panic_if_not_type("object", bird);

        await props.callbackAddObservation(bird);

        reset_search_results();
    }

    // Called when the user selects to remove the search result's bird from their list of
    // observations. The 'bird' parameter is expected to be a Bird() object.
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

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
BirdSearch.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // A mock of BackendAccess().
        const backend =
        {
            known_birds: ()=>([Bird({species:"Alli", family:"", order:""}), Bird({species:"Naakka", family:"", order:""})]),
            observations: ()=>([Observation({bird:Bird({species:"Naakka", family:"", order:""}), date:new Date(1000)})]),
        };

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(BirdSearch,
            {
                backend,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        // We expect the following tree:
        //
        // <container>
        //     <BirdSearch>
        //         <BirdSearchBar>
        //             <input>
        //             ...
        //         <BirdSearchResultsDisplay>
        //             (no children yet before a search is made)
        //
        const searchElement = container.querySelector(".BirdSearch");
        const searchBar = container.querySelector(".BirdSearchBar");
        const searchResultsDisplay = container.querySelector(".BirdSearchResultsDisplay");
        const searchBarInput = searchBar.querySelector("input");

        throw_if_not_true([()=>(searchElement !== null),
                           ()=>(searchBar !== null),
                           ()=>(searchResultsDisplay !== null),
                           ()=>(searchBarInput !== null)]);

        ReactTestUtils.Simulate.focus(searchBarInput);

        // Test searching for a bird of which there is no prior observation.
        {
            searchBarInput.value = "alli"
            ReactTestUtils.Simulate.change(searchBarInput);

            // We should have one search result, of a bird not observed before.
            throw_if_not_true([()=>(searchResultsDisplay.childNodes.length === 1),
                               ()=>(searchResultsDisplay.childNodes[0].getAttribute("class") === "BirdSearchResult not-previously-observed")]);
        }

        // Test searching for a bird of which there is a prior observation.
        {
            searchBarInput.value = "naakka"
            ReactTestUtils.Simulate.change(searchBarInput);
            
            // We should have one search result, of a bird observed before.
            throw_if_not_true([()=>(searchResultsDisplay.childNodes.length === 1),
                               ()=>(searchResultsDisplay.childNodes[0].getAttribute("class") === "BirdSearchResult")]);
        }

        // Clearing the search input field should hide search results.
        {
            searchBarInput.value = "naakka"
            ReactTestUtils.Simulate.change(searchBarInput);
            
            // We should have one search result.
            throw_if_not_true([()=>(searchResultsDisplay.childNodes.length === 1)]);

            searchBarInput.value = ""
            ReactTestUtils.Simulate.change(searchBarInput);
            
            // We should no longer have a search result.
            throw_if_not_true([()=>(searchResultsDisplay.childNodes.length === 0)]);
        }

        /// TODO: Test for search results hiding when input field loses focus.
    }
    catch (error)
    {
        if (error === "assertion failure") return false;

        throw error;
    }
    finally
    {
        container.remove();
    }

    return true;
}
