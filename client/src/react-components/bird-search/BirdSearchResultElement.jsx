"use strict";

import {warn, panic} from "../../assert.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    if (typeof props.clickCallback !== "function")
    {
        panic("Expected a click handler function.");
    }

    const {hasBeenPreviouslyObserved, dateObserved} = (()=>
    {
        if (props.dateObserved)
        {
            return {
                hasBeenPreviouslyObserved: true,
                dateObserved: <>Havaittu {props.dateObserved}</>,
            };
        }
        else
        {
            return {
                hasBeenPreviouslyObserved: false,
                dateObserved: <>
                                  <i className="fas fa-pen" style={{color:"mediumseagreen"}}></i> 
                                  <span style={{fontStyle:"italic"}}> Merkitse havaituksi</span>
                              </>,
            };
        }
    })();

    return <div className="BirdSearchResultElement" style={{cursor: (hasBeenPreviouslyObserved? "default" : "pointer")}}
                                                    onClick={()=>{!hasBeenPreviouslyObserved? props.clickCallback(props.bird) : 1;}}>
               <img className="image"
                    referrerPolicy="no-referrer"
                    src={props.bird.thumbnailUrl}/>
               <span className="name">
                   {props.bird.name}<br/>
                   <span className="observed-date">{dateObserved}</span>
               </span>
           </div>
}
