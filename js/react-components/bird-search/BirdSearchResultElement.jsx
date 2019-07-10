"use strict";

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    return <div className="BirdSearchResultElement">
               <img src={props.birdImageUrl}></img>
               {props.birdName}
           </div>
}

BirdSearchResultElement.defaultProps =
{
    // The user-facing name of the bird.
    birdName: null,

    // An address to a thumbnail image of the bird in question.
    birdImageUrl: "",
}
