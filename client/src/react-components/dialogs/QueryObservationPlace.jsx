/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {GeoTag} from "../tags/GeoTag.js";
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

    const [placeName, setPlaceName] = React.useState(props.observation.place || "");

    const mapUrl = GeoTag.map_link_from_string(placeName);

    return <Dialog component="QueryObservationPlace"
                   title="Merkitse havaintopaikka"
                   enterAccepts={true}
                   onDialogAccept={accept}
                   onDialogReject={reject}>
               <BirdThumbnail bird={props.observation.bird}
                              useLazyLoading={false}/>
               <div className="fields">
                   <div className="bird-name">
                       {props.observation.bird.species}:
                   </div>
                   <input className="place-name"
                          type="text"
                          onChange={update_on_input}
                          defaultValue={placeName}
                          placeholder="Esim. Lauttasaari, Helsinki"
                          spellCheck="false"
                          maxLength={props.maxPlaceNameLength}
                          autoFocus/>
                   <div className={`map-link ${mapUrl? "enabled" : "disabled"}`.trim()}>
                       <a href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Kokeile karttalinkkiä">
                              <i className="fas fa-map-marker-alt"/>
                       </a>
                   </div>
                   <div className="character-count">
                       {props.maxPlaceNameLength - placeName.length} merkki
                       {((props.maxPlaceNameLength - placeName.length) !== 1)? "ä" : ""} jäljellä
                   </div>
               </div>
           </Dialog>

    function update_on_input(inputEvent)
    {
        setPlaceName(inputEvent.target.value);
    }

    function accept()
    {
        props.onDialogAccept(placeName);
    }
    
    function reject()
    {
        props.onDialogReject();
    }
}

QueryObservationPlace.validateProps = function(props)
{
    panic_if_undefined(props, props.maxPlaceNameLength);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
