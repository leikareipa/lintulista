/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

let appHasCrashed = false;

// Fully halts execution of the Lintulista app and displays a bluescreen error.
export function ll_crash_app(error)
{
    // Avoid an infinite loop.
    if (appHasCrashed) {
        return;
    }
    else {
        appHasCrashed = true;
    }

    let errorMessage = "Unknown error";

    if (typeof error === "string") {
        errorMessage = error;
    }
    else if ((typeof error === "object") &&
             (typeof error.message === "string")) {
        errorMessage = error.message;
    }
    else if ((typeof error === "object") &&
             (typeof error.reason === "object") &&
             (typeof error.reason.message === "string")) {
        errorMessage = error.reason.message
    }

    const appElement = document.getElementById("lintulista");
    const bluescreenElement = document.getElementById("blue-screen");
    const errorMessageElement = bluescreenElement.querySelector(".error-description");

    // Normally we'd assert to make sure these elements exist, but since the
    // app is already in a crashed state, it wouldn't be able to handle the
    // assertions.
    if (appElement &&
        bluescreenElement &&
        errorMessageElement)
    {
        appElement.remove();
        errorMessageElement.innerHTML = errorMessage;
        bluescreenElement.style.display = "flex";
    }

    return;
}
