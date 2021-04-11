/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, ll_assert_native_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {Dialog} from "./Dialog.js"
import {tr} from "../../translator.js";

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

    // A workaround for React not wanting to correctly update the state of Dialog's accept/reject
    // buttons on Dialog initialization. So instead we'll get a direct callback from Dialog, and
    // use that when we want to update the buttons' state. This callback will be initialized when
    // we set up Dialog.
    let setButtonEnabled = (button, state)=>{};

    return <Dialog component="QueryObservationDeletion"
                   title={tr("Delete an observation")}
                   rejectButtonText={tr("Cancel")}
                   acceptButtonText={tr("Delete")}
                   acceptButtonEnabled={false}
                   callbackSetButtonEnabled={(callback)=>{setButtonEnabled = callback}}
                   enterAccepts={true}
                   onDialogAccept={accept}
                   onDialogReject={reject}>

        <BirdThumbnail
            species={props.observation.species}
            useLazyLoading={false}/>

        <div className="fields">

            <div className="bird-name">
                {props.observation.species}:
            </div>

            <input
                className="list-id"
                type="text"
                onChange={update_on_input}
                spellCheck="false"
                autoFocus
            />

            <div className="instruction">
                {tr("Type \"%1\" to continue", props.observation.species)}
            </div>
            
        </div>
        
    </Dialog>

    function update_on_input(inputEvent)
    {
        const doesNameMatch = inputEvent.target.value.toLowerCase() === props.observation.species.toLowerCase();
        setButtonEnabled("accept", doesNameMatch);
    }

    function accept()
    {
        props.onDialogAccept();
    }

    function reject()
    {
        props.onDialogReject();
    }
}

QueryObservationDeletion.validateProps = function(props)
{
    panic_if_undefined(props, props.observation);
    ll_assert_native_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
