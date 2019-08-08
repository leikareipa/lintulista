/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {animate} from "../../animate.js";

// Renders structured information about an observation.
//
// The observation about whom to display information should be provided via props.observation;
// which is to be an observation() object.
//
// The props.setAnimationCallbacks should be a callback function with which this component
// can give the parent component the ability to queue small animatory effects on the component's
// elements. When this component initializes, that callback will be provided as a parameter an
// object whose properties provide the animation callbacks; such that e.g. {pulseDateElement}
// will be a function that the parent component can call to cause a brief pulsing animation on
// this component's date element.
//
export function ObservationInfo(props = {})
{
    ObservationInfo.validate_props(props);

    // Used to start an animation on a particular element. Will take in an object of the
    // form {ref, name, callback}, where 'ref' is a React reference to the element on which
    // to play the animation; 'animationName' is the name of the animation; and 'callback'
    // is an optional callback for when the animation finishes. For more information, see
    // the documentation for animate(). Set to null to play no animation.
    const [animation, queueAnimation] = React.useState(null);

    // React refs used for animation.
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

    props.setAnimationCallbacks(
    {
        pulseDateElement: (whenDone)=>queueAnimation({refName:"date", animationName:"jump", callback:whenDone}),
    });

    return <div className="ObservationInfo">
                <div className="bird-name">
                    {props.observation.bird.species}
                </div>
                <div className="date" ref={refs.date}>
                    {props.observation.dateString}
                </div>
           </div>
}

ObservationInfo.validate_props = function(props)
{
    panic_if_not_type("object", props, props.observation);
    panic_if_not_type("function", props.setAnimationCallbacks);
    
    return;
}
