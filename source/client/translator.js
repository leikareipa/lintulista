/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {translations} from "./translations.js";
import {panic_if_not_type} from "./assert.js";

const dstLanguage = "fiFI";

// Returns a translation of the given string, or the original string if no
// translation was available.
export function tr(originalString = "",
                   ...values)
{
    panic_if_not_type("string", originalString);

    let translatedString = (()=>{
        if (dstLanguage === "enEN") {
            return originalString;
        }

        const translationEntry = (translations[originalString] || []);
        const translatedString = (translationEntry[dstLanguage] || null);

        if (translatedString === null) {
            console.warn("Untranslated string:", originalString);
        }

        return translatedString;
    })();

    // Replace %1, %2, ..., in the string with their corresponding
    // values.
    values.forEach((value, idx)=>{
        translatedString = translatedString.replace(new RegExp(`%${idx+1}`, "g"), value);
    })

    return translatedString;
}
