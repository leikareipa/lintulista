/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {warn, panic_if_undefined, expect_true} from "./assert.js";
import {Bird} from "./bird.js";

// Represents an observation of a given bird at a given time.
export function Observation(args = {})
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
        unixTimestamp: Math.round(args.date.getTime() / 1000),
        dateString,
        timeString,
    });
    
    return publicInterface;
}

// Runs basic tests on this unit. Returns true if all tests passed; false otherwise.
Observation.test = ()=>
{
    const dateInMilliseconds = 1567214553700
    const date = new Date(dateInMilliseconds);
    const bird = Bird({species:"Test1", family:"Test2", order:"Test3", thumbnailUrl:"Test4"});
    const observation = Observation({bird, date});

    const expectedUnixTimestamp = Math.round(date.getTime() / 1000);
    const expectedTimeString = String(date.getHours()).padStart(2, "0") + ":" +
                               String(date.getMinutes()).padStart(2, "0");
    const expectedDateString = date.getDate() + ". " +
                               (new Intl.DateTimeFormat("fi-FI", {month: "long"}).format(date) + "ta") + " " +
                               date.getFullYear();

    return expect_true([()=>(Object.isFrozen(observation)),
                        ()=>(observation.bird.species === "Test1"),
                        ()=>(observation.bird.family === "Test2"),
                        ()=>(observation.bird.order === "Test3"),
                        ()=>(observation.bird.thumbnailUrl === "Test4"),
                        ()=>(observation.date.getTime() === dateInMilliseconds),
                        ()=>(observation.unixTimestamp === expectedUnixTimestamp),
                        ()=>(observation.dateString === expectedDateString),
                        ()=>(observation.timeString === expectedTimeString)]);
}
