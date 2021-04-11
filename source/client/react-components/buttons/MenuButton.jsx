/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        throw_if_not_true,
        ll_assert} from "../../assert.js";

// Renders a button associated with a drop-down menu that activates when the button is
// clicked. The drop-down menu holds a set of items that the user can click on; when an
// item is clicked, the menu is closed and the item's callback is called.
//
// Each menu button requires a unique id string, which can be provided via props.id. It
// will be stored in the DOM as the button element's 'data-menu-button-id' attribute, and
// appended to the button's class list.
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
// The menu's title is to be provided via props.title. If an empty string is given, the
// dropdown will be rendered without a title element.
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
// Alternatively, instead of menu items, you can provide a custom drop-down menu via
// props.customMenu. It should be a React element as returned from React.createElement()
// (or as JSX).
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

            const clickedOnTitle = Boolean(clickedOnSelf &&
                                           clickEvent.target.classList &&
                                           clickEvent.target.classList.contains("title"));

            const clickedOnCustomMenu = (()=>
            {
                if (!props.customMenu)
                {
                    return false;
                }

                let node = clickEvent.target;
                while (node)
                {
                    if (node.classList && node.classList.contains("custom-menu"))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            if (clickedOnSelf)
            {
                if (!clickedOnItem && !clickedOnTitle && !clickedOnCustomMenu)
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

    const dropDownMenu = (()=>
    {
        if (props.customMenu)
        {
            return <div className={`dropdown custom-menu ${dropdownVisible? "active" : "inactive"}`}>
                        {props.customMenu}
                   </div>
        }
        else
        {
            if (!props.items.length)
            {
                return <></>;
            }
            else
            {
                return <div className={`dropdown ${dropdownVisible? "active" : "inactive"}`}>
                           <div className="items">
                               {props.title.length? <div className="title">
                                                        {props.title}
                                                    </div>
                                                  : <></>}
                               {itemElements}
                           </div>
                       </div>
            }
        }
    })();

    return <div className={`MenuButton ${props.enabled? "enabled" : "disabled"} ${props.id}`}
                data-menu-button-id={props.id}>
                    <div className="tooltip" style={{display:(props.showTooltip? "initial" : "none")}}>
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
        ll_assert(props.item.length, "Received a click on an item even though there are no items.");

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
        if (props.items.length || props.customMenu)
        {
            setDropdownVisible(true);
        }
    }
}

MenuButton.defaultProps =
{
    id: "undefined-menu-button",
    title: "?",
    icon: "fas fa-question",
    items: [],
    enabled: true,
    initialItemIdx: 0,
    showTooltip: true,
    callbackOnButtonClick: ()=>{},
    customMenu: false,
}

MenuButton.validate_props = function(props)
{
    ll_assert_native_type("object", props, props.items);
    ll_assert_native_type("string", props.title, props.id);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
MenuButton.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    // Test a normal MenuButton without a visible tooltip.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(MenuButton,
            {
                icon: "fas fa-list-ul fa-fw",
                title: "Title1",
                id: "Test-Menu",
                items:
                [
                    {text:"Option1", callbackOnSelect: ()=>{}},
                    {text:"Option2", callbackOnSelect: ()=>{}},
                ],
                initialItemIdx: 1,
                showTooltip: false,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const menuButton = container.querySelector(".MenuButton");
        const tooltip = menuButton.querySelector(".tooltip");
        const icon = menuButton.querySelector(".icon");
        const dropdown = menuButton.querySelector(".dropdown");
        const dropdownItems = dropdown.querySelector(".items");

        throw_if_not_true([()=>(menuButton !== null),
                           ()=>(icon !== null),
                           ()=>(tooltip !== null),
                           ()=>(dropdown !== null),
                           ()=>(menuButton.classList.contains("Test-Menu")),
                           ()=>(menuButton.classList.contains("enabled")),
                           ()=>(tooltip.style.display === "none"),
                           ()=>(tooltip.textContent === "Option2"),
                           ()=>(icon.getAttribute("title") === "Title1"),
                           ()=>(dropdown.classList.contains("inactive")),
                           ()=>(dropdownItems.querySelector(".title") !== null),
                           ()=>(dropdownItems.querySelector(".title").textContent === "Title1"),
                           ()=>(dropdownItems.querySelectorAll(".item").length === 2),
                           ()=>(dropdownItems.querySelectorAll(".item")[0].textContent === "Option1"),
                           ()=>(dropdownItems.querySelectorAll(".item")[1].textContent === "Option2")]);

        /// TODO: Test that the dropdown menu opens and is valid when the button is clicked.
    }
    catch (error)
    {
        if (error === "assertion failure") return false;

        throw error;
    }
    finally
    {
        container.remove();
    }

    // Test a normal MenuButton with a visible tooltip.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(MenuButton,
            {
                icon: "fas fa-list-ul fa-fw",
                title: "Title1",
                id: "Test-Menu",
                items:
                [
                    {text:"Option1", callbackOnSelect: ()=>{}},
                    {text:"Option2", callbackOnSelect: ()=>{}},
                ],
                initialItemIdx: 1,
                showTooltip: true,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const tooltip = container.querySelector(".tooltip");

        throw_if_not_true([()=>(tooltip !== null),
                           ()=>(tooltip.style.display !== "none"),
                           ()=>(tooltip.textContent === "Option2")]);
    }
    catch (error)
    {
        if (error === "assertion failure") return false;

        throw error;
    }
    finally
    {
        container.remove();
    }

    // Test a MenuButton that has a custom menu.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(MenuButton,
            {
                icon: "fas fa-list-ul fa-fw",
                title: "Title1",
                id: "Test-Menu",
                customMenu:
                    <div id="Custom1">
                        Hello there.
                    </div>,
                initialItemIdx: 1,
                showTooltip: true,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const tooltip = container.querySelector(".tooltip");
        const dropdown = container.querySelector(".dropdown");
        const icon = container.querySelector(".icon");

        throw_if_not_true([()=>(tooltip !== null),
                           ()=>(dropdown !== null),
                           ()=>(icon !== null),
                           ()=>(icon.getAttribute("title") === "Title1"),
                           ()=>(dropdown.childNodes.length === 1),// Should have one child: the custom menu.
                           ()=>(dropdown.classList.contains("custom-menu"))]);

        const customMenu = dropdown.childNodes[0];

        throw_if_not_true([()=>(customMenu !== null),
                           ()=>(customMenu.getAttribute("id") === "Custom1"),
                           ()=>(customMenu.textContent === "Hello there.")]);
    }
    catch (error)
    {
        if (error === "assertion failure") return false;

        throw error;
    }
    finally
    {
        container.remove();
    }

    return true;
}
