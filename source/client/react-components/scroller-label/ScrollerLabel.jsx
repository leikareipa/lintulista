/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type,
        throw_if_not_true} from "../../assert.js";
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
    
    const [underlyingValue, setUnderlyingValue] = React.useState(props.value);

    const language = "fiFI";

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

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
ScrollerLabel.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    // Scroller with named months.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ScrollerLabel,
            {
                type: "month-name",
                value: 3, // 3rd month of the year; "maaliskuu".
                min: 1,
                max: 12,
                suffix: "ta", // E.g. "maaliskuuTA".
                onChange: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.textContent === "maaliskuuta")]);

        const scrollUp = container.querySelector(".Scroller.up");
        const scrollDown = container.querySelector(".Scroller.down");

        throw_if_not_true([()=>(scrollUp !== null),
                           ()=>(scrollDown !== null)]);

        // Scrolling up.
        {
            // Scroll from "maaliskuu" to "huhtikuu".
            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);

            throw_if_not_true([()=>(container.textContent === "huhtikuuta")]);
        }

        // Scrolling down.
        {
            // Scroll from "huhtikuu" back to "maaliskuu".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            // Scroll from "maaliskuu" to "helmikuu".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            throw_if_not_true([()=>(container.textContent === "helmikuuta")]);
        }

        // Wrapping around when scrolling.
        {
            // Scroll from "helmikuu" to "tammikuu".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            // Wrap over from "tammikuu" to "joulukuu".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            throw_if_not_true([()=>(container.textContent === "joulukuuta")]);

            // Wrap over from "joulukuu" to "tammikuu".
            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);

            throw_if_not_true([()=>(container.textContent === "tammikuuta")]);
        }

        // Scroll through and verify all month names.
        {
            throw_if_not_true([()=>(container.textContent === "tammikuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "helmikuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "maaliskuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "huhtikuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "toukokuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "kesäkuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "heinäkuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "elokuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "syyskuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "lokakuuta")]);
            
            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "marraskuuta")]);

            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);
            throw_if_not_true([()=>(container.textContent === "joulukuuta")]);
        }
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

    // Scroller with integers.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container)

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ScrollerLabel,
            {
                type: "integer",
                value: 1,
                min: 0,
                max: 2,
                onChange: ()=>{},
            });

            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.textContent === "1")]);

        const scrollUp = container.querySelector(".Scroller.up");
        const scrollDown = container.querySelector(".Scroller.down");

        throw_if_not_true([()=>(scrollUp instanceof HTMLElement),
                           ()=>(scrollDown instanceof HTMLElement)]);

        // Scrolling up.
        {
            // Scroll from "1" to "2".
            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);

            throw_if_not_true([()=>(container.textContent === "2")]);
        }

        // Scrolling down.
        {
            // Scroll from "2" back to "1".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            // Scroll from "1" to "0".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            throw_if_not_true([()=>(container.textContent === "0")]);
        }

        // Wrapping around when scrolling.
        {
            // Wrap over from "0" to "2".
            ReactTestUtils.Simulate.mouseDown(scrollDown);
            ReactTestUtils.Simulate.mouseUp(scrollDown);

            throw_if_not_true([()=>(container.textContent === "2")]);

            // Wrap over from "2" to "0".
            ReactTestUtils.Simulate.mouseDown(scrollUp);
            ReactTestUtils.Simulate.mouseUp(scrollUp);

            throw_if_not_true([()=>(container.textContent === "0")]);
        }
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
