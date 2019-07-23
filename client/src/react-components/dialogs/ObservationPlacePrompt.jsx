/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {GeoTag} from "../../react-components/misc/GeoTag.js";

// Displays a modal dialog with which the user can input a place string for an observation.
//
// The observation for which the place is prompted is to be provided via props.observation.
//
// A callback function which receives the place string once the user accepts the dialog
// should be provided via props.onDialogAccept. It will receive one parameter: the place
// string that the user entered into the dialog. If the user made no modifications to the
// string, the original string will be returned.
//
// A callback function called in case the user rejects the dialog should be provided via
// props.onDialogReject. It will receive no parameters.
//
export function ObservationPlacePrompt(props = {})
{
    ObservationPlacePrompt.validateProps(props);

    const [placeString, setPlaceString] = React.useState(props.observation.place || "");

    const mapUrl = GeoTag.map_link_from_string(placeString);
    const maxPlacenameLength = 60;

    return <div className="ObservationPlacePrompt">
               <div className="title">
                   <i className="fas fa-map-marker-alt"></i> Merkitse havainnon sijainti
               </div>
               <div className="form">
                    <BirdThumbnail bird={props.observation.bird}/>
                    <div className="fields">
                        <div className="bird-name">
                            {props.observation.bird.species}:
                        </div>
                        <input className="place-name"
                               type="text"
                               onKeyPress={(event)=>
                               {
                                   if (event.key === "Enter")
                                   {
                                       close_dialog(true);
                                   }
                               }}
                               onChange={(event)=>setPlaceString(event.target.value)}
                               value={placeString? placeString : ""}
                               placeholder="Esim. Lauttasaari, Helsinki"
                               maxLength={maxPlacenameLength}
                               autoFocus/>
                        <div className="map-link">
                            <a className={!mapUrl? "disabled" : undefined}
                               href={mapUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               title="Kokeile karttalinkkiä">
                                   <i className="fas fa-map-marker-alt"/>
                            </a>
                        </div>
                        <div className="toolbar">
                            <div className="character-count">
                                {placeString.length}/{maxPlacenameLength} merkkiä
                            </div>
                        </div>
                    </div>
               </div>
           </div>

    function close_dialog(accept = true)
    {
        switch (accept)
        {
            case true: props.onDialogAccept(placeString); break;
            default: props.onDialogReject(); break;
        }
    }
}

ObservationPlacePrompt.validateProps = function(props)
{
    panic_if_undefined(props, props.onDialogAccept, props.onDialogReject);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}