"use strict";

import {panic_if_not_type, panic} from "../../assert.js";

// A search bar that allows the user to enter a string to be compared against the names of
// a set of birds.
//
// The search field has two states: "enabled", and "disabled". The field's current state is
// appended to its class name, and can thus be styled accordingly using CSS. At the moment,
// the state is set by the parent, by passing it via props.state.
//
// Callbacks for the onblur, onfocus, and onchange events are expected in props.onBlur,
// props.onFocus, and props.onChange, respectively.
//
export function BirdSearchField(props = {})
{
    BirdSearchField.validateProps(props);

    const searchRef = React.useRef();

    React.useEffect(()=>
    {
        if (searchRef.current && (props.state === "inactive"))
        {
            searchRef.current.value = "";
        }
    });

    return <input className={`BirdSearchField ${props.state}`.trim()}
                  ref={searchRef}
                  type="search"
                  placeholder={(props.state === "inactive")? "Hae lajia..." : ""}
                  spellCheck="false"
                  autoComplete="off"
                  onBlur={props.onBlur}
                  onFocus={props.onFocus}
                  onChange={props.onChange}/>
}

BirdSearchField.validateProps = function(props)
{
    panic_if_not_type("object", props);

    if (!["active", "inactive"].includes(props.state))
    {
        panic("Invalid state name for BirdSearchField.");
    }

    return;
}
