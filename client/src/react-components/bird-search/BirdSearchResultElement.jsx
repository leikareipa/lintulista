"use strict";

import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {panic} from "../../assert.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    BirdSearchResultElement.validate_props(props);

    const {hasBeenPreviouslyObserved, dateObserved} = (()=>
    {
        if (props.dateObserved)
        {
            return {
                hasBeenPreviouslyObserved: true,
                dateObserved: <>{props.dateObserved}</>,
            };
        }
        else
        {
            return {
                hasBeenPreviouslyObserved: false,
                dateObserved: <>
                                  <i className="fas fa-pen" style={{color:"mediumseagreen"}}/>
                                  <span> Merkitse uudeksi havainnoksi</span>
                              </>,
            };
        }
    })();

    return <div className="BirdSearchResultElement" style={{cursor: (hasBeenPreviouslyObserved? "default" : "pointer")}}
                                                    onClick={()=>{!hasBeenPreviouslyObserved? props.clickCallback(props.bird) : 1;}}>
               <BirdThumbnail bird={props.bird}/>
               <span className="name">
                   {props.bird.species}<br/>
                   <span className="observed-date">{dateObserved}</span>
               </span>
           </div>
}

BirdSearchResultElement.validate_props = function(props)
{
    if (typeof props.clickCallback !== "function")
    {
        panic("Expected a click handler function.");
    }

    return;
}
