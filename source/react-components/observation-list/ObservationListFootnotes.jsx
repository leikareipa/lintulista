/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {tr} from "../../translator.js";
import {lla_export_observations_to_csv} from "../../action-export-obs-to-csv.js";

// Displays footnotes at the bottom of the list (or of the screen); providing information like
// the total number of observations in the current list.
//
export function ObservationListFootnotes(props = {})
{
    ObservationListFootnotes.validate_props(props);

    const observations = ReactRedux.useSelector(state=>state.observations);

    const obsCount = observations.length
        ? <>{tr("The list has %1 species", observations.length)}.</>
        : <>{tr("The list is currently empty")}</>

    const obsDownload = observations.length
        ? <span onClick={async()=>await lla_export_observations_to_csv.async({observations})}
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
    
    return;
}
