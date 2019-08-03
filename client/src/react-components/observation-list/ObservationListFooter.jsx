/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

// Displays a footer at the bottom of the screen; providing information like the total
// number of observations in the current list.
//
// The current number of observations in the list can be given via props.numObservationsInList.
//
// A callback for when the user requests to download the list's contents as a CSV file
// should be provided via props.callbackDownloadList.
//
export function ObservationListFooter(props = {})
{
    ObservationListFooter.validate_props(props);

    return <div className="ObservationListFooter">
               <div className="observation-count">
                   <i className="fas fa-info-circle"/> Listassa on&nbsp;
                   <span className="value">
                       {props.numObservationsInList}
                   </span> havainto{props.numObservationsInList !== 1? "a" : ""}.&nbsp;
                   <span onClick={props.callbackDownloadList} style={{textDecoration:"underline", cursor:"pointer"}}>
                       Tallenna CSV:nä
                   </span>
               </div>
           </div>
}

ObservationListFooter.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("number", props.numObservationsInList);
    panic_if_not_type("function", props.callbackDownloadList);
    
    return;
}
