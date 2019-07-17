/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

// A button labeled with a single Font Awesome icon. When pressed, will display a spinner
// and call a provided callback function.
//
// The button's icon should be provided via props.icon, which should be a string of Font
// Awesome class names defining the desired icon; e.g. "fas fa-question" for a question
// mark (or "fas fa-question fa-lg" for a larger question mark, etc.).
//
// The function to be called when the user clicks on the button should be provided via
// props.clickCallback. It will be passed no parameters.
//
// Text to be shown when the cursor hovers over the button can be provided in props.title;
// no text will be displayed if set to null. An alternate title text can be provided via
// props.titleWhenClicked for when the button has been clicked.
//
// Whether to render the button in an enabled or disabled state can be set via props.enabled.
// Clicks on a disabled button will not be registered, and as such the corresponding callback
// function will not be called.
//
export function AsyncIconButton(props = {})
{
    const [currentIcon, setCurrentIcon] = React.useState(props.icon);
    const [currentTitle, setCurrentTitle] = React.useState(props.title);

    return <span className={`AsyncIconButton ${props.enabled? "enabled" : "disabled"}`}
                 enabled={props.enabled}
                 onClick={click_handler}
                 title={currentTitle}>
                     <i className={currentIcon}></i>
           </span>

    // Called when the button is clicked.
    function click_handler()
    {
        if (!props.enabled ||
            !props.clickCallback)
        {
            return;
        }

        setCurrentIcon("fas fa-spinner fa-spin");
        setCurrentTitle(props.titleWhenClicked);

        props.clickCallback();
    }
}

AsyncIconButton.defaultProps =
{
    title: null,
    titleClicked: null,
    symbol: "fas fa-question",
    clickCallback: null,
}
