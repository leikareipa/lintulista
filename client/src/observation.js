/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {warn, panic_if_undefined} from "./assert.js";

export function observation(args = {})
{
    panic_if_undefined(args.date, args.bird);

    if (!(args.date instanceof Date))
    {
        warn("Invalid date for the observation.");
        return false;
    }

    const timeString = String(args.date.getHours()).padStart(2, "0") + ":" +
                       String(args.date.getMinutes()).padStart(2, "0");

    const dateString = args.date.getDate() + ". " +
                       (new Intl.DateTimeFormat("fi-FI", {month: "long"}).format(args.date) + "ta") + " " +
                       args.date.getFullYear();

    const publicInterface = Object.freeze(
    {
        bird: args.bird,
        date: args.date,
        place: args.place,
        unixTimestamp: Math.round(args.date.getTime() / 1000),
        dateString,
        timeString,
    });
    
    return publicInterface;
}
