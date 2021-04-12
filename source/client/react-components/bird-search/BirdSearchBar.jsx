"use strict";

import {ll_assert,
        ll_assert_native_type} from "../../assert.js";
import {tr} from "../../translator.js";

// A search bar that allows the user to enter a string to be compared against the names of
// a set of birds.
//
// The search bar has two possible states: "active" and "inactive". It is active when the
// bar or the corresponding list of search results has focus; and inactive otherwise. For
// styling with CSS, the search bar's class list will be appended with either "active" or
// "inactive" to reflect the element's state. The bar's initial state can be provided as
// a string via props.initialState.
//
// An optional callback provided via props.cbOnActivate will be called when the search
// bar becomes active. Likewise, an optional callback given via props.cbOnInactivate
// will be called when the search bar becomes inactive.
//
// An optional callback provided via props.cbOnChange will be called when the search
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
                let targetNode = clickEvent.target;
            
                // Kludge to detect clicks on the browser's scroll bar. We want to allow the
                // search results to remain open while the user operates the scroll bar, so
                // we'll return true to facilitate that.
                if (targetNode && targetNode.tagName.toLowerCase() === "html")
                {
                    return true;
                }

                while (targetNode)
                {
                    if (targetNode.classList &&
                        (targetNode.classList.contains("BirdSearchResultsDisplay") ||
                         targetNode.classList.contains("BirdSearchResult") ||
                         targetNode.classList.contains("BirdSearchBar")))
                    {
                        return true;
                    }

                    targetNode = targetNode.parentNode;
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
        switch (state) {
            case "inactive": {
                props.cbOnInactivate();
                break;
            }
            case "active": {
                props.cbOnActivate();
                break;
            }
            default: console.error(`Unknown state "${state}".`); break;
        }
    }, [state]);

    return <div className="BirdSearchBar">

               <input className={`search-field ${state}`.trim()}
                      ref={searchRef}
                      type="search"
                      onBlur={()=> {
                          if (!currentText.length) {
                              got_focus(false);
                          }
                      }}
                      onFocus={()=>got_focus(true)}
                      onChange={handle_input_event}
                      spellCheck="false"
                      placeholder={tr("Search for species")}
                      autoComplete="off"/>

               <i className="icon fas fa-search"/>
                
           </div>

    function got_focus(gotIt)
    {
        setState(gotIt? "active" : "inactive");

        if (gotIt && currentText) {
            props.cbOnChange(currentText);
        }
    }

    function handle_input_event(inputEvent)
    {
        const inputString = inputEvent.target.value.trim();
        setCurrentText(inputString);
        props.cbOnChange(inputString);
    }
}

BirdSearchBar.defaultProps =
{
    initialState: "inactive",
    cbOnChange: ()=>{},
    cbOnActivate: ()=>{},
    cbOnInactivate: ()=>{},
}

BirdSearchBar.validateProps = function(props)
{
    ll_assert_native_type("object", props);
    ll_assert_native_type("string", props.initialState);
    ll_assert_native_type("function", props.cbOnChange,
                                      props.cbOnActivate,
                                      props.cbOnInactivate);

    ll_assert(["active", "inactive"].includes(props.initialState),
              "Unrecognized state value.");

    return;
}
