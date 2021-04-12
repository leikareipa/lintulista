/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ObservationList} from "../react-components/observation-list/ObservationList.js";
import {BackendAccess} from "../backend-access.js";
import {store} from "../redux-store.js";

export async function start_app(listKey, container)
{
    const backend = await BackendAccess(listKey, store);

    //store.subscribe(()=>console.log(store.getState()));

    ReactDOM.render(
        <ReactRedux.Provider
            store={store}>

            <ObservationList
                backend={backend}
            />

        </ReactRedux.Provider>,
        container);
}
