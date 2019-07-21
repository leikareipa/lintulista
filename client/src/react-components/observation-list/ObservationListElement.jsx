/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

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

    const geoTag = (props.observation.place? <GeoTag place={props.observation.place} /> : <></>);

    return <div className="ObservationListElement" onMouseEnter={()=>setMouseHovering(true)}
                                                   onMouseLeave={()=>setMouseHovering(false)}>
                <BirdThumbnail bird={props.observation.bird}/>
                <span className="name">
                    {props.observation.bird.species}
                    {geoTag}
                    <br/>
                    <span className="observation-details">
                        <span className="date" title={props.observation.date.toLocaleString()}>
                            {props.observation.dateString}
                        </span>
                        <br/>
                        <span className="classification">
                            Luokka: {props.observation.bird.order}
                            <i className="fas fa-caret-right fa-xs" style={{margin:"6px"}}></i>
                            {props.observation.bird.family}
                        </span>
                    </span>
                </span>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    shades={props.shades}
                                    buttons={[
                    {
                        icon: "fas fa-clock",
                        title: "Aseta havainnon päivämäärä",
                        titleWhenClicked: "Asetetaan havainnon päivämäärää",
                        task: async({resetButtonState})=>
                        {
                            setKeepButtonBarVisible(true);
                            resetButtonState();

                            props.shades.put_on();
                            await delay(400);
                            await props.openSetDateDialog();

                            await props.shades.pull_off();

                            //resetButtonState();
                            resetButtonState("waiting")
                            //setKeepButtonBarVisible(false);
                        },
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
                ]} />
            </div>
}

ObservationListElement.validate_props = function(props)
{
    panic_if_undefined(props, props.shades);

    return;
}
