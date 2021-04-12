/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

const initialState = {
    isLoggedIn: false,
    is100LajiaMode: false,
    observations: [],
    knownBirds: [],
    language: "fiFI",
};

export const store = Redux.createStore(reducer);

function reducer(state = initialState, action)
{
    switch (action.type)
    {
        case "set-language":
        {
            return {
                ...state,
                language: action.language,
            };
        }
        case "set-100-lajia-mode":
        {
            return {
                ...state,
                is100LajiaMode: action.isEnabled,
            };
        }
        case "set-logged-in":
        {
            return {
                ...state,
                isLoggedIn: action.isLoggedIn,
            };
        }
        case "set-observations":
        {
            return {
                ...state,
                observations: action.observations,
            };
        }
        case "set-known-birds":
        {
            return {
                ...state,
                knownBirds: action.knownBirds,
            };
        }
        case "add-observation":
        {
            const newObservationsList = [
                ...state.observations,
                action.observation,
            ];

            return {
                ...state,
                observations: newObservationsList,
            };
        }
        case "delete-observation":
        {
            const observation = action.observation;
            const newObservationsList = state.observations.filter(o=>o.species !== observation.species);

            return {
                ...state,
                observations: newObservationsList,
            };
        }
        default: return state;
    }
}
