/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {ScrollerLabel} from "../scroller-label/ScrollerLabel.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {Dialog} from "./Dialog.js"

// Displays a modal dialog with which the user can confirm that they want to add the given
// bird as a new observation. The dialog also lets the user specify a date for the observation.
//
// The bird proposed to be added as a new observation should be given via props.bird. It
// should be a bird() object.
//
// If the user accepts the dialog, the callback provided via props.onDialogAccept will be
// called with the object {day, month, year} as a parameter, giving the user-provided date for
// the new observation. Note that 'month' will be given as a 1-indexed value, such that e.g.
// 1 is January and 12 is December.
//
// If the user rejects the dialog, the callback provided via props.onDialogReject will be
// called. It will receive no parameters.
//
export function QueryAddNewObservation(props = {})
{
    QueryAddNewObservation.validateProps(props);

    // Using local variables with the assumption that the dialog won't get re-rendered
    // prior to the user closing it. These values will be returned when the dialog is
    // closed.
    const date = new Date();
    let day = date.getDate();
    let month = (date.getMonth() + 1);
    let year = date.getFullYear();

    return <Dialog component="QueryAddNewObservation"
                   title="Lisätäänkö havainto?"
                   titleIcon="fas fa-crow"
                   onDialogAccept={()=>close_dialog(true)}
                   onDialogReject={()=>close_dialog(false)}>
               <BirdThumbnail bird={props.bird}/>
               <div className="fields">
                   <div className="bird-name">
                       {props.bird.species}:
                   </div>
                   <div className="date-bar">
                       <div className="day">
                           <ScrollerLabel type="integer"
                                          min={1}
                                          max={31}
                                          suffix="."
                                          value={day}
                                          onChange={(value)=>{day = value}}/>
                       </div>
                       <div className="month">
                           <ScrollerLabel type="month-name"
                                          min={1}
                                          max={12}
                                          language="fi"
                                          suffix="ta"
                                          value={month}
                                          onChange={(value)=>{month = value}}/>
                       </div>
                       <div className="year">
                           <ScrollerLabel type="integer"
                                          min={1}
                                          max={5000}
                                          suffix=""
                                          value={year}
                                          onChange={(value)=>{year = value}}/>
                       </div>
                   </div>
               </div>
           </Dialog>

    function close_dialog(accept = true)
    {
        switch (accept)
        {
            case true: props.onDialogAccept({day, month, year}); break;
            default: props.onDialogReject(); break;
        }
    }
}

QueryAddNewObservation.validateProps = function(props)
{
    panic_if_not_type("object", props, props.bird);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
