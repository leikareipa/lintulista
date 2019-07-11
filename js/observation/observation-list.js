/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {observation} from "./observation.js";
import {warn} from "../assert.js";

export function observation_list()
{
    const list = [];

    const publicInterface =
    {
        observations: [],

        add_observation: function(birdName, observationDate)
        {
            const currentDate = new Date();
            const newObservation = observation(birdName, observationDate, currentDate)

            if (!newObservation || !newObservation.bird)
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
