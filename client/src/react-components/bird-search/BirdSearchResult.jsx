"use strict";

import {panic_if_not_type} from "../../assert.js"
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

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
            return [false, <>Ei aiempaa havaintoa</>];
        }
    })();

    return <div className={`BirdSearchResult ${!hasBeenPreviouslyObserved? "not-previously-observed" : ""}`.trim()}
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

BirdSearchResult.validate_props = function(props)
{
    panic_if_not_type("function", props.clickCallback);

    return;
}
