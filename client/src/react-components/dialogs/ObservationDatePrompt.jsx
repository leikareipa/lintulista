/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ScrollerLabel} from "../scroller-label/ScrollerLabel.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

// Displays a modal dialog with which the user can input a date for an observation.
//
// The observation for which the date is prompted is to be provided via props.observation.
//
// A callback function which receives the date once the dialog closes can be given via
// props.receiveData. It will be called on dialog close with the following object as
// a parameter: {day, month, year}. Note especially that month will be given as 1-indexed,
// such that 1 is January and 12 is December.
//
export function ObservationDatePrompt(props = {})
{
    // Using local variables with the assumption that the dialog won't get re-rendered
    // prior to the user closing it. These values will be returned when the dialog is
    // closed.
    let day = props.observation.date.getDate();
    let month = (props.observation.date.getMonth() + 1);
    let year = props.observation.date.getFullYear();

    React.useEffect(()=>
    {
        return ()=>props.receiveDate({day, month, year});
    })

    return <div className="ObservationDatePrompt">
               <div className="title">
                   <i className="fas fa-clock"></i> Aseta havainnon päivämäärä
               </div>
               <div className="form">
                    <BirdThumbnail bird={props.observation.bird}/>
                    <div className="fields">
                        <div className="bird-name">
                            {props.observation.bird.species}:
                        </div>
                        <div className="date-bar">
                            <div className="day">
                                <ScrollerLabel type="integer"
                                               min={1}
                                               max={31}
                                               suffix="."
                                               value={day}
                                               onChange={(value)=>{day = value;}}/>
                            </div>
                            <div className="month">
                                <ScrollerLabel type="month-name"
                                               min={1}
                                               max={12}
                                               language="fi"
                                               suffix="ta"
                                               value={month}
                                               onChange={(value)=>{month = value;}}/>
                            </div>
                            <div className="year">
                                <ScrollerLabel type="integer"
                                               min={1}
                                               max={5000}
                                               suffix=""
                                               value={year}
                                               onChange={(value)=>{year = value;}}/>
                            </div>
                        </div>
                    </div>
               </div>
           </div>
}
