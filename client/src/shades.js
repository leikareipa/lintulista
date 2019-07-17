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

    // Insert the shade into the DOM. Note that by default, it's not yet displayed.
    const shadeElement = (()=>
    {
        const element = document.createElement("div");

        element.id = shadeId;
        element.onclick = args.onClick;
        element.style.cssText = `background-color: rgba(0, 0, 0, ${args.opacity});
                                 position: fixed;
                                 top: 0;
                                 left: 0;
                                 width: 100%;
                                 height: 100%;
                                 opacity: 0;
                                 visibility: hidden;
                                 transition: visibility 0s, opacity 0.3s linear;
                                 z-index: ${args.z};`

        args.container.appendChild(element);

        return element;
    })();

    const publicInterface = Object.freeze(
    {
        id: shadeId,

        put_on: ()=>
        {
            if (!shadeId)
            {
                return;
            }

            shadeElement.style.visibility = "visible";
            shadeElement.style.opacity = "1";
        },

        pull_off: (args = {})=>
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
                return;
            }

            shadeElement.style.opacity = "0";
            shadeElement.addEventListener("transitionend", ()=>
            {
                shadeElement.style.visibility = "hidden";

                if (args.removeWhenDone)
                {
                    shadeElement.remove();
                }
            }, {once:true});
        },
    });

    return publicInterface;

    // Generates a unique (pseudo-)random DOM id; otherwise returns null to indicate failure.
    function random_id()
    {
        let loops = 0;
        let seed = [..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._".repeat(2)];
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
