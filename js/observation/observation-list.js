/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {observation} from "./observation.js";
import {warn} from "../assert.js";

export function observation_list(knownBirds)
{
    if (typeof knownBirds === "undefined")
    {
        warn("No list of known birds provided.");
        knownBirds = [];
    }

    const list = [];

    const publicInterface =
    {
        observations: [],

        add_observation: function(birdName, observationDate)
        {
            const birdIdx = knownBirds.map(bird=>bird.name.toLowerCase()).indexOf(birdName.toLowerCase());

            if (birdIdx === -1)
            {
                warn(`The bird "${birdName}" is unknown and can't be added as an observation.`);
                return false;
            }

            const currentDate = new Date();
            const newObservation = observation(knownBirds[birdIdx], observationDate, currentDate)

            if (!newObservation)
            {
                warn("Failed to add a new observation.");
                return false;
            }

            list.push(newObservation);
            this.observations = list.slice();

            return true;
        }
    };
    
    return publicInterface;
}
