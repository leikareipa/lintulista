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

    const observationCountElement = !props.numObservationsInList? <>Listassa ei vielä ole lajihavaintoja. Niiden lukumäärä päivittyy tähän.</>
                                                                : <>
                                                                      Listassa on&nbsp;
                                                                      <span style={{fontWeight:"bold"}}>
                                                                          {props.numObservationsInList}
                                                                      </span> laji{props.numObservationsInList !== 1? "a" : ""}.
                                                                  </>

    const observationDownloadElement = !props.numObservationsInList? <></>
                                                                   : <span onClick={props.callbackDownloadList}
                                                                           style={{textDecoration:"underline", cursor:"pointer"}}>
                                                                         Lataa havaintotiedot
                                                                     </span>

    return <div className="ObservationListFooter">
               <div className="observation-count">
                   <i className="fas fa-info-circle"/>&nbsp;
                   {observationCountElement}&nbsp;
                   {observationDownloadElement}
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
