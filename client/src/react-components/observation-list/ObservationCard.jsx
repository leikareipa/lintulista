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
import {darken_viewport} from "../../darken_viewport.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {animate} from "../../animate.js";

export function ObservationCard(props = {})
{
    ObservationCard.validate_props(props);

    // Used to start an animation on a particular element. Will take in an object of the
    // form {refName, animationName, callback}, where 'refName' identifies a React reference
    // to the element on which to play the animation; 'animationName' is the name of the
    // animation; and 'callback' is an optional callback for when the animation finishes.
    // For more information, see the documentation for animate(). Set to null to play no
    // animation.
    const [animation, queueAnimation] = React.useState(null);

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
    
    // Refs to individual elements in the card; for e.g. animation.
    const refs =
    {
        date: React.useRef(),
    }

    React.useEffect(()=>
    {
        if (animation && refs[animation.refName].current)
        {
            animate(refs[animation.refName].current, animation.animationName, (animation.callback || (()=>{})));
            queueAnimation(null);
        }
    }, [animation]);

    return <div className="ObservationCard"
                onMouseOver={()=>setMouseHovering(true)}
                onMouseLeave={()=>setMouseHovering(false)}>

                    <BirdThumbnail bird={observationData.bird}/>

                    {/* Displays facts about the observation; like what was observed and when.*/}
                    <div className="observation-info">
                        <div className="bird-name">
                            {observationData.bird.species}
                        </div>
                        <div className="date" ref={refs.date}>
                            {observationData.dateString}
                        </div>
                    </div>

                    {/* Provides buttons with which the user can request changes to the observation.*/}
                    {props.allowEditing? <AsyncIconButtonBar buttons={buttonBarButtons} visible={mouseHovering}/> : <></>}
                    
           </div>

    // Pops open the given dialog for the user to interact with. Returns a promise that
    // resolves once the user has closed the dialog.
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
                        queueAnimation({refName:"date", animationName:"jump"});
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
