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

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    return <div className="ObservationList">
               {observationElements}
           </div>

    function generate_observation_elements()
    {
        return props.backend.observations().map(obs=>
        {
            return <ObservationListElement observation={obs}
                                           key={obs.bird.species}
                                           shades={props.shades}
                                           requestDeleteObservation={async(self)=>await delete_observation(self)}
                                           requestChangeObservationDate={async(self, newDate)=>await set_observation_date(self, newDate)}
                                           requestChangeObservationPlace={async(self, newPlace)=>await set_observation_place(self, newPlace)}/>
        });
    }

    async function delete_observation(targetObservation)
    {
        await props.backend.delete_observation(targetObservation);
        setObservationElements(generate_observation_elements());
    }

    // Alters an existing observation's date to match the given year, month (1-12), and
    // day (1-31). Returns the updated observation; or null on error.
    async function set_observation_date(existingObservation, {year, month, day})
    {
        panic_if_undefined(existingObservation, year, month, day);

        const modifiedObservation = observation(
        {
            bird: existingObservation.bird,
            date: new Date(year, month-1, day),
        });

        if (!(await props.backend.post_observation(modifiedObservation)))
        {
            return null;
        }

        return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
    }

    // Alters an existing observation's place. Returns the updated observation; or null
    // on error.
    async function set_observation_place(existingObservation, newPlace)
    {
        panic_if_undefined(existingObservation, newPlace);

        const modifiedObservation = observation(
        {
            ...existingObservation,
            place: newPlace,
        });

        if (!(await props.backend.post_observation(modifiedObservation)))
        {
            return null;
        }

        return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
    }
}

ObservationList.validate_props = function(props)
{
    panic_if_undefined(props.backend, props.shades);

    return;
}
