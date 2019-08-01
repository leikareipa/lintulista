/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, error} from "../../assert.js";

// Renders a button associated with a drop-down menu that activates when the button is
// clicked. The drop-down menu holds a set of items that the user can click on; when an
// item is clicked, the menu is closed and the item's callback is called.
//
// The icon to be rendered on the button should be provided via props.icon as a Font
// Awesome class name string (e.g. "fas fa-question fa-2x" for a large question mark).
//
// The menu's title is to be provided via props.title.
//
// The menu's items are to be provided via props.items as an array of objects of the
// following form:
//
//     {
//         text: "Item A",
//         callbackOnSelect: ()=>console.log("Selected A."),
//     }
//
// Note that the menu currently does not allow items to have tick boxes or the like.
//
// The index of the initial active item can be given via props.initialItemIdx as a 0-
// indexed integer.
//
/// TODO: Add showing which of the drop-down's items are currently selected.
//
export function MenuButton(props = {})
{
    MenuButton.validate_props(props);

    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const [currentItemText, setCurrentItemText] = React.useState(props.items[props.initialItemIdx].text);

    // Implements a click handler that hides the menu's dropdown when the user clicks
    // outside of the dropdown element - but not when they click on it. Note that clicks
    // on the items of the menu will still trigger the item's separate onclick handler.
    React.useEffect(()=>
    {
        window.addEventListener("mousedown", handle_mousedown);

        return ()=>
        {
            window.removeEventListener("mousedown", handle_mousedown);
        }

        function handle_mousedown(clickEvent)
        {
            const clickedOnSelfElement = (()=>
            {
                let node = clickEvent.target;
                while (node)
                {
                    if (node.classList &&
                        node.classList.contains("MenuButton"))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            if (!clickedOnSelfElement)
            {
                hide_dropdown();
            }
        }
    }, []);

    const itemElements = props.items.map((item, idx)=>
    (
        <div key={item.text + idx}
             onClick={()=>handle_item_click(idx, item.callbackOnSelect)}>
                 {item.text}
        </div>
    ));

    return <div className="MenuButton" title={props.title}>
               <div className="tooltip" style={{display:(props.showTooltip? "auto" : "none")}}>
                   {currentItemText}
               </div>
               <div className={`icon ${dropdownVisible? "active" : "inactive"}`.trim()}
                    onClick={dropdownVisible? hide_dropdown : show_dropdown}>
                        <i className={props.icon}/>
               </div>
               <div className={`dropdown ${dropdownVisible? "active" : "inactive"}`.trim()}>
                   <div className="title">
                       {props.title}
                   </div>
                   <div className="items">
                       {itemElements}
                   </div>
               </div>
           </div>

    function handle_item_click(itemIdx, callback)
    {
        setCurrentItemText(props.items[itemIdx].text);
        setDropdownVisible(false);
        callback();
    }

    function hide_dropdown()
    {
        setDropdownVisible(false);
    }

    function show_dropdown()
    {
        setDropdownVisible(true);
    }
}

MenuButton.defaultProps =
{
    title: "?",
    items:
    [
        {text:"?", callbackOnSelect:()=>error("This menu item has not been fully implemented.")},
    ],
    initialItemIdx: 0,
    icon: "fas fa-question",
    showTooltip: true,
}

MenuButton.validate_props = function(props)
{
    panic_if_not_type("object", props, props.items);
    panic_if_not_type("string", props.title);

    return;
}
