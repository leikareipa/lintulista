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
            return [false, <>Ei aiempaa havaintoa</>];
        }
    })();

    return <div className={`BirdSearchResultElement ${!hasBeenPreviouslyObserved? "not-previously-observed" : ""}`.trim()}
                onClick={()=>{if (!hasBeenPreviouslyObserved) props.clickCallback(props.bird)}}>
                    <BirdThumbnail bird={props.bird}
                                   useLazyLoading={false}/>
                    <div className="card">
                        <div className="bird-name">
                            {props.bird.species}
                        </div>
                        <div className="date-observed">
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
