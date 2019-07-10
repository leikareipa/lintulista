"use strict";

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {/*birdName*/})
{
    return <div className="BirdSearchResultElement">
               {props.birdName}
           </div>
}

BirdSearchResultElement.defaultProps =
{
    birdName: null,
}