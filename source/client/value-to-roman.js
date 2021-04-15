/*
 * 2021 Tarpeeksi Hyvae Soft
 *
 * Software: Lintulista
 * 
 */

"use strict";

const numerals = Object.freeze([
    {1:"I", 2:"II", 3:"III", 4:"IV", 5:"V", 6:"VI", 7:"VII", 8:"VIII", 9:"IX"},     // 1
    {1:"X", 2:"XX", 3:"XXX", 4:"XL", 5:"L", 6:"LX", 7:"LXX", 8:"LXXX", 9:"XC"},     // 10
    {1:"C", 2:"CC", 3:"CCC", 4:"CD", 5:"D", 6:"DC", 7:"DCC", 8:"DCCC", 9:"CM"},     // 100
    {1:"M", 2:"MM", 3:"MMM", 4:"MMMM", 5:"V", 6:"VM", 7:"VMM", 8:"VMMM", 9:"MX"}    // 1000
]);

// Returns a string representing the given value (range [1,9999]) in Roman numerals.
export function value2roman(value = 1)
{
    if ((value < 1) ||
        (value > 9999))
    {
        console.error(`The value ${value} is out of range for conversion to roman numerals.`);
        return value;
    }

    let numeralRepresentation = [];
    const valueString = value.toString();

    for (let i = 0; i < valueString.length; i++)
    {
        const chr = valueString[valueString.length - i - 1];
        const numeralFamily = numerals[i];

        if (chr > 0) {
            numeralRepresentation.unshift(numeralFamily[chr]);
        }
    }

    return numeralRepresentation.join("");
}
