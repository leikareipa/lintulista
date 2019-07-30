/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ObservationListElement} from "./ObservationListElement.js";
import {panic_if_undefined} from "../../assert.js";
import {observation} from "../../observation.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";

export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    const [sortObservationsBy, setSortObservationsBy] = React.useState("date");
    const sorters =
    {
        species: (a, b)=>(a.bird.species < b.bird.species? -1 : a.bird.species > b.bird.species? 1 : 0),
        family: (a, b)=>(a.bird.family < b.bird.family? -1 : a.bird.family > b.bird.family? 1 : 0),
        order: (a, b)=>(a.bird.order < b.bird.order? -1 : a.bird.order > b.bird.order? 1 : 0),
        date: (a, b)=>(a.unixTimestamp < b.unixTimestamp? 1 : a.unixTimestamp > b.unixTimestamp? -1 : 0),
    };

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    const [searchFieldKey, setSearchFieldKey] = React.useState(0);

    React.useEffect(()=>
    {
        setObservationElements(generate_observation_elements());
    }, [sortObservationsBy])

    return <div className="ObservationList">
               <div className="search">
                   <BirdSearch key={searchFieldKey}
                               shades={props.shades}
                               backend={props.backend}
                               shadesOnClick={reset_search_field}
                               selectionCallback={(bird)=>add_observation(bird)}/>
               </div>
               <div className="sorter">
                   Listan järjestys:
                   <select defaultValue={sortObservationsBy}
                           onChange={(event)=>setSortObservationsBy(event.target.value)}>
                       <option value="species">Lajinimi</option>
                       <option value="order">Lahko ja heimo</option>
                       <option value="date">Havaintopäivä</option>
                   </select>
               </div>
               <div className="elements">
                   {observationElements}
               </div>
           </div>

    // Called when the user requests us to add a new observation into the list.
    async function add_observation(bird)
    {
        reset_search_field();

        await props.shades.pull_off();

        await props.backend.post_observation(observation({bird, date:new Date()}));

        setObservationElements(generate_observation_elements());
    }

    // Clear away any input in the search file, and close any search results that might
    // be open.
    function reset_search_field()
    {
        props.shades.pull_off();
        setSearchFieldKey(searchFieldKey + 1);
    }

    function generate_observation_elements()
    {
        return sort_observation_list(props.backend.observations().slice()).map(obs=>
        {
            return <ObservationListElement observation={obs}
                                           key={obs.bird.species}
                                           shades={props.shades}
                                           maxPlaceNameLength={props.backend.backend_limits().maxPlaceNameLength}
                                           requestDeleteObservation={async(self)=>await delete_observation(self)}
                                           requestChangeObservationDate={async(self, newDate)=>await set_observation_date(self, newDate)}
                                           requestChangeObservationPlace={async(self, newPlace)=>await set_observation_place(self, newPlace)}/>
        });
    }

    function sort_observation_list(list)
    {
        switch (sortObservationsBy)
        {
            case "order": return list.sort(sorters.family).sort(sorters.order);
            default: return list.sort(sorters[sortObservationsBy]);
        }
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

        if (sortObservationsBy === "date")
        {
            setObservationElements(generate_observation_elements());
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
