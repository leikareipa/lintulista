/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic_if_not_type, error, warn, panic, throw_if_not_true} from "../../assert.js";
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
//                    such that e.g. props.value = 2 displays the name of March.
//
// If the "month-name" type is used, a language hint can be given via props.language for
// which language to display the month's name in.
//
// A function to be called when the value changes can be provided via props.onChange. It
// will receive as a parameter the current value.
//
export function ScrollerLabel(props = {})
{
    ScrollerLabel.validate_props(props);
    
    const [underlyingValue, setUnderlyingValue] = React.useState(props.value);

    let value = underlyingValue;

    React.useEffect(()=>
    {
        props.onChange(underlyingValue);
        return ()=>props.onChange(underlyingValue);
    }, [underlyingValue]);

    return <div className="ScrollerLabel">
               <Scroller icon="fas fa-caret-up fa-2x"
                         additionalClassName="up"
                         callback={()=>scroll_value(1)}/>
               <div className="value">
                   {`${displayable_value()}${props.suffix || ""}`}
               </div>
               <Scroller icon="fas fa-caret-down fa-2x"
                         additionalClassName="down"
                         callback={()=>scroll_value(-1)}/>
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
            case "month-name": return month_name(underlyingValue-1, props.language);
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

ScrollerLabel.validate_props = function(props)
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

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
ScrollerLabel.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container;

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
                language: "fi",
                value: 3, // 3rd month of the year; "maaliskuu".
                min: 0,
                max: 11,
                suffix: "ta", // E.g. "maaliskuuTA".
                onChange: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.textContent === "maaliskuuta")]);

        const scrollUp = container.querySelector(".Scroller.up");
        const scrollDown = container.querySelector(".Scroller.down");

        throw_if_not_true([()=>(scrollUp instanceof HTMLElement),
                           ()=>(scrollDown instanceof HTMLElement)]);

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
    }
    catch
    {
        return false;
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
    catch
    {
        return false;
    }
    finally
    {
        container.remove();
    }

    return true;
}
