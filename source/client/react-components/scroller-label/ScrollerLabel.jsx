/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {LL_PrivateError} from "../../private-error.js";
import {Scroller} from "./Scroller.js";

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
//     "month-name" = a string giving the name of a month, whose index is given by props.value
//                    such that e.g. props.value = 2 displays the name of March. Note that the
//                    name will be displayed in Finnish.
//
// A function to be called when the value changes can be provided via props.onChange. It
// will receive as a parameter the current value.
//
export function ScrollerLabel(props = {})
{
    ScrollerLabel.validate_props(props);

    const language = ReactRedux.useSelector(state=>state.language);
    
    const [underlyingValue, setUnderlyingValue] = React.useState(props.value);

    let value = underlyingValue;

    React.useEffect(()=>
    {
        props.onChange(underlyingValue);
        return ()=>props.onChange(underlyingValue);
    }, [underlyingValue]);

    return <div className="ScrollerLabel">

        <Scroller
            icon="fas fa-caret-up fa-2x"
            additionalClassName="up"
            callback={()=>scroll_value(1)}
        />

        <div className="value">
            {`${displayable_value()}${props.suffix || ""}`}
        </div>

        <Scroller
            icon="fas fa-caret-down fa-2x"
            additionalClassName="down"
            callback={()=>scroll_value(-1)}
        />
    </div>

    function scroll_value(direction = 1)
    {
        value = (value + direction) < props.min? props.max :
                (value + direction) > props.max? props.min :
                (value + direction);

        setUnderlyingValue(value);
    }

    // Returns a version of the underlying value that can be displayed to the user. For
    // instance, when the user has requested month names, the underlying value 5 will
    // return the name of the 5th month, May.
    function displayable_value()
    {
        switch (props.type)
        {
            case "integer": return underlyingValue;
            case "month-name": return month_name(underlyingValue-1, language);
            default: throw LL_PrivateError("Unknown value type.");
        }
    }

    // Returns as a string the name of the month with the given index (0-11), such that
    // e.g. 11 corresponds to December and 0 to January.
    function month_name(idx = 0, language = "fiFI")
    {
        const monthNames = {
            fiFI: [
                "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
                "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"
            ],
            enEN: [
                "January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"
            ],
        }

        return (monthNames[language] || monthNames["fiFI"])[idx % 12];
    }
}

ScrollerLabel.validate_props = function(props)
{
    ll_assert_native_type("object", props);
    ll_assert_native_type("string", props.type);
    ll_assert_native_type("number", props.min, props.max, props.value);
    ll_assert_native_type("function", props.onChange);

    return;
}
