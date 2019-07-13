"use strict";

import {ObservationListElement} from "./ObservationListElement.js";

export function ObservationList(props = {})
{
    return <div className="ObservationList">
               {props.observations.map((obs, idx)=><ObservationListElement observation={obs} key={idx} />)}
           </div>
}
