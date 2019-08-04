/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, warn} from "../../assert.js";

// Renders a button associated with a drop-down menu that activates when the button is
// clicked. The drop-down menu holds a set of items that the user can click on; when an
// item is clicked, the menu is closed and the item's callback is called.
//
// Each menu button requires a unique id string, which can be provided via props.id. It
// will be stored in the DOM as the button element's 'data-menu-button-id' attribute.
//
// You can set via props.enabled whether the button is enabled (true) or disabled (false).
// The only effect of this is that the button's class list will be set accordingly, such
// that when props.enabled = true, the class list will be "MenuButton enabled", and while
// props.enabled = false, the class list will be "MenuButton disabled".
//
// The icon to be rendered on the button should be provided via props.icon as a Font
// Awesome class name string (e.g. "fas fa-question fa-2x" for a large question mark).
//
// A callback for when the user clicks on the button can be provided via props.callbackOnButtonClick.
// It will be passed no parameters.
//
// The menu's title is to be provided via props.title.
//
// The menu's items can be provided via props.items as an array of objects of the
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
// If no menu items are provided, the menu button acts as a regular button; i.e. clicking
// on it will not open a menu. You can detect the click via props.callbackOnButtonClick.
//
/// TODO: Add showing which of the drop-down's items are currently selected.
//
export function MenuButton(props = {})
{
    MenuButton.validate_props(props);

    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    const [currentItemText, setCurrentItemText] = React.useState(props.items.length? props.items[props.initialItemIdx].text
                                                                                   : "null");

    // Implements a click handler that toggles the dropdown when the user clicks on the
    // button, and hides the dropdown if it's visible when the user clicks outside of the
    // button or the dropdown.
    React.useEffect(()=>
    {
        window.addEventListener("mousedown", handle_mousedown);

        return ()=>
        {
            window.removeEventListener("mousedown", handle_mousedown);
        }

        function handle_mousedown(clickEvent)
        {
            const clickedOnSelf = (()=>
            {
                let node = clickEvent.target;
                while (node)
                {
                    if (node.dataset && (node.dataset.menuButtonId === props.id))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            const clickedOnItem = Boolean(clickedOnSelf &&
                                          clickEvent.target.classList &&
                                          clickEvent.target.classList.contains("item"));

            if (clickedOnSelf)
            {
                if (!clickedOnItem)
                {
                    dropdownVisible? hide_dropdown() : show_dropdown();
                    props.callbackOnButtonClick();
                }
                // Else, let the item's own onClick handler deal with the click.
            }
            else
            {
                hide_dropdown();
            }
        }
    });

    const itemElements = props.items.map((item, idx)=>
    (
        <div key={item.text + idx}
             className="item"
             onClick={()=>handle_item_click(idx, item.callbackOnSelect)}>
                 {item.text}
        </div>
    ));

    const dropDownMenu = !props.items.length? <></>
                                            : <div className={`dropdown ${dropdownVisible? "active" : "inactive"}`}>
                                                  <div className="title">
                                                      {props.title}
                                                  </div>
                                                  <div className="items">
                                                      {itemElements}
                                                  </div>
                                              </div>

    return <div className={`MenuButton ${props.enabled? "enabled" : "disabled"}`}
                data-menu-button-id={props.id}>
                    <div className="tooltip" style={{display:(props.showTooltip? "auto" : "none")}}>
                        {currentItemText}
                    </div>
                    <div className={`icon ${dropdownVisible? "active" : "inactive"}`.trim()}
                         title={props.title}>
                             <i className={props.icon}/>
                    </div>
                    {dropDownMenu}
           </div>

    function handle_item_click(itemIdx, callback)
    {
        if (!props.items.length)
        {
            warn("Received a click on an item even though there are no items.");
            return;
        }

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
        if (props.items.length)
        {
            setDropdownVisible(true);
        }
    }
}

MenuButton.defaultProps =
{
    title: "?",
    icon: "fas fa-question",
    items: [],
    enabled: true,
    initialItemIdx: 0,
    showTooltip: true,
    callbackOnButtonClick: ()=>{}
}

MenuButton.validate_props = function(props)
{
    panic_if_not_type("object", props, props.items);
    panic_if_not_type("string", props.title, props.id);

    return;
}
