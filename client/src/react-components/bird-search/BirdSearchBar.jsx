"use strict";

import {panic_if_not_type, panic} from "../../assert.js";

// A search bar that allows the user to enter a string to be compared against the names of
// a set of birds.
//
// The search bar has two possible states: "active" and "inactive". It is active when the
// bar or the corresponding list of search results has focus; and inactive otherwise. For
// styling with CSS, the search bar's class list will be appended with either "active" or
// "inactive" to reflect the element's state. The bar's initial state can be provided as
// a string via props.initialState.
//
// An optional callback provided via props.callbackOnActivated will be called when the search
// bar becomes active. Likewise, an optional callback given via props.callbackOnInactivated
// will be called when the search bar becomes inactive.
//
// An optional callback provided via props.callbackOnChange will be called when the search
// bar receives user input. It will be provided one parameter: the search bar's current
// value.
//
export function BirdSearchBar(props = {})
{
    BirdSearchBar.validateProps(props);

    const searchRef = React.useRef();

    const [state, setState] = React.useState(props.initialState);

    const [currentText, setCurrentText] = React.useState("");

    // Implements a click handler that clears away any search results and inactivates the
    // search bar when the user clicks outside of the search element - but not when they
    // click ON the search element.
    React.useEffect(()=>
    {
        window.addEventListener("mousedown", handle_search_click);
        return ()=>window.removeEventListener("mousedown", handle_search_click);

        function handle_search_click(clickEvent)
        {
            const clickedOnSearchElement = (()=>
            {
                let node = clickEvent.target;
                while (node)
                {
                    if (node.classList &&
                        (node.classList.contains("BirdSearchResultsDisplay") ||
                         node.classList.contains("BirdSearchResult") ||
                         node.classList.contains("BirdSearchBar")))
                    {
                        return true;
                    }

                    node = node.parentNode;
                }

                return false;
            })();

            if (!clickedOnSearchElement)
            {
                setState("inactive");
            }
        }
    }, []);
    
    React.useEffect(()=>
    {
        if (!["active", "inactive"].includes(state))
        {
            panic(`Invalid state value "${state}".`);
        }

        switch (state)
        {
            case "inactive":
            {
                props.callbackOnInactivate();
                break;
            }
            case "active":
            {
                props.callbackOnActivate();
                break;
            }
            default: panic(`Unknown state "${state}".`); break;
        }
    }, [state]);

    return <div className="BirdSearchBar">
               <input className={`search-bar ${state}`.trim()}
                      ref={searchRef}
                      type="search"
                      onBlur={()=>
                      {
                          if (!currentText.length)
                          {
                              got_focus(false);
                          }
                      }}
                      onFocus={()=>got_focus(true)}
                      onChange={handle_input_event}
                      spellCheck="false"
                      placeholder={(state === "inactive")? "Hae lajia" : ""}
                      autoComplete="off"/>
                <div className="icon">
                    <i className="fas fa-search"/>
                </div>
           </div>

    function got_focus(gotIt)
    {
        setState(gotIt? "active" : "inactive");

        if (gotIt && currentText)
        {
            props.callbackOnChange(currentText);
        }
    }

    function handle_input_event(inputEvent)
    {
        const inputString = inputEvent.target.value.trim();

        setCurrentText(inputString);

        props.callbackOnChange(inputString);
    }
}

BirdSearchBar.defaultProps =
{
    initialState: "inactive",
    callbackOnChange: ()=>{},
    callbackOnActivate: ()=>{},
    callbackOnInactivate: ()=>{},
}

BirdSearchBar.validateProps = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("string", props.initialState);
    panic_if_not_type("function", props.callbackOnChange, props.callbackOnActivate, props.callbackOnInactivate);

    if (!["active", "inactive"].includes(props.initialState))
    {
        panic(`Invalid state value "${props.initialState}".`);
    }

    return;
}
