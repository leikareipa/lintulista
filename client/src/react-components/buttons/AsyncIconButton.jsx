/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {error, panic_if_not_type, is_function, throw_if_not_true} from "../../assert.js";

// A button labeled with a single Font Awesome icon. When pressed, will display a spinner
// and call a provided callback function.
//
// The button's icon should be provided via props.icon, which should be a string of Font
// Awesome class names defining the desired icon; e.g. "fas fa-question" for a question
// mark (or "fas fa-question fa-lg" for a larger question mark, etc.).
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
// You can provide a function via props.giveCallbackTriggerPress that accepts a function
// as a parameter, to receive a function with which the button's press can be trigger in-
// code. Calling that function will cause the button to adopt its "waiting" state and
// execute its props.task callback, just as it would when the user clicks on the button.
//
// Text to be shown when the cursor hovers over the button can be provided in props.title;
// no text will be displayed if set to null. An alternate title text can be provided via
// props.titleWhenClicked for when the button has been clicked. Optionally, you can set
// props.printTitle to a truthy value to have the button's title (props.title, but not
// props.titleWhenClicked) be rendered in text below the button, without the user having
// to hover over the button.
//
// To have the button be rendered in a disabled state and not respond to user input, set
// the props.task prop to a falsy value.
//
export function AsyncIconButton(props = {})
{
    AsyncIconButton.validate_props(props);

    const [currentIcon, setCurrentIcon] = React.useState(props.icon);
    const [currentTitle, setCurrentTitle] = React.useState(props.title);

    // Font Awesome allows the user to customize an icon's relative size via extra class
    // name options; e.g. "fa-2x" for 200% icon size. Let's make note of any such options
    // that may be provided in the given icon's class name string, so we can reproduce
    // them for its spinner, later.
    const iconSize = (()=>
    {
        const sizeStrings = props.icon.match(/fa-([0-9]+x|xs|sm|lg)/g);
        return (sizeStrings? sizeStrings.join(" ") : "");
    })();

    // The button's current state. Possible values:
    //   "enabled" = the button can be clicked
    //   "disabled" = the button can't be interacted with
    //   "waiting" = waiting for the asynchronous task(s) initiated by the button's click to finish
    const [currentState, setCurrentState] = React.useState((props.task && props.enabled)? "enabled" : "disabled");

    if (is_function(props.giveCallbackTriggerPress))
    {
        props.giveCallbackTriggerPress(handle_click);
    }

    return <span className={`AsyncIconButton ${currentState}`}
                 onClick={handle_click}
                 title={props.printTitle? "" : currentTitle}>
                     <i className={currentIcon}/>
                     {props.printTitle? <><br/>{currentTitle}</> : <></>}
           </span>

    // Called when the button is clicked.
    async function handle_click()
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
        panic_if_not_type("string", newState);

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
                setCurrentIcon(`fas fa-spinner fa-spin ${iconSize}`.trim());
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
            default: error("Unknown button state.");
        }
    }
}

AsyncIconButton.defaultProps =
{
    enabled: true,
    title: null,
    titleWhenClicked: null,
    printTitle: false,
    icon: "fas fa-question",
}

AsyncIconButton.validate_props = function(props)
{
    panic_if_not_type("object", props);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
AsyncIconButton.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container;

    // Normal button.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(AsyncIconButton,
            {
                icon: "fas fa-times",
                title: "Test1",
                printTitle: true,
                titleWhenClicked: "Test1-Clicked",
                task: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.textContent === "Test1")]);

        // Test the button.
        {
            throw_if_not_true([()=>(container.childNodes.length === 1)]);

            const buttonElement = container.childNodes[0];

            throw_if_not_true([()=>(buttonElement.tagName.toLowerCase() === "span"),
                               ()=>(buttonElement.classList.contains("enabled")),
                               ()=>(!buttonElement.classList.contains("waiting")),
                               ()=>(!buttonElement.classList.contains("disabled"))]);

            // Activate the button.
            {
                ReactTestUtils.act(()=>{buttonElement.dispatchEvent(new MouseEvent("click", {bubbles: true}))});

                throw_if_not_true([()=>(container.textContent === "Test1-Clicked"),
                                   ()=>(buttonElement.classList.contains("waiting")),
                                   ()=>(!buttonElement.classList.contains("enabled")),
                                   ()=>(!buttonElement.classList.contains("disabled"))]);
            }
        }
    }
    catch
    {
        return false;
    }
    finally
    {
        container.remove();
    }

    // Button without a task (should start out and remain disabled, even if requested to be enabled).
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(AsyncIconButton,
            {
                icon: "fas fa-times",
                enabled: true,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.childNodes.length === 1)]);

        const buttonElement = container.childNodes[0];

        throw_if_not_true([()=>(buttonElement.classList.contains("disabled"))]);

        // Activate the button (nothing should happen, since it's disabled).
        {
            ReactTestUtils.act(()=>{buttonElement.dispatchEvent(new MouseEvent("click", {bubbles: true}))});

            throw_if_not_true([()=>(buttonElement.classList.contains("disabled")),
                               ()=>(!buttonElement.classList.contains("waiting")),
                               ()=>(!buttonElement.classList.contains("enabled"))]);
        }
    }
    catch
    {
        return false;
    }
    finally
    {
        container.remove();
    }

    return true;
}
