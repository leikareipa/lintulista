/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

// Renders a button with a drop-down menu.
//
// The menu's title is to be provided via props.title.
//
// The React elements to be rendered as the drop-down menu's options are to be provided in
// an array via props.options.
//
// The icon to be rendered for the button should be provided via props.icon as a Font Awesome
// class name string (e.g. "fas fa-question fa-2x").
//
/// TODO: Add showing which of the drop-down's options are currently selected.
//
export function MenuButton(props = {})
{
    MenuButton.validate_props(props);

    const [dropdownVisible, setDropdownVisible] = React.useState(false);

    React.useEffect(()=>
    {
        window.addEventListener("click", handle_click);
        return ()=>window.removeEventListener("click", handle_click);

        function handle_click(clickEvent)
        {
            const clickedOnIcon = (()=>
            {
                let node = clickEvent.target;
                while (node)
                {
                    /// FIXME: Shouldn't match all possible DOM elements with 'icon' in their class list.
                    if (node.classList &&
                        node.classList.contains("icon"))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            if (!clickedOnIcon)
            {
                hide_dropdown();
            }
        }
    }, []);

    return <div className="MenuButton">
               <div className={`icon ${dropdownVisible? "active" : "inactive"}`.trim()}
                    onClick={dropdownVisible? hide_dropdown : show_dropdown}>
                        <i className={props.icon}/>
               </div>
               <div className={`dropdown ${dropdownVisible? "active" : "inactive"}`.trim()}>
                   <div className="title">{props.title}</div>
                   {props.options}
               </div>
           </div>

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
    options: [<div style={{backgroundColor:"gray", color:"white"}}>?</div>],
    icon: "fas fa-question",
}

MenuButton.validate_props = function(props)
{
    panic_if_not_type("object", props, props.options);
    panic_if_not_type("string", props.title);

    return;
}
