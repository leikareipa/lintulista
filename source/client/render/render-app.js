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
import {ll_assert_native_type} from "../assert.js";

export async function start_app(listKey,
                                container,
                                startupOptions = {})
{
    ll_assert_native_type("string", listKey);
    ll_assert_native_type("object", startupOptions);

    set_startup_options(startupOptions);

    const backend = await BackendAccess(listKey, store);

    ReactDOM.render(
        <ReactRedux.Provider
            store={store}>

            <ObservationList
                backend={backend}
            />

        </ReactRedux.Provider>,
        container);
}

function set_startup_options(options = {})
{
    ll_assert_native_type("object", options);

    if (options.hasOwnProperty("language")) {
        store.dispatch({type:"set-language", language:options.language});
    }

    if (options.hasOwnProperty("is100LajiaMode")) {
        store.dispatch({type:"set-100-lajia-mode", isEnabled:options.is100LajiaMode});
    }

    return;
}