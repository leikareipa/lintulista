/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

export function CheckBoxButton(props = {})
{
    CheckBoxButton.validate_props(props);

    const [isChecked, setIsChecked] = React.useState(props.isChecked);

    return <div className={`CheckBoxButton ${props.enabled? "enabled" : "disabled"}
                                           ${isChecked? "checked" : "not-checked"}`}
                onClick={handle_click}>

        <div
            className="tooltip"
            style={{display:(props.showTooltip? "initial" : "none")}}>

            {props.tooltip}

        </div>

        <div
            className="icon"
            title={props.title}>

            <i
                className={isChecked? props.iconChecked : props.iconUnchecked}
            />

        </div>

    </div>

    function handle_click()
    {
        props.callbackOnButtonClick(!isChecked);
        setIsChecked(!isChecked);

        return;
    }
}

CheckBoxButton.defaultProps =
{
    id: "undefined-menu-button",
    isChecked: false,
    title: "?",
    iconChecked: "fas fa-check-square fa-fw",
    iconUnchecked: "fas fa-square fa-fw",
    enabled: true,
    showTooltip: true,
    callbackOnButtonClick: ()=>{},
}

CheckBoxButton.validate_props = function(props)
{
    panic_if_not_type("object", props);

    return;
}
