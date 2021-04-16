/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

import {tr} from "./translator.js";
import {ll_assert_native_type} from "./assert.js";
import {LL_Throwable} from "./throwable.js";

/// TODO.
export function ll_message_popup(message = "")
{
    ll_assert_native_type("string", message);
    popup(tr(message), {type:"action"});
    return;
}

/// TODO.
export function ll_error_popup__(errorMessage = "")
{
    ll_assert_native_type("string", errorMessage);
    popup(tr(errorMessage), {type:"error"});
    return;
}

// Takes in an Error object (e.g. from catch()) and, so far as it's relevant to Lintulista,
// presents its message to the user.
export function ll_error_popup(error = {})
{
    const errorMessage = (error.message || error.reason.message || "Unknown error");

    if (LL_Throwable.is_parent_of(error)) {
        console.error(`Lintulista: ${errorMessage}`);
    }
    else {
        console.log(`External error: ${errorMessage}`);
    }
}

/*
 * Most recent known filename: js/ui/notification.js
 *
 * 2019 Tarpeeksi Hyvae Soft /
 * RallySportED-js
 *
 */

"use strict";

// Opens a self-closing popup notification in the DOM.
function popup(string = "", args = {})
{
    ll_assert_native_type("string", string);
    ll_assert_native_type("object", args);

    args =
    {
        type: "warning", // | "info" | "error" | "fatal"
        timeoutMs: 5000,
        ...args
    };

    ll_assert_native_type("number", args.timeoutMs);
    ll_assert_native_type("string", args.type);

    const faIcon = (()=>
    {
        const meta = "fa-fw";

        switch (args.type)
        {
            case "action": return `${meta} fas fa-check`;
            case "error": return `${meta} fas fa-exclamation-triangle`;
            default: return `${meta} fas fa-comment`;
        }
    })();

    const popupElement = document.createElement("div");
    const iconElement = document.createElement("i");
    const textContainer = document.createElement("div");
    
    iconElement.classList.add(...(`icon-element ${faIcon}`.split(" ")));
    textContainer.classList.add("text-container");
    popupElement.classList.add("popup-notification",
                               "animation-popup-slide-in",
                               args.type);

    textContainer.innerHTML = `${args.type == "fatal"? "Fatal:" : ""}
                               ${string}`;

    popupElement.appendChild(iconElement);
    popupElement.appendChild(textContainer);
    popupElement.onclick = close_popup;

    const container = document.getElementById("popup-notifications-container");
    ll_assert_native_type(Element, container);
    container.appendChild(popupElement);

    const removalTimer = (args.timeoutMs <= 0)
                         ? false
                         : setTimeout(close_popup, args.timeoutMs);

    const publicInterface = Object.freeze({
        close: close_popup,
    });

    return publicInterface;

    function close_popup()
    {
        clearTimeout(removalTimer);
        popupElement.remove();

        return;
    }
}
