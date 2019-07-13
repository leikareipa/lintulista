/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {observation} from "./observation.js";
import {warn, panic_if_undefined} from "../assert.js";

export function observation_list(knownBirds)
{
    panic_if_undefined(knownBirds);

    const knownBirdNames = Object.freeze(knownBirds.map(bird=>bird.name.toLowerCase()));

    const observationList = [/*observation(), observation(), ...*/];

    const publicInterface =
    {
        observations: Object.freeze([]),

        add_observation: function(birdName, observationDate)
        {
            // If this bird already exists in the list.
            if (this.observations.map(obs=>obs.bird.name.toLowerCase()).indexOf(birdName.toLowerCase()) !== -1)
            {
                return true;
            }

            const birdIdx = knownBirdNames.indexOf(birdName.toLowerCase());

            if (birdIdx === -1)
            {
                warn(`The bird "${birdName}" is unknown and can't be added as an observation.`);
                return false;
            }

            const newObservation = observation(
            {
                bird: knownBirds[birdIdx],
                date: new Date(),
            });

            if (!newObservation)
            {
                warn("Failed to add a new observation.");
                return false;
            }

            observationList.push(newObservation);
            this.observations = Object.freeze(observationList.slice());

            return true;
        }
    };
    
    return publicInterface;
}
