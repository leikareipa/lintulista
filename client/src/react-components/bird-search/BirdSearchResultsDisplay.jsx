"use strict";

// A container for holding the individual search results elements.
export function BirdSearchResultsDisplay(props = {})
{
    return <div className="BirdSearchResultsDisplay">
               {props.resultElements}
           </div>
}
