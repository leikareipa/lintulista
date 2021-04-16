/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions to create and manage shades - DOM elements filling the entire parent
 * container with a dark (partially see-through or fully opaque) color.
 * 
 */

"use strict";

import {ll_assert,
        ll_assert_native_type} from "./assert.js";

// Appends an element over the viewport's entire body, with the given opacity, z-index and
// click callback as given.
//
// Returns a promise that resolves to the function's interface once the darkener element
// has transitioned into its full opacity.
//
// Once the return promise resolves, you can call .remove() to remove the darkener element
// from the DOM. Note that .remove() returns with a promise that resolves once the darkener
// element has transitioned into full transparency and been removed from the DOM.
//
export function darken_viewport(args = {/*z, onClick, opacity*/})
{
    ll_assert_native_type("object", args);

    args = {...darken_viewport.defaultArgs, ...args};

    const shadeId = random_id();
    const transitionDuration = 0.2;

    // Insert the shade into the DOM. Note that by default, it's not yet displayed.
    const shadeElement = (()=>
    {
        const element = document.createElement("div");

        element.id = shadeId;
        element.onclick = args.onClick;
        element.style.cssText = `background-color: black;
                                 position: fixed;
                                 top: 0;
                                 left: 0;
                                 width: 100%;
                                 height: 100%;
                                 opacity: 0;
                                 transition: opacity ${transitionDuration}s linear;
                                 z-index: ${args.z};`

        document.body.appendChild(element);

        return element;
    })();

    const publicInterface = Object.freeze(
    {
        id: shadeId,

        // Remove the darkening. Returns a promise that resolves once the darkener element
        // has transitioned into full transparency and has been removed from the DOM.
        remove: ()=>
        {
            return new Promise(resolve=>
            {
                if (!shadeId) {
                    resolve();
                    return;
                }

                shadeElement.style.opacity = "0";

                // Use a timeout instead of a transition event listener to prevent a missing
                // transition from holding up the app.
                setTimeout(()=>{
                    shadeElement.remove();
                    resolve();
                }, (transitionDuration * 1000));
            });
        },
    });

    return new Promise(resolve=>
    {
        if (!shadeId)
        {
            resolve(publicInterface);
            return;
        }
        
        // Use a timeout instead of a transition event listener to prevent a missing
        // transition from holding up the app.
        shadeElement.style.zIndex = args.z;
        shadeElement.onclick = args.onClick;
        shadeElement.style.opacity = `${window.getComputedStyle(shadeElement).opacity + args.opacity}`; // Trigger post-appendChild() reflow with getComputedStyle().

        setTimeout(()=>
        {
            resolve(publicInterface);
        }, (transitionDuration * 1000));
    });

    // Generates a unique (pseudo-)random DOM id; otherwise returns null to indicate failure.
    function random_id()
    {
        let loops = 0;
        let seed = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._"];
        let id = null;
        
        do
        {
            if (++loops > 100) {
                return null;
            }

            for (let shuffle = 0; shuffle < (seed.length * 2); shuffle++)
            {
                const rand1 = Math.min((seed.length - 1), Math.floor(Math.random() * seed.length));
                const rand2 = Math.min((seed.length - 1), Math.floor(Math.random() * seed.length));
                
                [seed[rand1], seed[rand2]] = [seed[rand2], seed[rand1]];
            }

            // Prevent an id beginning with a number. That would only happen if you used the raw
            // seed as an id rather than appending it to a known string, but let's ensure this
            // anyway.
            if (seed[0].match(/[0-9]/)) {
                seed[0] = "b";
            }

            id = `shades-generated-kpAOerCd4-${seed.join("")}`;
        } while(document.getElementById(id));

        ll_assert(id, "Failed to generate a random shade id.");

        return id;
    }
}

darken_viewport.defaultArgs = {
    z: 100, // Must be high enough to cover all else on the page.
    opacity: 0.4,
    onClick: ()=>{},
}
