/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {QueryObservationPlace} from "../dialogs/QueryObservationPlace.js";
import {QueryObservationDate} from "../dialogs/QueryObservationDate.js";
import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {panic_if_undefined} from "../../assert.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {ObservationInfo} from "../misc/ObservationInfo.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {delay} from "../../delay.js";

export function ObservationListElement(props = {})
{
    ObservationListElement.validate_props(props);

    // For watching whether the mouse is currently hovering over this element.
    const [mouseHovering, setMouseHovering] = React.useState(false);

    // The data used to populate the element's fields. May be altered e.g. when the
    // user requests to change the observation date or place.
    const [observationData, setObservationData] = React.useState(props.observation);

    // While set to true, the element's button bar will be displayed at all times.
    const [keepButtonBarVisible, setKeepButtonBarVisible] = React.useState(false);

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
            title: "Aseta havainnon sijainti",
            titleWhenClicked: "Merkitään havainnon sijaintia",
            task: button_change_observation_place,
        },
        {
            icon: "fas fa-clock",
            title: "Aseta havainnon päivämäärä",
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

    return <div className="ObservationListElement" onMouseEnter={()=>setMouseHovering(true)}
                                                   onMouseLeave={()=>setMouseHovering(false)}>
                <i className="fas fa-unlock-alt fa-sm" style={{color:"rgba(53, 145, 231, 0.5)", position:"absolute", right:"20px",top:"40px"}}/>
                <BirdThumbnail bird={observationData.bird}/>
                <ObservationInfo observation={observationData}
                                 setAnimationCallbacks={(animCallbacks)=>{animation = animCallbacks;}}/>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    buttons={buttonBarButtons}/>
            </div>

    // When a button is pressed to delete the observation. Will requests the backend to
    // remove this observation from the user's list of observations. Takes in a callback
    // to reset the button's state.
    async function button_remove_observation({resetButtonState})
    {
        setKeepButtonBarVisible(true);
        await props.shades.put_on();

        await delay(1300);
        await props.requestDeleteObservation(observationData);

        await props.shades.pull_off();
    }

    // When a button is pressed to change the observation's date. Will prompt the user to
    // enter a new date, then submits the given date to the server to be saved. Takes in a
    // callback to reset the button's state.
    async function button_change_observation_date({resetButtonState})
    {
        resetButtonState();

        await props.shades.put_on();

        let pulseElement = false;
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
                        await delay(1500);
                        
                        setObservationData(updatedObservation);
                        pulseElement = true;
                    }
                    else
                    {
                        panic("Failed to update the date of an observation.");
                    }
                }
            }
        });

        await props.shades.pull_off();
        if (pulseElement)
        {
            await delay(100);
            animation.pulseDateElement();
        }
    }

    // When a button is pressed to change the observation's place. Will prompt the user to
    // enter a new place name, then submits the given place name to the server to be saved.
    // Takes in a callback to reset the button's state.
    async function button_change_observation_place({resetButtonState})
    {
        resetButtonState();

        await props.shades.put_on();

        let pulseElement = false;
        await open_modal_dialog(QueryObservationPlace,
        {
            observation: observationData,
            onAccept: async(newPlace)=>
            {
                // Send the new place string to the server.
                if (newPlace !== null)
                {
                    const updatedObservation = await props.requestChangeObservationPlace(observationData, newPlace);

                    if (updatedObservation)
                    {
                        await delay(1500);
                        
                        setObservationData(updatedObservation);
                        pulseElement = true;
                    }
                    else
                    {
                        panic("Failed to update the place of an observation.");
                    }
                }
            }
        });

        await props.shades.pull_off();
        if (pulseElement)
        {
            await delay(100);
            animation.pulseGeoTagElement();
        }
    }
}

ObservationListElement.validate_props = function(props)
{
    panic_if_undefined(props, props.shades, props.observation);

    return;
}
