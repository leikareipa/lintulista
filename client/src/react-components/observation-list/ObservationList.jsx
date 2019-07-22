/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationListElement} from "./ObservationListElement.js";
import {panic_if_undefined, panic} from "../../assert.js";
import {observation} from "../../observation.js";

export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    return <div className="ObservationList">{observationElements}</div>

    async function delete_observation(targetObservation)
    {
        await props.backend.delete_observation(targetObservation);
        setObservationElements(generate_observation_elements());
    }

    // Alters an existing observation's date to match the given year, month (1-12), and
    // day (1-31). Note that the list won't be regenerated automatically, but rather the
    // originating element is expected to call requestRefresh() once this function resolves.
    async function set_observation_date(existingObservation, {year, month, day})
    {
        panic_if_undefined(existingObservation, year, month, day);

        const modifiedObservation = observation(
        {
            bird: existingObservation.bird,
            date: new Date(year, month-1, day),
        });

        await props.backend.post_observation(modifiedObservation);

        return props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species);
    }

    function generate_observation_elements()
    {
        return props.backend.observations().map(obs=>
        {
            return <ObservationListElement observation={obs}
                                           key={obs.bird.species}
                                           shades={props.shades}
                                           requestRefresh={()=>setObservationElements(generate_observation_elements())}
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

