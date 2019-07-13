"use strict";

import {bird} from "../../bird/bird.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    return <div className="BirdSearchResultElement">
               <img src={props.bird.thumbnailUrl}></img>
               {props.bird.name}
           </div>
}

BirdSearchResultElement.defaultProps =
{
    bird: bird(),
}
