"use strict";

import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {panic} from "../../assert.js"

// An element displaying information about an individual search result.
export function BirdSearchResultElement(props = {})
{
    BirdSearchResultElement.validate_props(props);

    const [hasBeenPreviouslyObserved, dateObserved] = (()=>
    {
        if (props.dateObserved)
        {
            return [true, <>{props.dateObserved}</>];
        }
        else
        {
            return [false, <div style={{marginTop:"3px"}}>
                               <i className="fas fa-crow fa-lg" style={{color:"mediumseagreen"}}/>
                               <i className="fas fa-plus fa-xs" style={{color:"mediumseagreen"}}/>
                               <span> Merkitse listaan</span>
                           </div>];
        }
    })();

    return <div className={`BirdSearchResultElement ${!hasBeenPreviouslyObserved? "not-previously-observed" : ""}`.trim()}
                onClick={()=>{if (!hasBeenPreviouslyObserved) props.clickCallback(props.bird)}}>
                    <BirdThumbnail bird={props.bird}/>
                    <div className="card">
                        <div className="bird-name">
                            {props.bird.species}
                        </div>
                        <div className="classification">
                            {props.bird.order}
                            <i className="fas fa-caret-right fa-sm" style={{margin:"5px", color:"rgba(0, 0, 0, 0.4)"}}/>
                            {props.bird.family}
                        </div>
                        <div className="observed-date">
                            {dateObserved}
                        </div>
                    </div>
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
