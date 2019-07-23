/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

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

    return <div className={`Dialog ${props.component}`}>
               <div className="title">
                   <i className={props.titleIcon}/> {props.title}
               </div>
               <div className="form">
                   {props.children}
               </div>
               <div className="button-bar">
                   <div className="reject">
                       <i className="fas fa-check fa-3x" onClick={props.onDialogAccept}/>
                       <br/>Tallenna
                   </div>
                   <div className="accept">
                       <i className="fas fa-times fa-3x" onClick={props.onDialogReject}/>
                       <br/>Peruuta
                   </div>
               </div>
           </div>
}

Dialog.validateProps = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("string", props.component, props.titleIcon, props.title);
    panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);

    return;
}
