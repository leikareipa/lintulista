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
            const deleter = ()=>delete_observation(obs);
    
            return <ObservationListElement observation={obs}
                                           key={elementKey++}
                                           requestDeletion={deleter} />
        });
    }
}
