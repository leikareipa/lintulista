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
import {GeoTag} from "../misc/GeoTag.js";
import {delay} from "../../delay.js";

export function ObservationListElement(props = {})
{
    ObservationListElement.validate_props(props);

    // For watching whether the mouse is currently hovering over this element.
    const [mouseHovering, setMouseHovering] = React.useState(false);

    // While set to true, the element's button bar will be displayed at all times.
    const [keepButtonBarVisible, setKeepButtonBarVisible] = React.useState(false);

    const geoTag = (props.observation.place? <GeoTag place={props.observation.place}/> : <></>);

    return <div className="ObservationListElement" onMouseEnter={()=>setMouseHovering(true)}
                                                   onMouseLeave={()=>setMouseHovering(false)}>
                <BirdThumbnail bird={props.observation.bird}/>
                <span className="name">
                    {props.observation.bird.species}
                    {geoTag}
                    <br/>
                    <span className="observation-details">
                        <span className="date">
                            {props.observation.dateString}
                        </span>
                        <br/>
                        <span className="classification">
                            {props.observation.bird.order}
                            <i className="fas fa-caret-right fa-sm" style={{margin:"6px"}}></i>
                            {props.observation.bird.family}
                        </span>
                    </span>
                </span>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    shades={props.shades}
                                    buttons={[
                    {
                        icon: "fas fa-eraser",
                        title: "Poista havainto",
                        titleWhenClicked: "Poistetaan havaintoa",
                        task: async()=>
                        {
                            props.shades.put_on();
                            setKeepButtonBarVisible(true);

                            await delay(1300);
                            await props.requestDeletion();

                            props.shades.pull_off();
                        }
                    },
                    {
                        icon: "fas fa-map-marked-alt",
                        title: "Merkitse havainnon paikka",
                        titleWhenClicked: "Merkitään havainnon paikkaa",
                        task: async({resetButtonState})=>
                        {
                            props.shades.put_on();
                            setKeepButtonBarVisible(true);

                            await delay(800);
                            await props.shades.pull_off();

                            resetButtonState("disabled");
                            setKeepButtonBarVisible(false);
                        },
                    },
                    {
                        icon: "fas fa-clock",
                        title: "Aseta havainnon päivämäärä",
                        titleWhenClicked: "Asetetaan havainnon päivämäärää",

                        // Prompt the user to enter a new date for the observation, then
                        // submit the given date to the server to be saved.
                        task: async({resetButtonState})=>
                        {
                            setKeepButtonBarVisible(true);
                           // resetButtonState();

                            // Prompt the user to enter a new date.
                            await props.shades.put_on({onClick: unrender_observation_date_prompt});
                            const newDate = await render_observation_date_prompt(props.observation);

                            // Send the new date to the server.
                            //resetButtonState("waiting");
                            await props.requestSetDate(newDate);

                            await props.shades.pull_off({onClick: null});

                           // resetButtonState();
                           // setKeepButtonBarVisible(false);
                        },
                    },
                ]} />
            </div>
}

ObservationListElement.validate_props = function(props)
{
    panic_if_undefined(props, props.shades);

    return;
}
