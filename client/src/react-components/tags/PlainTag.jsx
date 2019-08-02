/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";

// Displays a plain tag with the given text.
//
// The text to render in the tag is to be provided via props.text. Note that only the
// characters a-z, A-Z, and 0-9 are allowed.
//
// For styling with CSS, the tag's class list will include the tag's text, such that the
// text is first converted into lowercase and then any character not matching a-z0-9 is
// converted into a dash character. So e.g. props.text = "Hello there" will generate the
// class list "PlainTag hello-there".
//
export function PlainTag(props = {})
{
    PlainTag.validate_props(props);

    const cssTagName = props.text.toLowerCase().replace(/[^a-z0-9]/g, "-");

    /// TODO: Handle replacing characters like ä with a etc.
    return <div className={`PlainTag ${cssTagName}`}>
               {props.text}
           </div>
}

PlainTag.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("string", props.text);

    return;
}
