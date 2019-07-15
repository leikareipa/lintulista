/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";

// A button labeled with a single Font Awesome icon. When pressed, will replace the icon
// with a spinner, and calls a callback function.
//
// The button's icon is provided in props.symbol. It should be given as a string of Font
// Awesome class names defining the desired symbol; e.g. "fas fa-question" for a question
// mark.
//
// The function to be called when the user clicks on the button should be provided in
// props.clickCallback. It should be a callable function. It will be passed no parameters.
//
// Text to be shown when the cursor hovers over the button can be provided in props.title;
// no text will be displayed if set to null. An alternate title text can be provided via
// props.titleClicked for when the button has been clicked.
//
export function AsyncIconButton(props = {})
{
    panic_if_undefined(props.clickCallback);

    const [activeSymbol, setActiveSymbol] = React.useState(props.symbol);
    const [activeTitle, setActiveTitle] = React.useState(props.title);

    return <div className="SymbolButton"
                style={props.style}
                onClick={on_click}
                title={activeTitle}>
                    <i className={activeSymbol}></i>
           </div>

    // Called when the button is clicked.
    function on_click()
    {
        setActiveSymbol("fas fa-spinner fa-spin");
        setActiveTitle(props.titleClicked);

        props.clickCallback();
    }
}

AsyncIconButton.defaultProps =
{
    title: null,
    titleClicked: null,
    style: {},
    symbol: "fas fa-question",
}
