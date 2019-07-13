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

        // Returns true if the list contains one or more observations of the given type
        // of bird.
        contains: function(birdName)
        {
            return Boolean(this.observations.map(obs=>obs.bird.name.toLowerCase()).indexOf(birdName.toLowerCase()) !== -1);
        },

        // Returns the first observation corresponding to the given type of bird.
        observation: function(birdName)
        {
            const observationIdx = this.observations.map(obs=>obs.bird.name.toLowerCase()).indexOf(birdName.toLowerCase());

            if ((observationIdx === -1) ||
                (!this.contains(birdName)))
            {
                return null;
            }

            return this.observations[observationIdx];
        },

        // Returns the date of the first observation of the given type of bird.
        date: function(birdName)
        {
            const observation = this.observation(birdName);

            return (observation? observation.date : null);
        },

        add_observation: function(birdName, observationDate)
        {
            // Don't allow duplicate observations of the same kind of bird.
            if (this.contains(birdName))
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
                date: observationDate,
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
