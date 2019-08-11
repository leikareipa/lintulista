/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

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
