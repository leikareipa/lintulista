"use strict";

import {warn, panic} from "../../assert.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    if (typeof props.clickCallback !== "function")
    {
        panic("Expected a click handler function.");
    }

    const whenObserved = (()=>
    {
        if (props.dateObserved)
        {
            return <><i className="far fa-calendar-check" style={{color:"#c0c0c0"}}></i> {props.dateObserved}</>
        }
        else
        {
            return <span style={{fontStyle: "italic"}}>ei havaittu aiemmin</span>
        }
    })();

    return <div className="BirdSearchResultElement" style={{cursor: "pointer"}}
                                                    onClick={()=>props.clickCallback(props.bird)}>
               <img className="image" src={props.bird.thumbnailUrl}></img>
               <span className="name">
                   {props.bird.name}<br />
                   <span className="observed-date">
                       {whenObserved}
                   </span>
               </span>
           </div>
}
