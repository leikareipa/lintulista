/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {render_observation_date_prompt, unrender_observation_date_prompt} from "../../render/render-observation-date-prompt.js";
import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {panic_if_undefined} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {animate} from "../../animate.js";
import {GeoTag} from "../misc/GeoTag.js";
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

    // Used to start an animation on a particular element. Will take in an object of the
    // form {ref, name, callback}, where 'ref' is a React reference to the element on which
    // to play the animation; 'name' is the name of the animation; and 'callback' is an
    // optional callback for when the animation finishes. For more information, see the
    // documentation for animate(). Set to null to play no animation.
    const [animation, nextAnimation] = React.useState(null);

    const refs =
    {
        date: React.useRef(),
        geotag: React.useRef(),
    }

    React.useEffect(()=>
    {
        if (animation)
        {
            animate(animation.ref.current, animation.name, (animation.callback || (()=>{})));
            nextAnimation(null);
        }
    }, [animation])

    return <div className="ObservationListElement" onMouseEnter={()=>setMouseHovering(true)}
                                                   onMouseLeave={()=>setMouseHovering(false)}>
                <BirdThumbnail bird={observationData.bird}/>
                <span className="name">
                    {observationData.bird.species}
                    <div ref={refs.geotag} style={{display:"inline-block"}}>
                        {/* The GeoTag is encased in a div to allow animations via a local React ref.*/}
                        <GeoTag place={observationData.place}/>
                    </div>
                    <br/>
                    <span className="observation-details">
                        <div className="date" ref={refs.date}>
                            {observationData.dateString}
                        </div>
                        <br/>
                        <div className="classification">
                            {observationData.bird.order}
                            <i className="fas fa-caret-right fa-sm" style={{margin:"6px"}}></i>
                            {observationData.bird.family}
                        </div>
                    </span>
                </span>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    buttons={[
                    {
                        icon: "fas fa-eraser",
                        title: "Poista havainto",
                        titleWhenClicked: "Poistetaan havaintoa",
                        task: button_remove_observation,
                    },
                    {
                        icon: "fas fa-map-marked-alt",
                        title: "Merkitse havainnon paikka",
                        titleWhenClicked: "Merkitään havainnon paikkaa",
                        task: button_change_observation_place,
                    },
                    {
                        icon: "fas fa-clock",
                        title: "Aseta havainnon päivämäärä",
                        titleWhenClicked: "Asetetaan havainnon päivämäärää",
                        task: button_change_observation_date,
                    },
                ]} />
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
            nextAnimation({ref:refs.date, name:"jump"});
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

        // Prompt the user to enter a new place.
        await props.shades.put_on();
        /* TODO*/
        const newPlace = prompt("Enter a place name");

        // Send the new place to the server.
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
            nextAnimation({ref:refs.geotag, name:"jump"});
        }

        resetButtonState("enabled");
        setKeepButtonBarVisible(false);
        await props.shades.pull_off();
    }
}

ObservationListElement.validate_props = function(props)
{
    panic_if_undefined(props, props.shades, props.observation);

    return;
}
