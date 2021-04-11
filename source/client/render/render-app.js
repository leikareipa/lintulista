"use strict";

import {ObservationListLight} from "../react-components/observation-list/ObservationListLight.js";
import {BackendAccess} from "../backend-access.js";

const initialStoreState = {
    isLoggedIn: false,
    is100LajiaMode: false,
    observations: [],
    knownBirds: [],
};

export async function start_app(listKey, container)
{
    const store = Redux.createStore(reducer);
    const backend = await BackendAccess(listKey, store);

    store.subscribe(()=>console.log(store.getState()));

    ReactDOM.render(
        <ReactRedux.Provider
            store={store}>

            <ObservationListLight
                backend={backend}
            />

        </ReactRedux.Provider>,
    container);
}

function reducer(state = initialStoreState, action)
{
    switch (action.type)
    {
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
