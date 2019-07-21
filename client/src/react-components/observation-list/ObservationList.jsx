/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationListElement} from "./ObservationListElement.js";
import {panic_if_undefined} from "../../assert.js";
import {observation} from "../../observation.js";

export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    /// Temporary hack. Use a successively incrementing key for the elements, so that when
    /// an element is deleted, the list updates cleanly.
    let elementKey = 0;

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    return <div className="ObservationList">{observationElements}</div>

    async function delete_observation(targetObservation)
    {
        await props.backend.delete_observation(targetObservation);
        setObservationElements(generate_observation_elements());
    }

    async function set_observation_date(existingObservation, {year, month, day})
    {
        const modifiedObservation = observation(
        {
            bird: existingObservation.bird,
            date: new Date(year, month-1, day),
        });

        await props.backend.post_observation(modifiedObservation);
        setObservationElements(generate_observation_elements());
    }

    function generate_observation_elements()
    {
        return props.backend.observations().map((obs, idx)=>
        {
            return <ObservationListElement observation={obs}
                                           key={elementKey++}
                                           shades={props.shades}
                                           openSetDateDialog={()=>props.openSetDateDialog(obs)}
                                           requestDeletion={async()=>await delete_observation(obs)}
                                           requestSetDate={async(newDate)=>await set_observation_date(obs, newDate)}/>
        });
    }
}

ObservationList.validate_props = function(props)
{
    panic_if_undefined(props.backend, props.shades);

    return;
}

