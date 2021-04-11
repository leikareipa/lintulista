/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, throw_if_not_true} from "../../assert.js";
import {delay} from "../../delay.js";
import {tr} from "../../translator.js";

// An element that when clicked, will call (or "fire") the callback function provided
// via props.callback. If clicked and held, will keep firing at an interval until the
// click is released or the mouse leaves the element.
//
// The element will be rendered with a Font Awesome icon, which can be provided via
// props.icon. This is to be a font awesome class name string, e.g. "fas fa-question"
// for a question mark icon.
//
export function Scroller(props = {})
{
    Scroller.validateProps(props);

    // How long to require the press to be held down before engaging the firing loop.
    const firingLoopDelayMs = 350;

    // How often to fire while in the firing loop.
    const firingLoopIntervalMs = 190;

    const [firingLoopCountdown, setFiringLoopCountdown] = React.useState(null);
    const [firingLoop, setFiringLoop] = React.useState(null);
    const [mouseDown, setMouseDown] = React.useState(false);

    React.useEffect(()=>
    {
        if (mouseDown)
        {
            fire();

            // If the mouse press is held, we'll start automatic firing.
            setFiringLoopCountdown(setTimeout(start_firing_loop, firingLoopDelayMs));
        }
        else
        {
            clearTimeout(firingLoopCountdown);
            setFiringLoopCountdown(null);
            
            stop_firing_loop();
        }
    }, [mouseDown])

    return <div className={`Scroller ${props.additionalClassName || ""}`.trim()}
                onMouseDown={()=>setMouseDown(true)}
                onMouseUp={()=>setMouseDown(false)}
                onMouseLeave={()=>setMouseDown(false)}>

                    <i className={props.icon}/>
                    
           </div>

    function start_firing_loop()
    {
        if (!firingLoop) {
            setFiringLoop(setInterval(fire, firingLoopIntervalMs));
        }
        else {
            warn("The scroller started firing twice.");
        }
    }

    function stop_firing_loop()
    {
        if (firingLoop) {
            clearInterval(firingLoop);
            setFiringLoop(null);
        }
    }

    function fire()
    {
        props.callback();
    }
}

Scroller.defaultProps =
{
    symbol: "fas fa-question",
}

Scroller.validateProps = function(props)
{
    panic_if_not_type("function", props.callback);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
Scroller.test = async()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    // Scroller with named months.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // We'll do some async waiting, so prevent the container from showing while we do that.
        container.style.display = "none";

        let value = 0;

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(Scroller,
            {
                icon: "fas fa-caret-up fa-2x",
                additionalClassName: "up",
                callback: ()=>{value++},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const scroller = container.querySelector(".Scroller.up");

        throw_if_not_true([()=>(scroller !== null)]);

        // Clicking on the scroller. One firing of the click callback should occur.
        {
            throw_if_not_true([()=>(value === 0)]);

            ReactTestUtils.Simulate.mouseDown(scroller);
            ReactTestUtils.Simulate.mouseUp(scroller);

            throw_if_not_true([()=>(value === 1)]);
        }

        // Clicking and holding the scroller. Multiple firings of the click callback should
        // occur.
        {
            throw_if_not_true([()=>(value === 1)]);

            ReactTestUtils.Simulate.mouseDown(scroller);
            await delay(700);
            ReactTestUtils.Simulate.mouseUp(scroller);

            throw_if_not_true([()=>(value > 2)]);
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
