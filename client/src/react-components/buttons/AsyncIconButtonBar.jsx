/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";
import {AsyncIconButton} from "./AsyncIconButton.js";

// Displays a collection of AsyncIconButton elements. When one of the buttons is clicked,
// the rest in the collection are visually disabled (e.g. grayed out), and the user is
// prevented from interacting with any element on the page until that button's action has
// finished.
//
// A list of the buttons to be shown should be provided in props.buttons, which is to be
// an array of objects like so (AsyncIconButton contains descriptions of these properties):
//
//     [
//         {
//             icon: "fas fa-eraser",
//             color: "red", // Optional property; can be set via CSS as well.
//             title: `Poista havainto`,
//             titleWhenClicked: `Poistetaan havaintoa...`,
//             task: async({resetButtonState})=>
//             {
//                 // Perform the relevant tasks.
//                 await ...;
//                 
//                 resetButtonState("enabled");
//             }
//         },
//         {
//             ...
//         },
//     ]
//
// Note that the buttons are not passed in as AsyncIconButton elements, but rather as
// "raw" objects containing the desired properties to be given to the AsyncIconButton
// elements.
//
// The props.visible property defines whether the button bar should be rendered or not.
// 
export function AsyncIconButtonBar(props = {})
{
    AsyncIconButtonBar.validate_props(props);

    // Create a list of the button elements to be rendered in this button bar.
    const elements = props.buttons.map((button, idx)=>
    {
        return <AsyncIconButton key={idx}
                                icon={button.icon}
                                task={button.task}
                                color={button.color}
                                title={button.title}
                                titleWhenClicked={button.titleWhenClicked} />
    });

    return  <div className="AsyncIconButtonBar" style={{transform:(props.visible? "translateY(-2px)" : "translateY(18px)"),
                                                        opacity:(props.visible? "1" : "0"),
                                                        visibility:(props.visible? "visible" : "hidden")}}>
                {elements}
            </div>
}

AsyncIconButtonBar.validate_props = function(props)
{
    panic_if_undefined(props, props.buttons);

    return;
}
