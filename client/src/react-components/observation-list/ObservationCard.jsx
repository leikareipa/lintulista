/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
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

    // The data used to populate the element's fields. May be altered e.g. when the
    // user requests to change the observation date or place.
    const [observationData, setObservationData] = React.useState(props.observation);
    
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

    return <div className="ObservationCard">

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
            
           </div>
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
