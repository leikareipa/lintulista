"use strict";

import {BirdSearchField} from "./BirdSearchField.js";
import {BirdSearchResultElement} from "./BirdSearchResultElement.js";
import {BirdSearchResultsDisplay} from "./BirdSearchResultsDisplay.js";

// Displays a search bar and corresponding search results on bird names. Expects the names
// to be provided in the 'birds' array, where each element is an object like the following:
//
//     {name: "Bird name"}
//
// The 'name' property of each object will be matched to the user-generated search string,
// and elements providing a full or partial match will be displayed as a list in association
// with the search bar.
export function BirdSearch(props = {})
{
    const [currentSearchResultElements, setCurrentSearchResultElements] = React.useState([]);

    return <>
               <BirdSearchField onChange={(event)=>regenerate_search_results(event.target.value.trim())}></BirdSearchField>
               <BirdSearchResultsDisplay className="BirdSearchResultsDisplay" resultElements={currentSearchResultElements}></BirdSearchResultsDisplay>
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
                                                                birdName={bird.name}
                                                                birdImageUrl={bird.imageUrl}>
                                       </BirdSearchResultElement>);
                }
            });
        }

        searchResults.length = Math.min(props.maxResultElements, searchResults.length);

        setCurrentSearchResultElements(searchResults);

        return;
    }
}

BirdSearch.defaultProps =
{
    // How many search results to display, at most.
    maxResultElements: 4,

    // A list of the birds to search.
    birds:
    [
        /*{name: "null bird"},*/
    ],
};
