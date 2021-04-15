/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {tr} from "../../translator.js";
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
                   title={tr("Log in")}
                   rejectButtonText={tr("Cancel")}
                   acceptButtonText={tr("Log in")}
                   acceptButtonWaitingText={tr("Logging in...")}
                   acceptButtonEnabled={true}
                   callbackSetButtonEnabled={(callback)=>{setButtonEnabled = callback}}
                   enterAccepts={true}
                   disableTabKey={false}
                   onDialogAccept={accept}
                   onDialogReject={reject}
                   onKeyDown={control_tab_presses}>

        <form className="fields">

            <div className="username">
                {tr("Username")}
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
                {tr("Password")}
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
                {tr("Your login will remain active until you log out or reload " +
                    "the page. Otherwise, you'll be logged out automatically after " +
                    "about six hours.")}
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
        props.return.username = username;
        props.return.password = password;
        props.onAccept();
    }

    function reject()
    {
        props.onReject();
    }
}

QueryLoginCredentials.validateProps = function(props)
{
    ll_assert_native_type("object", props,
                                    props.return);
    ll_assert_native_type("function", props.onAccept,
                                      props.onReject);

    return;
}
