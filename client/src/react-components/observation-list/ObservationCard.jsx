/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic, panic_if_not_type} from "../../assert.js";
import {QueryObservationDeletion} from "../dialogs/QueryObservationDeletion.js";
import {QueryObservationDate} from "../dialogs/QueryObservationDate.js";
import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {ObservationInfo} from "./ObservationInfo.js";
import {darken_viewport} from "../../darken_viewport.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

export function ObservationCard(props = {})
{
    ObservationCard.validate_props(props);

    // For watching whether the mouse is currently hovering over this element.
    const [mouseHovering, setMouseHovering] = React.useState(false);

    // The data used to populate the element's fields. May be altered e.g. when the
    // user requests to change the observation date or place.
    const [observationData, setObservationData] = React.useState(props.observation);

    // A list of the buttons to be displayed on the element's button bar.
    const buttonBarButtons = Object.freeze([
        {
            icon: "fas fa-eraser",
            title: "Poista havainto",
            titleWhenClicked: "Poistetaan havaintoa",
            task: button_remove_observation,
        },
        {
            icon: "fas fa-clock",
            title: "Merkitse havaintopäivä",
            titleWhenClicked: "Asetetaan havainnon päivämäärää",
            task: button_change_observation_date,
        },
    ]);

    // Functions that can be called to cause animative effects on particular elements.
    // These will be callbacks to the ObservationInfo component, initialized to their
    // proper values when that component initializes.
    let animation =
    {
        pulseDateElement: ()=>{},
    }

    return <div className="ObservationCard"
                onMouseOver={()=>setMouseHovering(true)}
                onMouseLeave={()=>setMouseHovering(false)}>
                    {props.tag}
                    <BirdThumbnail bird={observationData.bird}/>
                    <div className="info">
                        <ObservationInfo observation={observationData}
                                         setAnimationCallbacks={(animCallbacks)=>{animation = animCallbacks;}}/>
                    </div>
                    {props.allowEditing? <AsyncIconButtonBar buttons={buttonBarButtons} visible={mouseHovering}/> : <></>}
                    
           </div>

    async function popup_dialog(dialogComponent, args = {})
    {
        props.callbackSetActionBarEnabled(false);
        const shades = await darken_viewport({z:110, opacity:0.5});
        await open_modal_dialog(dialogComponent, args);
        props.callbackSetActionBarEnabled(true);
        await shades.remove();
    }

    // When a button is pressed to delete the observation. Will requests the backend to
    // remove this observation from the user's list of observations. Takes in a callback
    // to reset the button's state.
    async function button_remove_observation({resetButtonState})
    {
        resetButtonState();

        await popup_dialog(QueryObservationDeletion,
        {
            observation: observationData,
            onAccept: async()=>
            {
                await props.requestDeleteObservation(observationData);
            }
        });
    }

    // When a button is pressed to change the observation's date. Will prompt the user to
    // enter a new date, then submits the given date to the server to be saved. Takes in a
    // callback to reset the button's state.
    async function button_change_observation_date({resetButtonState})
    {
        resetButtonState();

        await popup_dialog(QueryObservationDate,
        {
            observation: observationData,
            onAccept: async(newDate)=>
            {
                // Send the new place string to the server.
                if (newDate !== null)
                {
                    const updatedObservation = await props.requestChangeObservationDate(observationData, newDate);

                    if (updatedObservation)
                    {
                        pulse_changed_elements(observationData, updatedObservation);
                        setObservationData(updatedObservation);
                    }
                    else
                    {
                        panic("Failed to update the date of an observation.");
                    }
                }
            }
        });
    }

    // Compares the old data (the current observation parameters) with proposed new ones;
    // any new parameters that differ from the existing ones will cause the corresponding
    // DOM elements to be given a brief animation to indicate to the user that their values
    // have changed.
    async function pulse_changed_elements(oldData, newData)
    {
        if (newData.unixTimestamp !== oldData.unixTimestamp)
        {
            animation.pulseDateElement();
        }
    }
}

ObservationCard.defaultProps =
{
    callbackSetActionBarEnabled: ()=>{},
    showOrderTag: false,
    visible: true,
    tag: <></>,
}

ObservationCard.validate_props = function(props)
{
    panic_if_not_type("object", props, props.observation);

    return;
}
