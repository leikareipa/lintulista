"use strict";

// A search bar that allows the user to enter a string to be compared against the names of
// a set of birds.
export function BirdSearchField(props = {})
{
    return <input className="BirdSearchField"
                  type="search"
                  placeholder="Hae lajin nimellä..."
                  spellCheck="false"
                  autoComplete="off"
                  onBlur={props.onBlur}
                  onFocus={props.onFocus}
                  onChange={props.onChange}/>
}
