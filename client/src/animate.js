/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, panic, warn} from "./assert.js";

// A rudimentary wrapper for appending short CSS animations to DOM elements. The 'animation'
// parameter should provide as a string the name of the CSS animation to run (such that the
// actual CSS class name is `animation-${animation}`). The 'element' parameter gives the DOM
// element to apply the animation to. Returns a promise that resolves when the animation has
// finished.
export function animate(element, animation)
{
    panic_if_not_type("string", animation);
    panic_if_not_type("object", element);

    return new Promise(resolve=>
    {
        if (!element)
        {
            panic("Invalid element for animation.");
        }

        const animationClassName = `animation-${animation}`;

        if (!element.classList.contains(animationClassName))
        {
            element.classList.add(animationClassName);
            element.addEventListener("animationend", ()=>
            {
                element.classList.remove(animationClassName);
                resolve();
            });
        }
        else
        {
            warn("Trying to double queue an animation onto an element.");
            resolve();
        }
    });
}
