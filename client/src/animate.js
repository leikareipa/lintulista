/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, panic} from "./assert.js";

// A rudimentary wrapper for appending short CSS animations to DOM elements. The 'animation'
// parameter should provide as a string the name of the CSS animation to run (such that the
// actual CSS class name is `animation-${animation}`). The 'element' parameter gives the DOM
// element to apply the animation to. An optional callback function can be provided - it will
// be called when the animation finishes.
export function animate(element, animation, callback)
{
    panic_if_not_type("string", animation);
    panic_if_not_type("object", element);

    if (!element)
    {
        panic("Invalid element for animation.");
    }

    const animationClassName = `animation-${animation}`;

    element.classList.add(animationClassName);
    element.addEventListener("animationend", ()=>
    {
        element.classList.remove(animationClassName);
        callback();
    });

    return;
}
