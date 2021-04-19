/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        ll_assert_type} from "../../assert.js";
import {merge_100_lajia_with} from "../../100-lajia.js";
import {ObservationListFootnotes} from "./ObservationListFootnotes.js";
import {ObservationListMenuBar} from "./ObservationListMenuBar.js";
import {ObservationCard} from "./ObservationCard.js";
import {LL_Observation} from "../../observation.js";
import {LL_Backend} from "../../backend.js";

// Lintulista's main component; displays the user's list of observations as a series of
// ObservationCards. Also provides means to search the list for particular observations
// and to add/delete/modify observations.
//
// Access to the user's list of observations on Lintulista's backend is to be provided
// via backend as a LL_Backend() object.
//
export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    const language = ReactRedux.useSelector(state=>state.language);
    const observations = ReactRedux.useSelector(state=>state.observations);
    const is100LajiaMode = ReactRedux.useSelector(state=>state.is100LajiaMode);
    
    return <div className="ObservationList"
                data-language={language}>

        {/* A collection of controls with which the user can alter aspects of the list; for instance,
          * the sorting order of its cards.*/}
        <ObservationListMenuBar
            enabled={true}
            backend={props.backend}
        />

        <div className={"observation-cards"}>

            {cards_from_observations(is100LajiaMode? merge_100_lajia_with(observations) : observations)}

        </div>

        <ObservationListFootnotes/>
                            
    </div>

    function cards_from_observations(observations = [Observation])
    {
        ll_assert_native_type("array", observations);

        return observations.map(obs=>{
            ll_assert_type(LL_Observation, obs);
            return <ObservationCard
                observation={obs}
                isGhost={obs.isGhost}
                key={obs.species}
            />
        });
    }
}

ObservationList.validate_props = function(props)
{
    ll_assert_type(LL_Backend, props.backend);

    return;
}
