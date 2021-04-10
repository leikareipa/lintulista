/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {Dialog} from "./Dialog.js"

export function QueryLoginCredentials(props = {})
{
    QueryLoginCredentials.validateProps(props);

    const usernameRef = React.useRef();

    let password = "";
    let username = "";

    // A workaround for React not wanting to correctly update the state of Dialog's accept/reject
    // buttons on Dialog initialization. So instead we'll get a direct callback from Dialog, and
    // use that when we want to update the buttons' state. This callback will be initialized when
    // we set up Dialog.
    let setButtonEnabled = (button, state)=>{};

    return <Dialog component="QueryLoginCredentials"
                   title="Kirjaudu sisään"
                   rejectButtonText="Peruuta"
                   acceptButtonText="Kirjaudu"
                   acceptButtonWaitingText="Kirjaudutaan..."
                   acceptButtonEnabled={true}
                   callbackSetButtonEnabled={(callback)=>{setButtonEnabled = callback}}
                   enterAccepts={true}
                   disableTabKey={false}
                   onDialogAccept={accept}
                   onDialogReject={props.onDialogReject}
                   onKeyDown={control_tab_presses}>

        <form className="fields">

            <div className="username">
                Käyttäjänimi
            </div>

            <input
                ref={usernameRef}
                className="username"
                type="text"
                onChange={(event)=>{username = event.target.value}}
                spellCheck="false"
                autoComplete="username"
                autoFocus
            />

            <div className="password">
                Salasana
            </div>

            <input
                className="password"
                type="password"
                onKeyDown={control_tab_presses}
                onChange={(event)=>{password = event.target.value}}
                spellCheck="false"
                autoComplete="current-password"
            />

            <div className="instruction">
                Kirjautuminen on voimassa, kunnes kirjaudut ulos tai lataat
                sivun uudelleen; kuitenkin korkeintaan kuutisen tuntia.
            </div>

        </form>

    </Dialog>

    function control_tab_presses(keyDownEvent)
    {
        if (keyDownEvent.code === "Tab")
        {
            usernameRef.current.focus();
            keyDownEvent.preventDefault();
        }

        return;
    }

    function accept()
    {
        props.onDialogAccept({username, password});

        return;
    }
}

QueryLoginCredentials.validateProps = function(props)
{
    panic_if_not_type("object", props, props.randomBird);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
