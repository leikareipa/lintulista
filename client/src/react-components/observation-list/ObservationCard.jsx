/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

// Displays information about an observation - like a thumbnail of the species, the species
// name, and the date of the observation.
//
// The observation that this card represents is to be provided via props.observation as an
// Observation() object.
//
// If props.isGhost is set to true, the card will be displated as a "ghost". A ghost card is
// intended to serve as a placeholder for an actual observation - i.e. it's an observation
// that has not yet been made, but could be in the future.
//
//     For ghost cards, no bird thumbnail or observation date will be shown.
//
export function ObservationCard(props = {})
{
    ObservationCard.validate_props(props);

    return <div className={`ObservationCard${props.isGhost? "Ghost" : ""}`}>

               {props.isGhost? <div className="BirdThumbnail"/>
                             : <BirdThumbnail bird={props.observation.bird}/>}

               {/* Displays facts about the observation; like what was observed and when.*/}
               <div className="observation-info">
                   <div className="bird-name">
                       {props.observation.bird.species}
                   </div>
                   <div className="date">
                       {props.isGhost? "100 Lajia -haaste" : props.observation.dateString}
                   </div>
               </div>
            
           </div>
}

ObservationCard.defaultProps =
{
    isGhost: false,
}

ObservationCard.validate_props = function(props)
{
    panic_if_not_type("object", props, props.observation);
    panic_if_not_type("boolean", props.isGhost);

    return;
}
