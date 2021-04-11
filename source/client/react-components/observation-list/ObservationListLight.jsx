/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {merge_100_lajia_with} from "../../100-lajia-observations.js";
import {ObservationListFootnotes} from "./ObservationListFootnotes.js";
import {ObservationListMenuBar} from "./ObservationListMenuBar.js";
import {ObservationCard} from "./ObservationCard.js";
import {LL_Observation} from "../../observation.js";
import * as FileSaver from "../../filesaver/FileSaver.js"; /* For saveAs().*/

function cards_from_observations(observations = [Observation])
{
    panic_if_not_type("array", observations);

    return observations.map(obs=>
        <ObservationCard
            observation={obs}
            isGhost={obs.isGhost}
            key={obs.species}
        />
    );
}

// Lintulista's main component; displays the user's list of observations as a series of
// ObservationCards. Also provides means to search the list for particular observations
// and to add/delete/modify observations.
//
// Access to the user's list of observations on Lintulista's backend is to be provided
// via backend as a BackendAccess() object.
//
export function ObservationListLight(props = {})
{
    ObservationListLight.validate_props(props);

    const observations = ReactRedux.useSelector(state=>state.observations);
    const is100LajiaMode = ReactRedux.useSelector(state=>state.is100LajiaMode);

    const [isMenuBarEnabled, setIsMenuBarEnabled] = React.useState(true);

    return <div className="ObservationList">

        {/* A collection of controls with which the user can alter aspects of the list; for instance,
          * the sorting order of its cards.*/}
        <ObservationListMenuBar
            enabled={isMenuBarEnabled}
            backend={props.backend}
            callbackSetListSorting={()=>{}}
        />

        <div className={"observation-cards"}>

            {cards_from_observations(is100LajiaMode? merge_100_lajia_with(observations) : observations)}

        </div>

        <ObservationListFootnotes
            numObservationsInList={observations.length}
            callbackDownloadList={save_observations_to_csv_file}
        />
                            
    </div>

    function save_observations_to_csv_file()
    {
        let csvString = "Päivämäärä, Laji\n";

        observations.forEach(obs=>{
            csvString += `${LL_Observation.date_string(obs)}, ${obs.species||""},\n`;
        });

        saveAs(new Blob([csvString], {type: "text/plain;charset=utf-8"}), "lintulista.csv");
    }
}

ObservationListLight.validate_props = function(props)
{
    panic_if_undefined(props.backend);

    return;
}
