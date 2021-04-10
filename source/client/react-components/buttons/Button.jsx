/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

export function Button(props = {})
{
    Button.validate_props(props);

    return <div className={`Button ${props.enabled? "enabled" : "disabled"}`}
                onClick={handle_click}>

        <div
            className="tooltip"
            style={{display:(props.showTooltip? "initial" : "none")}}>

            {props.tooltip}

        </div>

        <div
            className="icon"
            title={props.title}>

            <i className={props.icon}/>

        </div>

    </div>

    function handle_click()
    {
        props.callbackOnButtonClick();
        return;
    }
}

Button.defaultProps =
{
    id: "undefined-button",
    title: "?",
    icon: "fas fa-question fa-fw",
    enabled: true,
    showTooltip: false,
    tooltip: "?",
    callbackOnButtonClick: ()=>{},
}

Button.validate_props = function(props)
{
    panic_if_not_type("object", props);

    return;
}
