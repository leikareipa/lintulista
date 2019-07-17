/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";
import {AsyncIconButton} from "./AsyncIconButton.js";
import {shades} from "../../shades.js";

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
//             title: `Poista havainto`,
//             titleWhenClicked: `Poistetaan havaintoa...`,
//             clickCallback: delete_this_element,
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
// A function to be called when the user clicks on a particular button should be given
// via props.buttons[x].clickCallback. If set to null, the button will be displayed in
// a disabled state, and clicking on it will perform no action.
//
//     Note that, unlike for AsyncIconButton, the props.clickCallback function for the
//     button bar will receive as a parameter a shades() object, which is responsible
//     for dimming and disabling the page's elements while the button's action is being
//     performed. The recipient of the callback should remove the shades once it has
//     finished performing the actions associated with clicking the button.
//
// The props.visible property defines whether the button bar should be rendered or not.
// 
export function AsyncIconButtonBar(props = {})
{
    panic_if_undefined(props, props.buttons);

    // Indices in the array of buttons of those buttons that are currently active, i.e.
    // which react to clicks etc. Buttons not on this list at a given time are considered
    // disabled.
    const [enabledButtons, setEnabledButtons] = React.useState(props.buttons.map((b, idx)=>idx));
    
    // Create a list of the button elements to be rendered in this button bar.
    const elements = props.buttons.map((butt, idx)=>
    {
        function callback()
        {
            button_clicked(butt);
        }
        
        return <AsyncIconButton key={idx}
                                icon={butt.icon}
                                enabled={(is_button_enabled(butt) && butt.clickCallback)? 1 : 0}
                                clickCallback={callback}
                                title={butt.title}
                                titleWhenClicked={butt.titleWhenClicked} />
    });

    return  <div className="AsyncIconButtonBar" style={{visibility:(props.visible? "visible" : "hidden")}}>{elements}</div>

    // Returns the index of the given button in the master list of buttons.
    function index_of_button(button)
    {
        // Use the callback function to uniquely identify buttons (two buttons might share
        // the same callback, but in that case they're functionally identical).
        return props.buttons.map(b=>b.clickCallback).indexOf(button.clickCallback);
    }

    // Returns true if the given button is currently active; false otheriwse.
    function is_button_enabled(button)
    {
        return Boolean(enabledButtons.includes(index_of_button(button)));
    }

    // Called when a button is clicked. Acts as a router to the button's actual callback,
    // with some additional UI tweaking in-between.
    function button_clicked(button)
    {
        if (!is_button_enabled(button))
        {
            return;
        }

        // A shade put on when the user clicks on one of the buttons. The shade will be sent
        // to the parent element via the button's click callback function, and the parent can
        // then remove the shade when it considers the button's action to have been finished.
        const clickShade = shades({container:document.body, opacity:0.3});

        clickShade.put_on();

        setEnabledButtons([index_of_button(button)]);

        button.clickCallback(clickShade);
    }
}
