"use strict";

import {panic_if_not_type, panic, throw_if_not_true} from "../../assert.js";

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

               <input className={`search-field ${state}`.trim()}
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
                      placeholder="Hae lajia"
                      autoComplete="off"/>

               <i className="icon fas fa-search"/>
                
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

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
BirdSearchBar.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        let currentSearchString = "nothing";

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(BirdSearchBar,
            {
                callbackOnChange: (string)=>{currentSearchString = string;},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        // Test that changes to the input field get passed on to the onChange callback.
        {
            const inputField = container.querySelector("input");

            throw_if_not_true([()=>(inputField !== null)]);

            inputField.value = "blub blab"
            ReactTestUtils.Simulate.change(inputField);

            throw_if_not_true([()=>(currentSearchString === inputField.value)]);

            inputField.value = ""
            ReactTestUtils.Simulate.change(inputField);

            throw_if_not_true([()=>(currentSearchString.length === 0)]);
        }

        /// TODO: Test the onFocus callback.
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
