/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ObservationList} from "./react-components/observation-list/ObservationList.js";
import {LL_Backend} from "./backend.js";
import {ll_assert_native_type} from "./assert.js";
import {LL_Action} from "./action.js";
import {tr} from "./translator.js";
import {store} from "./redux-store.js";

export const lla_start_lintulista = LL_Action({
    failMessage: "Failed to start Lintulista",
    act: async({listKey})=>
    {
        const container = document.querySelector("#lintulista #app-container");

        ll_assert_native_type("string", listKey);
        ll_assert_native_type(Element, container);

        // Start a loading spinner to let the user know we might take a while.
        {
            document.querySelector("#lintulista > header").classList.add("glide");

            ReactDOM.render(<div className="startup-loading-spinner">
                {tr("Loading Lintulista. Just a moment...")}
            </div>,
            container);
        }

        const backend = await LL_Backend(listKey, store);

        ReactDOM.render(<ReactRedux.Provider
                            store={store}>

                            <ObservationList
                                backend={backend}
                            />

                        </ReactRedux.Provider>,
                        container);

        document.querySelector("#lintulista").classList.add("app-running");
    },
    on_error: async({container})=>
    {
        // Remove the loading spinner.
        container.innerHTML = "";
    },
    finally: async()=>
    {
        document.querySelector("#lintulista > header").classList.add("paused");
    }
});
