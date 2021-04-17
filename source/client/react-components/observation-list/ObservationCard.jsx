/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type, ll_assert_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {LL_Observation} from "../../observation.js";
import {tr} from "../../translator.js";

// Displays information about an observation - like a thumbnail of the species, the species
// name, and the date of the observation.
//
// The observation that this card represents is to be provided via props.observation as an
// LL_Observation() object.
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

    const storeDispatch = ReactRedux.useDispatch();
    const highlightedSpecies = ReactRedux.useSelector(state=>state.highlightedSpecies);
    const isHighlighted = (!props.isGhost && (props.observation.species === highlightedSpecies));

    React.useEffect(()=>{
        if (isHighlighted)
  {
            const removeHilightTimeout = setTimeout(()=>{
                storeDispatch({
                    type: "remove-species-highlight",
                });
            }, 3000);

            return ()=>clearTimeout(removeHilightTimeout);
        }
    });
    
    return <div className={`ObservationCard${props.isGhost? "Ghost" : ""}
                                            ${isHighlighted? "highlighted" : ""}`}>

        {
            props.isGhost
            ? <div className="BirdThumbnail"/>
            : <BirdThumbnail species={props.observation.species}/>
        }

        {/* Displays facts about the observation; like what was observed and when.*/}
        <div className="observation-info">

            <div className="bird-name">
                {props.observation.species}
            </div>

            <div className="date">
                {
                    props.isGhost
                    ? tr("100 Species Challenge")
                    : LL_Observation.date_string(props.observation)
                }
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
    ll_assert_native_type("object", props);
    ll_assert_native_type("boolean", props.isGhost);
    ll_assert_type(LL_Observation, props.observation);

    return;
}
