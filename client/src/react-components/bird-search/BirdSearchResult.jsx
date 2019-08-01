"use strict";

import {panic_if_not_type} from "../../assert.js"
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {GeoTag} from "../misc/GeoTag.js";

// An element displaying information about an individual search result.
export function BirdSearchResult(props = {})
{
    BirdSearchResult.validate_props(props);

    const [hasBeenPreviouslyObserved, dateObserved] = (()=>
    {
        if (props.dateObserved)
        {
            return [true, <>{props.dateObserved}</>];
        }
        else
        {
            return [false, <>Ei havaintoa</>];
        }
    })();

    return <div className={`BirdSearchResult ${!hasBeenPreviouslyObserved? "not-previously-observed" : ""}`.trim()}
                onClick={()=>{if (!hasBeenPreviouslyObserved) props.clickCallback(props.bird)}}>
                    <BirdThumbnail bird={props.bird} useLazyLoading={false}/>
                    <div className="card">
                        <div className="bird-name">
                            {props.bird.species}
                            {props.placeObserved? <GeoTag place={props.placeObserved}/> : <></>}
                        </div>
                        <div className="date-observed" style={{marginTop: props.placeObserved? "-1px" : ""}}>
                            {/* Note: We move the date string up by 1 pixel if the GeoTag is shown, to counter
                              * the GeoTag pushing the line down by that much. It only does so when its font-size
                              * property is set below 85% or so; which it is, hence this kludge.*/}
                            {dateObserved}
                        </div>
                    </div>
           </div>
}

BirdSearchResult.validate_props = function(props)
{
    panic_if_not_type("function", props.clickCallback);

    return;
}
