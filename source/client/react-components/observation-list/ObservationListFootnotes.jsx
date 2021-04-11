/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {tr} from "../../translator.js";

// Displays footnotes at the bottom of the list (or of the screen); providing information like
// the total number of observations in the current list.
//
// The current number of observations in the list can be given via props.numObservationsInList.
//
// A callback for when the user requests to download the list's contents as a CSV file should
// be provided via props.callbackDownloadList.
//
export function ObservationListFootnotes(props = {})
{
    ObservationListFootnotes.validate_props(props);

    const obsCount = props.numObservationsInList
        ? <>{tr("The list has %1 species", props.numObservationsInList)}.</>
        : <>{tr("The list is currently empty")}</>

    const obsDownload = props.numObservationsInList
        ? <span onClick={props.callbackDownloadList}
                style={{textDecoration:"underline", cursor:"pointer", fontVariant:"normal"}}>

              {tr("Download as CSV")}

          </span>
        : <></>                                                          

    return <div className="ObservationListFootnotes">
               <div className="observation-count">
                   {obsCount}&nbsp;
                   {obsDownload}
               </div>
           </div>
}

ObservationListFootnotes.validate_props = function(props)
{
    ll_assert_native_type("object", props);
    ll_assert_native_type("number", props.numObservationsInList);
    ll_assert_native_type("function", props.callbackDownloadList);
    
    return;
}
