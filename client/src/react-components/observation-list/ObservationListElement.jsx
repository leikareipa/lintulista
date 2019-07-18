/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {AsyncIconButtonBar} from "../buttons/AsyncIconButtonBar.js";
import {GeoTag} from "../misc/GeoTag.js";
import {panic_if_undefined} from "../../assert.js";

export function ObservationListElement(props = {})
{
    panic_if_undefined(props, props.shades);

    // For lazy image loading.
    const thumbnailRef = React.createRef();
    const [thumbnailSrc, setThumbnailSrc] = React.useState("./client/assets/images/placeholder-bird-thumbnail.png");
    const intersectionObserver = new IntersectionObserver(([element])=>
    {
        if (element.isIntersecting)
        {
            setThumbnailSrc(props.observation.bird.thumbnailUrl);
            intersectionObserver.disconnect();
        }
    });

    // For watching whether the mouse is currently hovering over this element.
    const [mouseHovering, setMouseHovering] = React.useState(false);

    // While set to true, the element's button bar will be displayed at all times.
    const [keepButtonBarVisible, setKeepButtonBarVisible] = React.useState(false);

    React.useEffect(()=>
    {
        intersectionObserver.observe(thumbnailRef.current);
    });

    const geoTag = (props.observation.place? <GeoTag place={props.observation.place} /> : <></>);

    return <div className="ObservationListElement" onMouseEnter={signal_mouse_enter}
                                                   onMouseLeave={signal_mouse_leave}>
                <img className="image" referrerPolicy="no-referrer"
                                       title={props.observation.bird.name}
                                       src={thumbnailSrc}
                                       ref={thumbnailRef} />
                <span className="name">
                    {props.observation.bird.name}
                    {geoTag}
                    <br />
                    <span className="observation-details">
                        {props.observation.dateString}
                    </span>
                </span>
                <AsyncIconButtonBar visible={mouseHovering || keepButtonBarVisible}
                                    shades={props.shades}
                                    buttons={[
                    {
                        icon: "fas fa-eraser",
                        title: `Poista havainto`,
                        titleWhenClicked: `Poistetaan havaintoa...`,
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
                        title: `Merkitse havaintopaikka`,
                        titleWhenClicked: `Merkitään havaintopaikkaa...`,
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
                        title: `Aseta havaintoaika`,
                        titleWhenClicked: `Asetetaan havaintoaikaa...`,
                        task: null,
                    },
                ]} />
            </div>

    function delay(ms)
    {
        return new Promise(resolve=>setTimeout(resolve, ms));
    }

    // Wrappers to avoid arrow functions in props.
    function signal_mouse_enter()
    {
        setMouseHovering(true);
    }
    function signal_mouse_leave()
    {
        setMouseHovering(false);
    }
}
