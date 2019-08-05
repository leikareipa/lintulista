/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic, panic_if_not_type} from "../../assert.js";
import {QueryObservationDeletion} from "../dialogs/QueryObservationDeletion.js";
import {QueryObservationPlace} from "../dialogs/QueryObservationPlace.js";
import {QueryObservationDate} from "../dialogs/QueryObservationDate.js";
import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {ObservationInfo} from "./ObservationInfo.js";
import {darken_viewport} from "../../darken_viewport.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

export function ObservationListElement(props = {})
{
    ObservationListElement.validate_props(props);

    const shadeArgs =
    {
        z: 110,
        opacity: 0.5,
    };

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
            icon: "fas fa-map-marked-alt",
            title: "Merkitse havaintopaikka",
            titleWhenClicked: "Merkitään havainnon sijaintia",
            task: button_change_observation_place,
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
        pulseGeoTagElement: ()=>{},
    }

    return <div className={`ObservationListElement ${props.visible? "" : "hidden"}`.trim()}
                onMouseEnter={()=>setMouseHovering(true)}
                onMouseLeave={()=>setMouseHovering(false)}>
                    {props.showOrderTag? <div className="order-tag">{observationData.bird.order}</div> : <></>}
                    {props.tag}
                    <BirdThumbnail bird={observationData.bird}/>
                    <div className="card">
                        <ObservationInfo observation={observationData}
                                         setAnimationCallbacks={(animCallbacks)=>{animation = animCallbacks;}}/>
                    </div>
                    {props.allowEditing? <AsyncIconButtonBar buttons={buttonBarButtons} visible={mouseHovering}/> : <></>}
                    
           </div>

    // When a button is pressed to delete the observation. Will requests the backend to
    // remove this observation from the user's list of observations. Takes in a callback
    // to reset the button's state.
    async function button_remove_observation({resetButtonState})
    {
        resetButtonState();
        props.callbackSetActionBarEnabled(false);

        const shades = await darken_viewport(shadeArgs);

        await open_modal_dialog(QueryObservationDeletion,
        {
            observation: observationData,
            onAccept: async()=>
            {
                await props.requestDeleteObservation(observationData);
            }
        });
        
        props.callbackSetActionBarEnabled(true);

        await shades.remove();
    }

    // When a button is pressed to change the observation's date. Will prompt the user to
    // enter a new date, then submits the given date to the server to be saved. Takes in a
    // callback to reset the button's state.
    async function button_change_observation_date({resetButtonState})
    {
        resetButtonState();
        props.callbackSetActionBarEnabled(false);

        const shades = await darken_viewport(shadeArgs);

        await open_modal_dialog(QueryObservationDate,
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

        props.callbackSetActionBarEnabled(true);

        await shades.remove();
    }

    // When a button is pressed to change the observation's place. Will prompt the user to
    // enter a new place name, then submits the given place name to the server to be saved.
    // Takes in a callback to reset the button's state.
    async function button_change_observation_place({resetButtonState})
    {
        resetButtonState();
        props.callbackSetActionBarEnabled(false);

        const shades = await darken_viewport(shadeArgs);

        await open_modal_dialog(QueryObservationPlace,
        {
            maxPlaceNameLength: props.maxPlaceNameLength,
            observation: observationData,
            onAccept: async(newPlace)=>
            {
                // Send the new place string to the server.
                if (newPlace !== null)
                {
                    const updatedObservation = await props.requestChangeObservationPlace(observationData, newPlace);

                    if (updatedObservation)
                    {
                        pulse_changed_elements(observationData, updatedObservation);
                        setObservationData(updatedObservation);
                    }
                    else
                    {
                        panic("Failed to update the place of an observation.");
                    }
                }
            }
        });

        props.callbackSetActionBarEnabled(true);

        await shades.remove();
    }

    // Compares the old data (the current observation parameters) with proposed new ones;
    // any new parameters that differ from the existing ones will cause the corresponding
    // DOM elements to be given a brief animation to indicate to the user that their values
    // have changed.
    async function pulse_changed_elements(oldData, newData)
    {
        if (newData.place !== oldData.place)
        {
            animation.pulseGeoTagElement();
        }

        if (newData.unixTimestamp !== oldData.unixTimestamp)
        {
            animation.pulseDateElement();
        }
    }
}

ObservationListElement.defaultProps =
{
    callbackSetActionBarEnabled: ()=>{},
    showOrderTag: false,
    visible: true,
    tag: <></>,
}

ObservationListElement.validate_props = function(props)
{
    panic_if_not_type("object", props, props.observation);

    return;
}
