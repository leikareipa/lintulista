/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, expect_true} from "./assert.js";
import {Bird} from "./bird.js";

/// Temporary.
const language = "fiFI";

// Represents an observation of a given bird at a given time.
export function Observation(args = {})
{
    panic_if_undefined(args.bird);

    const isGhost = !(args.date instanceof Date);

    if (isGhost) {
        args.date = new Date(0);
    }

    const timeString = String(args.date.getHours()).padStart(2, "0") + ":" +
                       String(args.date.getMinutes()).padStart(2, "0");

    const monthString = {
        fiFI: new Intl.DateTimeFormat("fi-FI", {month: "long"}).format(args.date),
        enEN: new Intl.DateTimeFormat("en-EN", {month: "long"}).format(args.date),
    };

    const dateString = {
        fiFI: `${args.date.getDate()}. ${monthString["fiFI"]}ta ${args.date.getFullYear()}`,
        enEN: `${args.date.getDate()} ${monthString["enEN"]} ${args.date.getFullYear()}`,
    };

    const publicInterface = Object.freeze({
        isGhost,
        bird: args.bird,
        date: args.date,
        unixTimestamp: Math.round(args.date.getTime() / 1000),
        timeString,

        get dateString() {
            return (dateString[language] || dateString["fiFI"]);
        }
    });
    
    return publicInterface;
}

Observation.clone = function(observation = Observation)
{
    return Observation({
        bird: Bird(observation.bird),
        date: observation.date,
    });
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
