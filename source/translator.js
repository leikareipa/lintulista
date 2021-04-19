/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {translations} from "./translations.js";
import {ll_assert_native_type} from "./assert.js";
import {store} from "./redux-store.js";
import {value2roman} from "./value-to-roman.js";

// Returns a translation of the given string, or the original string if no
// translation was available.
export function tr(originalString = "",
                   ...values)
{
    ll_assert_native_type("string", originalString);
    
    const dstLanguage = (store.getState().language || "fiFI");

    let translatedString = (()=>{
        if (dstLanguage === "enEN") {
            return originalString;
        }

        const translationEntry = (translations[originalString] || []);
        let translatedString = (translationEntry[dstLanguage] || null);

        if (translatedString === null) {
            console.warn("Untranslated string:", originalString);
            translatedString = originalString;
        }

        return translatedString;
    })();

    // Replace %1, %2, ..., in the string with their corresponding
    // values.
    values.forEach((value, idx)=>{
        if ((typeof value === "number") &&
            (dstLanguage === "lat"))
        {
            value = value2roman(value);
        }

        translatedString = translatedString.replace(new RegExp(`%${idx+1}`, "g"), value);
    })

    return translatedString;
}
