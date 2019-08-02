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
               Listassa on yhteensä&nbsp;
               <span className="observation-count">
                   {props.numObservationsInList}
               </span> havaintoa.&nbsp;
               <span onClick={props.callbackDownloadList} style={{textDecoration:"underline", cursor:"pointer"}}>
                   Lataa lista CSV-tiedostona
               </span>.
           </div>
}

ObservationListFooter.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("number", props.numObservationsInList);
    panic_if_not_type("function", props.callbackDownloadList);
    
    return;
}
