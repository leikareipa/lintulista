/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {expect_true,
        panic_if_not_type} from "./assert.js";
import {LL_BaseType} from "./base-type.js";

/// Temporary.
const language = "fiFI";

export const LL_Observation = function({species, day, month, year})
{
    panic_if_not_type("string", species);

    return Object.freeze({
        isGhost: (!day || !month || !year),
        species,
        day,
        month,
        year,

        ...LL_BaseType(LL_Observation)
    });
};

LL_Observation.is_parent_of = function(candidate)
{
    return ((LL_BaseType.type_of(candidate) === LL_Observation) &&
            candidate.hasOwnProperty("isGhost") &&
            candidate.hasOwnProperty("day") &&
            candidate.hasOwnProperty("month") &&
            candidate.hasOwnProperty("year"));
}

// Returns a language-formatted date string representing the date of the given observation.
LL_Observation.date_string = function(observation = LL_Observation)
{
    /// TODO: Validate arguments.

    if (observation.isGhost ||
        (observation.day === undefined) ||
        (observation.month === undefined) ||
        (observation.year === undefined))
    {
        return "";
    }

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
};

LL_Observation.clone = function(observation = LL_Observation)
{
    /// TODO: Validate arguments.
    
    return LL_Observation(observation);
}

// Runs basic tests on this unit. Returns true if all tests passed; false otherwise.
LL_Observation.test = ()=>
{
    const dateInMilliseconds = 1567214553700
    const date = new Date(dateInMilliseconds);
    const bird = Bird({species:"Test1", family:"Test2", order:"Test3", thumbnailUrl:"Test4"});
    const observation = LL_Observation({bird, date});

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
