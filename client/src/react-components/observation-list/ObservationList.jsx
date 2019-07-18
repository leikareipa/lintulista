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
    panic_if_undefined(props.backend, props.shades);

    /// Temporary hack. Use a successively incrementing key for the elements, so that when
    /// an element is deleted, the list updates cleanly.
    let elementKey = 0;

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    return <div className="ObservationList">{observationElements}</div>

    async function delete_observation(observation)
    {
        await props.backend.delete_observation(observation);

        setObservationElements(generate_observation_elements());
    }

    function generate_observation_elements()
    {
        return props.backend.observations().map((obs, idx)=>
        {
            return <ObservationListElement observation={obs}
                                           key={elementKey++}
                                           shades={props.shades}
                                           requestDeletion={deleter} />

            async function deleter()
            {
                await delete_observation(obs)
            }
        });
    }
}
