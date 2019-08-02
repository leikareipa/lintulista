/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

// A special version of the ObservationListElement component. Intended to mimic the shape
// of the ObservationListElement but display no information about an actual observation -
// rather, being a placeholder for a potential observation that has yet to take place.
//
// In particular, this element is used for the 100 Lajia challenge, in which the user is
// given a list of species and challenged to observe all of them in a certain period of
// time. In this, the ObservationListElementGhosts stand in for actual observations of the
// given species in the list of observations until the user does observe them, in which
// event the ObservationListElementGhost is replaced by an ObservationListElement.
//
// The name of the species whose observation this element stands in for can be given as a
// string via props.speciesName.
//
export function ObservationListElementGhost(props = {})
{
    ObservationListElementGhost.validate_props(props);

    return <div className={`ObservationListElementGhost ${props.visible? "" : "hidden"}`.trim()}>
               <div className="BirdThumbnail"/>
               <div className="card">
                   <div className="ObservationInfo">
                       <div className="bird-name">
                           {props.speciesName}
                       </div>
                       <div className="date">
                           100 Lajia -haaste
                       </div>
                   </div>
               </div>
           </div>
}

ObservationListElementGhost.defaultProps =
{
    visible: true,
}

ObservationListElementGhost.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("string", props.speciesName);

    return;
}
