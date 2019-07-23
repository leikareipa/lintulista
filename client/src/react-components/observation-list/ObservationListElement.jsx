/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {render_observation_date_prompt, unrender_observation_date_prompt} from "../../render/render-observation-date-prompt.js";
import {QueryObservationPlace} from "../dialogs/QueryObservationPlace.js";
import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {panic_if_undefined} from "../../assert.js";
import {ObservationInfo} from "../misc/ObservationInfo.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {open_dialog} from "../../open-dialog.js";
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
                <BirdThumbnail bird={observationData.bird}/>
                <ObservationInfo observation={observationData}
                                 setAnimationCallbacks={(animCallbacks)=>{animation = animCallbacks;}}/>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    buttons={buttonBarButtons} />
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
        setKeepButtonBarVisible(true);
        resetButtonState();

        // Prompt the user to enter a new date.
        await props.shades.put_on({onClick: unrender_observation_date_prompt});
        const newDate = await render_observation_date_prompt(observationData);

        // Send the new date to the server.
        resetButtonState("waiting");
        const updatedObservation = await props.requestChangeObservationDate(observationData, newDate);

        if (!updatedObservation)
        {
            panic("Failed to update the date of an observation.");
        }
        else
        {
            await delay(1500);
            setObservationData(updatedObservation);
            animation.pulseDateElement();
        }

        resetButtonState("enabled");
        setKeepButtonBarVisible(false);
        await props.shades.pull_off();
    }

    // When a button is pressed to change the observation's place. Will prompt the user to
    // enter a new place name, then submits the given place name to the server to be saved.
    // Takes in a callback to reset the button's state.
    async function button_change_observation_place({resetButtonState})
    {
        setKeepButtonBarVisible(true);
        resetButtonState();

        /// Prompt the user to enter a new place.
        await props.shades.put_on();
        const newPlace = await open_dialog(QueryObservationPlace,
        {
            observation: observationData,
        });

        // Send the new place to the server.
        if (newPlace !== null)
        {
            resetButtonState("waiting");
            
            const updatedObservation = await props.requestChangeObservationPlace(observationData, newPlace);

            if (!updatedObservation)
            {
                panic("Failed to update the place of an observation.");
            }
            else
            {
                await delay(1500);
                setObservationData(updatedObservation);
                animation.pulseGeoTagElement();
            }

            resetButtonState("enabled");
        }

        setKeepButtonBarVisible(false);
        await props.shades.pull_off();
    }
}

ObservationListElement.validate_props = function(props)
{
    panic_if_undefined(props, props.shades, props.observation);

    return;
}
