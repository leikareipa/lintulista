/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {translations} from "./translations.js";
import {private_error} from "./throwable.js";

// Returns a translation of the given string, or the original string if no
// translation was available.
export function tr(originalString = "",
                   dstLanguage = "fiFI")
{
    if (typeof originalString !== "string") {
        throw private_error("Invalid arguments.");
    }

    if (dstLanguage === "enEN") {
        return originalString;
    }

    const translation = (translations[originalString] || []);
    const translatedString = (translation[dstLanguage] || null);

    if (translatedString === null) {
        console.warn("Untranslated string:", originalString);
    }

    return (translatedString || originalString);
}
