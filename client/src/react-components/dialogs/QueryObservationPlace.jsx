/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {GeoTag} from "../misc/GeoTag.js";
import {Dialog} from "./Dialog.js"

// Displays a modal dialog with which the user can input a place string for an observation.
//
// The observation for which the place is prompted is to be provided via props.observation.
//
// A callback function that receives the place string once the user accepts the dialog
// should be provided via props.onDialogAccept. It will receive one parameter: the place
// string that the user entered into the dialog. If the user made no modifications to the
// string, the original string will be returned.
//
// A callback function called in case the user rejects the dialog should be provided via
// props.onDialogReject. It will receive no parameters.
//
// The dialog will enforce a length limit on the place name string that the user enters.
// This limit can be set via props.maxPlaceNameLength.
//
export function QueryObservationPlace(props = {})
{
    QueryObservationPlace.validateProps(props);

    const [placeString, setPlaceString] = React.useState(props.observation.place || "");

    const mapUrl = GeoTag.map_link_from_string(placeString);

    return <Dialog component="QueryObservationPlace"
                   title="Merkitse havaintopaikka"
                   titleIcon="fas fa-map-marker-alt"
                   onDialogAccept={()=>close_dialog(true)}
                   onDialogReject={()=>close_dialog(false)}>
               <BirdThumbnail bird={props.observation.bird}/>
               <div className="fields">
                   <div className="bird-name">
                       {props.observation.bird.species}:
                   </div>
                   <input className="place-name"
                          type="text"
                          onChange={(event)=>setPlaceString(event.target.value)}
                          value={placeString? placeString : ""}
                          placeholder="Esim. Lauttasaari, Helsinki"
                          spellCheck="false"
                          maxLength={props.maxPlaceNameLength}
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
                   <div className="character-count">
                       {props.maxPlaceNameLength - placeString.length} merkkiä jäljellä
                   </div>
               </div>
           </Dialog>

    function close_dialog(accept = true)
    {
        switch (accept)
        {
            case true: props.onDialogAccept(placeString); break;
            default: props.onDialogReject(); break;
        }
    }
}

QueryObservationPlace.validateProps = function(props)
{
    panic_if_undefined(props, props.maxPlaceNameLength);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
