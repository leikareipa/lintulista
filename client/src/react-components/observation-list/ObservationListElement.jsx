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

    // For keeping track of whether the 'remove observation' button has been clicked.
    const [buttonRemoveClicked, setButtonRemoveClicked] = React.useState(false);

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
                   <span className="observation-details">{props.observation.dateString}</span>
               </span>
               <AsyncIconButton symbol="fas fa-eraser"
                                clickCallback={()=>setButtonRemoveClicked(true)}
                                style={{display:((mouseHovering || buttonRemoveClicked)? "inherit" : "none")}}
                                title={`Poista ${props.observation.bird.name} listalta`}
                                titleClicked={`Poistetaan ${props.observation.bird.name}...`} />
           </div>
}
