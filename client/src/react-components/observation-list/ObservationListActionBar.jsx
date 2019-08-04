/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";

// Renders a set of 'action elements' i.e. buttons and the like with which the user can
// control certain aspects of the observation list; like to select the order in which to
// sort the list's items, to search for entries in the list via a search bar, etc.
//
// This component needs access to Lintulista's backend, so a relevant backend() object
// should be provided via props.backend.
//
// A callback for when the user requests a new observation to be added to the list is to
// be provided via props.callbackOnAddObservation. It will be passed one parameter: a bird()
// object describing the species of which the user wants an observation added.
//
// A callback for when the user requests to change the list's sorting order is to be
// provided via props.callbackSetListSorting. It will be passed one parameter: a string
// describing the new sorting order.
//
export function ObservationListActionBar(props = {})
{
    ObservationListActionBar.validate_props(props);

    return <div className="ObservationListActionBar">
               <BirdSearch backend={props.backend}
                           callbackSelectedBird={props.callbackAddObservation}/>
               <MenuButton icon="fas fa-list-ul fa-fw"
                           title="Listan järjestys"
                           items={
                           [
                               {text:"Laji", callbackOnSelect:()=>props.callbackSetListSorting("species")},
                               {text:"Päivä", callbackOnSelect:()=>props.callbackSetListSorting("date")},
                               {text:"100 Lajia -haaste", callbackOnSelect:()=>props.callbackSetListSorting("100-lajia")},
                           ]}
                           initialItemIdx={1}
                           showTooltip={true}/>
               <MenuButton icon={props.backend.hasEditRights? "fas fa-unlock-alt fa-fw" : "fas fa-lock fa-fw"}
                           title={props.backend.hasEditRights? "Avaa listan julkinen versio" : "Julkista listaa ei voi muokata"}
                           enabled={props.backend.hasEditRights}
                           callbackOnButtonClick={!props.backend.hasEditRights? null : ()=>
                           {
                               if (!window.open(`./${props.backend.viewKey}`, "_blank", "noopener"))
                               {
                                    /// TODO. Handle popup blocking.
                               }
                           }}
                           showTooltip={false}/>
           </div>
}

ObservationListActionBar.validate_props = function(props)
{
    panic_if_not_type("object", props, props.backend);
    panic_if_not_type("function", props.callbackAddObservation, props.callbackSetListSorting);

    return;
}
