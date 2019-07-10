"use strict";

// A container for holding the individual search results elements.
export function BirdSearchResultsDisplay(props = {})
{
    return <div className="BirdSearchResultsDisplay">
               {props.resultElements}
           </div>
}

BirdSearchResultsDisplay.defaultProps =
{
    // The React elements to show in the display; each element being one search result.
    resultElements: [],
}
