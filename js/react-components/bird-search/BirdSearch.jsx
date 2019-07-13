"use strict";

import {warn, panic} from "../../assert.js"
import {BirdSearchField} from "./BirdSearchField.js";
import {BirdSearchResultElement} from "./BirdSearchResultElement.js";
import {BirdSearchResultsDisplay} from "./BirdSearchResultsDisplay.js";

// Displays a search bar and corresponding search results on bird names. Expects the names
// to be provided in props.birds, being an array of bird() objects. The 'name' property of
// each bird will be matched to the user-generated search string, and elements providing a
// full or partial match will be displayed as a list in association with the search bar.
export function BirdSearch(props = {})
{
    if (typeof props.selectionCallback !== "function")
    {
        panic("Expected a selection callback handler function.");
    }

    const [currentSearchResultElements, setCurrentSearchResultElements] = React.useState([]);

    const [searchFieldKey, setSearchFieldKey] = React.useState(0);

    return <>
               <BirdSearchField key={searchFieldKey} onChange={(event)=>regenerate_search_results(event.target.value.trim())} />
               <BirdSearchResultsDisplay className="BirdSearchResultsDisplay"
                                         resultElements={currentSearchResultElements} />
           </>

    // Refresh the list of search results that match the given string.
    function regenerate_search_results(searchString)
    {
        const searchResults = [];

        if (searchString.length)
        {
            props.birds.forEach((bird, idx)=>
            {
                if (bird.name.toLowerCase().includes(searchString.toLowerCase()))
                {
                    searchResults.push(<BirdSearchResultElement key={idx}
                                                                bird={bird}
                                                                clickCallback={result_clicked} />);
                }
            });
        }

        searchResults.length = Math.min(props.maxResultElements, searchResults.length);

        setCurrentSearchResultElements(searchResults);
    }

    // Removes any text from the search field.
    function reset_search_field()
    {
        setSearchFieldKey(searchFieldKey+1);
    }

    // Removes any search results from being displayed.
    function reset_search_results()
    {
        setCurrentSearchResultElements([]);
    }

    // Called when the user clicks on one of the search results, and gets passed the corresponding
    // bird.
    function result_clicked(bird)
    {
        reset_search_results();
        reset_search_field();

        props.selectionCallback(bird);
    }
}

BirdSearch.defaultProps =
{
    // How many search results to display, at most.
    maxResultElements: 4,
};
