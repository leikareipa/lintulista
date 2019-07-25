/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 * Provides functions to create and manage shades - DOM elements filling the entire parent
 * container with a dark, partially see-through color.
 * 
 */

"use strict";

import {panic_if_undefined, error} from "./assert.js";

export function shades(args = {/*z, onClick, opacity, container*/})
{
    panic_if_undefined(args, args.container);

    args = {...shades.defaultArgs, ...args};

    const shadeId = random_id();

    if (!shadeId)
    {
        error("Failed to generate a valid DOM id for a shade element.");
    }

    const transitionDuration = 0.25;

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
                                 visibility: hidden;
                                 transition: visibility 0s, opacity ${transitionDuration}s linear;
                                 z-index: ${args.z};`

        args.container.appendChild(element);

        return element;
    })();

    const publicInterface = Object.freeze(
    {
        id: shadeId,

        put_on: (overrideArgs = {/*z, onClick, opacity*/})=>
        {
            return new Promise(resolve=>
            {
                if (!shadeId)
                {
                    resolve();
                    return;
                }

                shadeElement.style.zIndex = (overrideArgs.z || args.z);
                shadeElement.onclick = (overrideArgs.onClick || args.onClick);
                shadeElement.style.opacity = `${overrideArgs.opacity || args.opacity}`;
                shadeElement.style.visibility = "visible";
                
                // Use a timeout instead of a transition event listener to prevent a missing
                // transition from holding up the app.
                setTimeout(()=>
                {
                    resolve();
                }, (transitionDuration * 1000));
            });
        },

        pull_off: (args = {})=>
        {
            return new Promise(resolve=>
            {
                args = 
                {
                    ...{
                        removeWhenDone: false,
                    },
                    ...args,
                };

                if (!shadeId)
                {
                    resolve();
                    return;
                }

                shadeElement.style.opacity = "0";

                // Use a timeout instead of a transition event listener to prevent a missing
                // transition from holding up the app.
                setTimeout(()=>
                {
                    shadeElement.style.visibility = "hidden";

                    if (args.removeWhenDone)
                    {
                        shadeElement.remove();
                    }

                    resolve();
                }, (transitionDuration * 1000));
            });
        },
    });

    return publicInterface;

    // Generates a unique (pseudo-)random DOM id; otherwise returns null to indicate failure.
    function random_id()
    {
        let loops = 0;
        let seed = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._"];
        let id = null;
        
        do
        {
            if (++loops > 100000)
            {
                return null;
            }

            for (let shuffle = 0; shuffle < (seed.length * 2); shuffle++)
            {
                const rand1 = Math.min((seed.length - 1), Math.floor(Math.random() * seed.length));
                const rand2 = Math.min((seed.length - 1), Math.floor(Math.random() * seed.length));
                
                [seed[rand1], seed[rand2]] = [seed[rand2], seed[rand1]];
            }

            if (!seed[0].match(/[a-zA-Z]/))
            {
                seed[0] = "b";
            }

            id = `shades-generated-kpAOerCd4-${seed.join("")}`;
        } while(document.getElementById(id));

        return id;
    }
}

shades.defaultArgs =
{
    z: 100,
    opacity: 0.4,
    onClick: ()=>{},
}
