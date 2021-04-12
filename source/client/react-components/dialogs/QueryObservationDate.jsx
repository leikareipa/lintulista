/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        ll_assert_type} from "../../assert.js";
import {ScrollerLabel} from "../scroller-label/ScrollerLabel.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {Dialog} from "./Dialog.js"
import {tr} from "../../translator.js";
import {LL_Observation} from "../../observation.js";

// Displays a modal dialog with which the user can input a date for an observation.
//
// The observation for which the date is prompted is to be provided via props.observation.
//
// If the user accepts the dialog, the callback provided via props.onDialogAccept will be
// called with the object {day, month, year} as a parameter, giving the user-provided date for
// the observation. Note that 'month' will be given as a 1-indexed value, such that e.g.
// 1 is January and 12 is December.
//
// If the user rejects the dialog, the callback provided via props.onDialogReject will be
// called. It will receive no parameters.
//
export function QueryObservationDate(props = {})
{
    QueryObservationDate.validateProps(props);

    const language = ReactRedux.useSelector(state=>state.language);

    // Using local variables with the assumption that the dialog won't get re-rendered
    // prior to the user closing it. These values will be returned when the dialog is
    // closed.
    let day = props.observation.day;
    let month = props.observation.month;
    let year = props.observation.year;

    return <Dialog component="QueryObservationDate"
                   title={tr("Change observation date")}
                   enterAccepts={true}
                   rejectButtonText={tr("Cancel")}
                   acceptButtonText={tr("Save")}
                   onDialogAccept={accept}
                   onDialogReject={reject}>

        <BirdThumbnail
            species={props.observation.species}
            useLazyLoading={false}
        />

        <div className="fields">

            <div className="bird-name">
                {props.observation.species}
            </div>

            <div className="date-bar">

                <div className="day">
                    <ScrollerLabel
                        type="integer"
                        min={1}
                        max={31}
                        suffix={(language == "fiFI")? "." : ""}
                        value={day}
                        onChange={(value)=>{day = value}}
                    />
                </div>

                <div className="month">
                    <ScrollerLabel
                        type="month-name"
                        min={1}
                        max={12}
                        suffix={(language == "fiFI")? "ta" : ""}
                        value={month}
                        onChange={(value)=>{month = value}}
                    />
                </div>

                <div className="year">
                    <ScrollerLabel
                        type="integer"
                        min={1}
                        max={5000}
                        suffix=""
                        value={year}
                        onChange={(value)=>{year = value}}
                    />
                </div>

            </div>

        </div>

    </Dialog>

    function accept()
    {
        props.onDialogAccept({day, month, year});
    }

    function reject()
    {
        props.onDialogReject();
    }
}

QueryObservationDate.validateProps = function(props)
{
    ll_assert_native_type("object", props);
    ll_assert_native_type("function", props.onDialogAccept, props.onDialogReject);
    ll_assert_type(LL_Observation, props.observation);

    return;
}
