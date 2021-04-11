/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {expect_true} from "./assert.js";
import {Bird} from "./bird.js";

/// Temporary.
const language = "fiFI";

// Represents an observation of a given bird at a given time.
export function Observation({bird = Bird,
                             day = 0,
                             month = 0,
                             year = 0})
{
    const isGhost = ((day <= 0) || (month <= 0) || (year <= 0));

    const publicInterface = Object.freeze({
        isGhost,
        bird,
        day,
        month,
        year,
    });
    
    return publicInterface;
}

Observation.date_string = function(observation = Observation)
{
    const monthNames = {
        fiFI: [
            "tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu",
            "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"
        ],
        enEN: [
            "January", "February", "March", "April", "May", "June", "July",
            "August", "September", "October", "November", "December"
        ],
    }

    const monthStrings = {
        fiFI: monthNames["fiFI"],
        enEN: monthNames["enEN"],
    };

    const monthString = (monthStrings[language] || monthStrings["fiFI"])[observation.month-1];

    const dateString = {
        fiFI: `${observation.day}. ${monthString}ta ${observation.year}`,
        enEN: `${observation.day} ${monthString} ${observation.year}`,
    };

    return (dateString[language] || dateString["fiFI"]);
}

Observation.clone = function(observation = Observation)
{
    return Observation({
        bird: Bird(observation.bird),
        day: observation.day,
        month: observation.month,
        year: observation.year,
        isGhost: observation.isGhost,
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
