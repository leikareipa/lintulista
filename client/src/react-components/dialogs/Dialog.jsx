/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, panic, is_defined, is_function} from "../../assert.js";
import {AsyncIconButton} from "../buttons/AsyncIconButton.js"

// A base for dialog elements. Displays a title bar with an icon text, and embeds the provided
// child elements into a <div class="form"> container following the title.
//
// The name of the component that builds on the Dialog base is given via props.component. For
// instance, if you're making a dialog component called AskManyQuestions, you would provide the
// string props.component = "AskManyQuestions". The string will be appended to Dialog's class
// name list, so that you can style the dialog in CSS using '.Dialog.AskManyQuestions'.
//
// The dialog's title text and icon should be provided via props.title and props.titleIcon; of
// which both should be strings, the latter giving the Font Awesome class names for the desired
// icon (e.g. props.titleIcon = "fas fa-map-marker-alt" for a map marker icon).
//
// Functions to be called when the user accepts or rejects the dialog should be provided via
// props.onDialogAccept and props.onDialogReject.
//
// Callbacks can be provided via props.giveCallbackTriggerDialogAccept and props.giveCallbackTriggerDialogReject
// that on Dialog's initialization will receive a function that the caller can use to accept or
// reject the dialog via code.
//
// Whether to trigger dialog rejection on the user pressing the Escape key and/or acceptance
// on the user pressing the Enter key can be given as booleans via props.escRejects and
// props.enterAccepts, respectively.
//
// To build a dialog called MyDialog using Dialog as a base, you might have the following JSX:
//
//     <Dialog component="MyDialog"
//             title="It's my dialog"
//             titleIcon="fas fa-question"
//             onDialogAccept={()=>...}
//             onDialogReject={()=>...}>
//         <span className="sub-title">
//             Hello!
//         </span>
//         <div className="contents">
//             ...
//         </div>
//     </Dialog>
//
// In this case, the dialog will be rendered with a title element from Dialog, and the elements
// we provide inside the <Dialog> tags, which React passes automatically to Dialog via props.children.
//
// The elements in the MyDialog example, from above, can be styled using CSS with e.g. the
// '.Dialog.MyDialog > .form > *' selector. The selector's '.Dialog.MyDialog' part derives from
// the props.component = "MyDialog" string that we passed to Dialog; and the '> .form >' part
// from the fact that Dialog embeds all child elements (the ones inside the <Dialog></Dialog>
// tags) inside a <div className="form"> container.
//
export function Dialog(props = {})
{
    Dialog.validateProps(props);

    const [acceptButtonEnabled, setAcceptButtonEnabled] = React.useState(props.acceptButtonEnabled);
    const [rejectButtonEnabled, setRejectButtonEnabled] = React.useState(props.rejectButtonEnabled);

    // For when the dialog is accepted/rejected via code rather than by the user pressing
    // the corresponding buttons.
    const [acceptViaCode, setAcceptViaCode] = React.useState(false);
    const [rejectViaCode, setRejectViaCode] = React.useState(false);

    React.useEffect(()=>
    {
        if (acceptViaCode)
        {
            setAcceptViaCode(false);

            if (acceptButtonEnabled)
            {
                // This will call accept() via the AsyncIconButton's task() callback.
                triggerAcceptButtonPress();
            }
        }

        if (rejectViaCode && rejectButtonEnabled)
        {
            setRejectViaCode(false);
            
            if (rejectButtonEnabled)
            {
                reject();
            }
        }
    }, [acceptViaCode, rejectViaCode, acceptButtonEnabled, rejectButtonEnabled]);

    React.useEffect(()=>
    {
        window.addEventListener("keydown", handle_key);
        return ()=>window.removeEventListener("keydown", handle_key);

        function handle_key(keyEvent)
        {
            if (props.enterAccepts &&
                (keyEvent.key === "Enter"))
            {
                setAcceptViaCode(true);
            }

            if (props.escRejects &&
                (keyEvent.key === "Escape"))
            {
                setRejectViaCode(true);
            }
        }
    }, []);

    // Provide the caller a function with which to set the state of the accept/reject
    // buttons, since React doesn't seem to be updating their state properly via prop
    // changes on Dialog initialization.
    if (is_function(props.callbackSetButtonEnabled))
    {
        props.callbackSetButtonEnabled((button, state)=>
        {
            switch (button)
            {
                case "accept": setAcceptButtonEnabled(state); break;
                case "reject": setRejectButtonEnabled(state); break;
                default: panic("Unknown button."); break;
            }
        });
    }

    if (is_function(props.giveCallbackTriggerDialogAccept))
    {
        props.giveCallbackTriggerDialogAccept(()=>setAcceptViaCode(true));
    }

    if (is_function(props.giveCallbackTriggerDialogReject))
    {
        props.giveCallbackTriggerDialogReject(()=>setRejectViaCode(true));
    }

    // A function with which the accept button's pressed state can be triggered in-code.
    // Will be set to its correct value when the accept button initializes.
    let triggerAcceptButtonPress = ()=>{};

    return <div className={`Dialog ${props.component}`}>
                <div className="title">
                    <i className={`title-icon ${props.titleIcon}`}/> {props.title}
                </div>
                <div className="form">
                    {props.children}
                </div>
                <div className="button-bar">
                    <div className={`accept ${!acceptButtonEnabled? "disabled" : ""}`.trim()}>
                        <AsyncIconButton task={accept}
                                         icon={`${props.acceptButtonIcon} fa-2x`}
                                         printTitle={true}
                                         title={props.acceptButtonText}
                                         titleWhenClicked="Tallennetaan..."
                                         giveCallbackTriggerPress={(callback)=>{triggerAcceptButtonPress = callback}}/>
                    </div>
                    <div className={`reject ${!rejectButtonEnabled? "disabled" : ""}`.trim()}
                         onClick={reject}>
                             <i className={`${props.rejectButtonIcon} fa-2x`}/>
                             <br/>{props.rejectButtonText}
                    </div>
                </div>
           </div>

    function accept()
    {
        setRejectButtonEnabled(false);
        props.onDialogAccept();
    }

    function reject()
    {
        setAcceptButtonEnabled(false);
        setRejectButtonEnabled(false);
        props.onDialogReject();
    }
}

Dialog.validateProps = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("string", props.component, props.titleIcon, props.title);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    if (is_defined(props.callbackSetButtonEnabled) &&
        !is_function(props.callbackSetButtonEnabled))
    {
        warn("Expected callbackSetButtonEnabled to be a function.");
    }

    return;
}

Dialog.defaultProps =
{
    acceptButtonEnabled: true,
    rejectButtonEnabled: true,
    acceptButtonIcon: "fas fa-check",
    acceptButtonText: "Tallenna",
    rejectButtonIcon: "fas fa-times",
    rejectButtonText: "Peruuta",
    enterAccepts: false,
    escRejects: true,
}
