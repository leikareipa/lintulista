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
// Whether the action bar is enabled (true) or disabled (false) can be given as a boolean
// via props.enabled. The only effect of this is that the component's class list will be
// appended with "enabled" or "disabled", accordingly.
//
export function ObservationListMenuBar(props = {})
{
    ObservationListMenuBar.validate_props(props);

    return <div className={`ObservationListMenuBar ${props.enabled? "enabled" : "disabled"}`.trim()}>

               {/* A search field that allows the user to search for specific bird species to be added as
                 * observations.*/}
               <BirdSearch backend={props.backend}
                           callbackSelectedBird={props.callbackAddObservation}/>

               {/* A button with which the user can change the sorting order of the observation list.*/}
               <MenuButton icon="fas fa-list-ul fa-fw"
                           title="Listan järjestys"
                           id="list-order"
                           items={
                           [
                               {text:"Laji", callbackOnSelect:()=>props.callbackSetListSorting("species")},
                               {text:"Päivä", callbackOnSelect:()=>props.callbackSetListSorting("date")},
                               {text:"100 Lajia -haaste", callbackOnSelect:()=>props.callbackSetListSorting("sata-lajia")},
                           ]}
                           initialItemIdx={1}
                           showTooltip={true}/>

               {/* A link that displays either a locked or unlocked lock icon, depending on whether the user
                 * is accessing the list with a view key or an edit key. Clicking the unlocked icon (shown when
                 * accessing with an edit key) will direct the browser to a version of the list using the view
                 * key (with which modifications to the list are not possible; i.e. the list is locked).*/}
               <a className={`lock ${props.backend.hasEditRights? "unlocked" : "locked"}`.trim()}
                  title={props.backend.hasEditRights? "Avaa listan julkinen versio" : "Julkista listaa ei voi muokata"}
                  href={props.backend.hasEditRights? `./${props.backend.viewKey}` : null}
                  rel="noopener noreferrer"
                  target="_blank">
                      <i className={props.backend.hasEditRights? "fas fa-unlock-alt fa-fw" : "fas fa-lock fa-fw"}/>
               </a>
           </div>
}

ObservationListMenuBar.defaultProps =
{
    enabled: true,
}

ObservationListMenuBar.validate_props = function(props)
{
    panic_if_not_type("object", props, props.backend);
    panic_if_not_type("function", props.callbackAddObservation, props.callbackSetListSorting);

    return;
}
