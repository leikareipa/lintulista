/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationListElement} from "./ObservationListElement.js";
import {panic_if_undefined} from "../../assert.js";

export function ObservationList(props = {})
{
    panic_if_undefined(props.backend);

    const observationElements = props.backend.observations().map((obs, idx)=><ObservationListElement observation={obs} key={idx} />);

    return <div className="ObservationList">{observationElements}</div>
}
