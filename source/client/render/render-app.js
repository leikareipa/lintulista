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
import {tr} from "../translator.js";

export async function start_app(listKey,
                                container,
                                startupOptions = {})
{
    set_startup_options(startupOptions);
    start_loading_spinner(container);

    try
    {
        ll_assert_native_type("string", listKey);
        ll_assert_native_type("object", startupOptions);

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
    catch (error) {
        throw error;
    }
    finally {
        stop_loading_spinner(container);
    }

    return;
}

function start_loading_spinner(container)
{
    document.querySelector("#lintulista > header").classList.add("glide");

    ReactDOM.render(<div className="loading-tag">
        {tr("Loading Lintulista. Just a moment...")}
    </div>,
    container);

    return;
}

function stop_loading_spinner(container)
{
    document.querySelector("#lintulista").classList.add("app-running");
    document.querySelector("#lintulista > header").classList.add("paused");

    return;
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