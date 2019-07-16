/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {AsyncIconButton} from "../buttons/AsyncIconButton.js";

export function ObservationListElement(props = {})
{
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

    // For keeping track of whether the 'delete observation' button has been clicked.
    const [buttonDeleteClicked, setButtonDeleteClicked] = React.useState(false);

    React.useEffect(()=>
    {
        intersectionObserver.observe(thumbnailRef.current);
    });

    return <div className="ObservationListElement" onMouseEnter={()=>{setMouseHovering(true)}}
                                                   onMouseLeave={()=>{setMouseHovering(false)}}>
               <img className="image" title={props.observation.bird.name}
                                      src={thumbnailSrc}
                                      ref={thumbnailRef} />
               <span className="name">
                   {props.observation.bird.name}<br />
                   <span className="observation-details">
                       {props.observation.dateString}
                   </span>
               </span>
               <AsyncIconButton symbol="fas fa-eraser"
                                clickCallback={delete_this_element}
                                style={{display:((mouseHovering || buttonDeleteClicked)? "inherit" : "none")}}
                                title={`Poista havainto: ${props.observation.bird.name}`}
                                titleClicked={`Poistetaan ${props.observation.bird.name}...`} />
           </div>

    async function delete_this_element()
    {
        const delay = (ms)=>new Promise(resolve => setTimeout(resolve, ms));

        if (!buttonDeleteClicked)
        {
            setButtonDeleteClicked(true);

            // Add an artificial delay to give the user time to appreciate the action
            // taking place.
            await delay(300);

            props.requestDeletion();
        }
    }
}
