/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, error, warn, panic} from "../../assert.js";

// A button labeled with a single Font Awesome icon. When pressed, will display a spinner
// and call a provided callback function.
//
// The button's icon should be provided via props.icon, which should be a string of Font
// Awesome class names defining the desired icon; e.g. "fas fa-question" for a question
// mark (or "fas fa-question fa-lg" for a larger question mark, etc.).
//
// The button's icon color can be set via CSS or the props.color override that provides a
// string to be passed to the CSS 'color' property.
//
// The function to be called when the user clicks on the button should be provided via
// props.task. This function will be passed a single parameter, {resetButtonState}, which
// is a function the parent of props.task can call to have the button reset its state to
// the given value (a string, e.g. "enabled" or "disabled"); for instance when the parent
// considers the button's tasks to have been completed.
//
//     Note: If props.task is undefined or set to a falsy value, the button's state will
//     automatically be set to "disabled" and clicking on it will have no effect.
//
// Text to be shown when the cursor hovers over the button can be provided in props.title;
// no text will be displayed if set to null. An alternate title text can be provided via
// props.titleWhenClicked for when the button has been clicked.
//
// To have the button be rendered in a disabled state and not respond to user input, set
// the props.task prop to a falsy value.
//
export function AsyncIconButton(props = {})
{
    AsyncIconButton.validate_props(props);

    const [currentIcon, setCurrentIcon] = React.useState(props.icon);
    const [currentTitle, setCurrentTitle] = React.useState(props.title);

    // Possible states:
    //   "enabled" = the button can be clicked
    //   "disabled" = the button can't be interacted with
    //   "waiting" = waiting for the asynchronous task(s) initiated by the button's click to finish
    const [currentState, setCurrentState] = React.useState(props.task? "enabled" : "disabled");
    
    return <span className={`AsyncIconButton ${currentState}`}
                 onClick={click_handler}
                 title={currentTitle}
                 style={{[props.color? "color" : "ignoreThisPropertyValue"]:props.color}}>
                     <i className={currentIcon}></i>
           </span>

    // Called when the button is clicked.
    async function click_handler()
    {
        if ((currentState !== "enabled") ||
            !props.task)
        {
            return;
        }

        set_button_state("waiting");

        await props.task(
        {
            resetButtonState: (state = "enabled")=>
            {
                set_button_state(state);
            }
        });
    }

    function set_button_state(newState)
    {
        panic_if_undefined(newState);

        if (!props.task && (newState === "enabled"))
        {
            newState = "disabled";
        }

        switch (newState)
        {
            case "enabled":
            {
                setCurrentState("enabled");
                setCurrentIcon(props.icon);
                setCurrentTitle(props.title);
                break;
            }
            case "waiting":
            {
                setCurrentState("waiting");
                setCurrentIcon("fas fa-spinner fa-spin");
                setCurrentTitle(props.titleWhenClicked);
                break;
            }
            case "disabled":
            {
                setCurrentState("disabled");
                setCurrentIcon(props.icon);
                setCurrentTitle(props.title);
                break;
            }
            default: error("Unknown state.");
        }
    }
}

AsyncIconButton.defaultProps =
{
    title: null,
    titleClicked: null,
    symbol: "fas fa-question",
}

AsyncIconButton.validate_props = function(props)
{
    if (!props.task)
    {
        warn("Encountered a button that had not been assigned a task.");
    }
    else if (typeof props.task !== "function")
    {
        panic("Expected a button's \"task\" parameter to be a function.");
    }

    return;
}
