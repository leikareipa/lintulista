/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {Dialog} from "./Dialog.js"

// Displays a modal dialog that asks the user to confirm that they want to delete a particular
// observation. To proceed with the deletion, the user is required to type out the species
// name of the bird whose whose observation is to be deleted.
//
// The observation whose deletion is prompted is to be provided via props.observation.
//
// If the user accepts the dialog (i.e. confirms the deletion), the callback provided via
// props.onDialogAccept will be called. It will receive no parameters.
//
// If the user rejects the dialog, the callback provided via props.onDialogReject will be
// called. It will receive no parameters.
//
export function QueryObservationDeletion(props = {})
{
    QueryObservationDeletion.validateProps(props);

    // The species name that the user has so far entered into the dialog's input field.
    const [nameEntered, setNameEntered] = React.useState("");

    // A workaround for React not wanting to correctly update the state of Dialog's accept/reject
    // buttons on Dialog initialization. So instead we'll get a direct callback from Dialog, and
    // use that when we want to update the buttons' state. This callback will be initialized when
    // we set up Dialog.
    let setButtonEnabled = (button, state)=>{};

    React.useEffect(()=>
    {
        // We'll make enabled the button to accept deletion only while the species name is
        // correctly input.
        setButtonEnabled("accept", is_input_name_valid());
    }, [nameEntered]);

    return <Dialog component="QueryObservationDeletion"
                   title="Poistetaanko havainto?"
                   titleIcon="fas fa-eraser"
                   rejectButtonText="Peruuta"
                   acceptButtonText="Poista"
                   acceptButtonEnabled={false}
                   callbackSetButtonEnabled={(callback)=>{setButtonEnabled = callback}}
                   enterAccepts={true}
                   onDialogAccept={accept}
                   onDialogReject={reject}>
               <BirdThumbnail bird={props.observation.bird}/>
               <div className="fields">
                   <div className="bird-name">
                       {props.observation.bird.species}:
                   </div>
                   <input className="list-id"
                          type="text"
                          onChange={(event)=>setNameEntered(event.target.value)}
                          placeholder="Toista linnun nimi jatkaaksesi"
                          spellCheck="false"
                          maxLength={props.observation.bird.species.length}
                          autoFocus/>
                   <div className={`input-icon ${is_input_name_valid()? "good-input" : ""}`.trim()}
                        title={is_input_name_valid()? "Ok!" : `Kirjoita "${props.observation.bird.species}"`}>
                       <i className="fas fa-crow fa-lg"/>
                   </div>
                   <div className="character-count">
                       {nameEntered.length}/{props.observation.bird.species.length} merkkiä
                   </div>
               </div>
           </Dialog>

    function accept()
    {
        props.onDialogAccept();
    }

    function reject()
    {
        props.onDialogReject();
    }

    function is_input_name_valid()
    {
        return (nameEntered.toLowerCase() === props.observation.bird.species.toLowerCase());
    }
}

QueryObservationDeletion.validateProps = function(props)
{
    panic_if_undefined(props, props.observation);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
