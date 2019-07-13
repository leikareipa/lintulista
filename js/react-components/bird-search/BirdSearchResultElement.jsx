"use strict";

import {warn, panic} from "../../assert.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    if (typeof props.clickCallback !== "function")
    {
        panic("Expected a click handler function.");
    }

    return <div className="BirdSearchResultElement" style={{cursor: "pointer"}}
                                                    onClick={()=>props.clickCallback(props.bird)}>
               <img className="image" src={props.bird.thumbnailUrl}></img>
               <span className="name">
                   {props.bird.name}<br />
                   <span className="subtitle">
                       Ei aiempaa havaintoa
                   </span>
               </span>
           </div>
}
