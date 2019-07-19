/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type, error, warn, panic} from "../../assert.js";

// Displays a textual label along with arrows to change (scroll) the label's value. For
// instance, you might have a label containing "1", and the arrows can be used to scroll
// that value higher or lower.
//
// The label's initial value is provided via props.value. The upper and lower bounds for
// the value are provided in props.max and props.min, correspondingly. If the value is
// scrolled past the maximum, it will be reset to the minimum value; and vice versa for
// scrolling below the minimum value.
//
// The type of value is given via props.type. This is a string describing the value's type.
// The following types are accepted:
//
//     "integer" = an integer value, like 1, 10, 8744, etc.
//     "month" = a string giving the name of a month, whose index is given by props.value
//               such that e.g. props.value = 2 displays the name of March.
//
// If the "month" type is used, a language hint can be given via props.language for which
// language to display the month's name in.
//
// A function to be called when the value changes can be provided via props.onChange. It
// will receive as a parameter the current value.
//
export function ScrollerLabel(props = {})
{
    panic_if_undefined(props.type, props.min, props.max);
    panic_if_not_type("number", props.min, props.max, props.value);

    if (!props.onChange)
    {
        warn("No onChange callback function passed to this scroller label.");
    }
    else if (typeof props.onChange !== "function")
    {
        panic("Expected the onChange property to be a function.");
    }

    const [underlyingValue, setUnderlyingValue] = React.useState(props.value);

    React.useEffect(()=>
    {
        props.onChange(underlyingValue);
    }, [underlyingValue]);

    /// TODO: Automatic scrolling while holding down the mouse button.
    return <div className="ScrollerLabel">
               <div className="scroller increase" onClick={()=>scroll_value(1)}>
                   <i className="fas fa-caret-up fa-2x"></i>
               </div>

               <div className="value">
                   {`${displayable_value()}${props.suffix || ""}`}
               </div>

               <div className="scroller decrease" onClick={()=>scroll_value(-1)}>
                   <i className="fas fa-caret-down fa-2x"></i>
               </div>
           </div>

    function scroll_value(direction = 1)
    {
        setUnderlyingValue((underlyingValue + direction) < props.min? props.max :
                    (underlyingValue + direction) > props.max? props.min :
                    (underlyingValue + direction));
    }

    // Returns a version of the underlying value that can be displayed to the user. For
    // instance, when the user has requested month names, the underlying value 5 will
    // return the name of the 5th month, May.
    function displayable_value()
    {
        switch (props.type)
        {
            case "integer": return underlyingValue;
            case "month": return month_name(underlyingValue-1, props.language);
            default: error("Unknown value type."); return "?";
        }
    }

    // Returns as a string the name of the month with the given index (0-11), such that
    // e.g. 11 corresponds to December and 0 to January.
    function month_name(idx = 0, language = "fi")
    {
        return new Intl.DateTimeFormat(language, {month: "long"}).format(new Date().setMonth(idx % 12));
    }
}

ScrollerLabel.defaultProps =
{
    language: "fi",
}
