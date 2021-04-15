/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "./assert.js";
import {LL_BaseType} from "./base-type.js";
import {ll_error_popup__} from "./message-popup.js";

export const LL_Action = function(props = {})
{
    ll_assert_native_type("object", props);

    // Fill in optional properties.
    props = {
        ...props,
        on_error: (props.hasOwnProperty("on_error")? props.on_error : async()=>{}),
        finally: (props.hasOwnProperty("finally")? props.finally : async()=>{}),
    };
    
    ll_assert_native_type("function", props.act,
                                      props.on_error,
                                      props.finally);

    const publicInterface = Object.freeze({
        async: async function(args = {}, noCatch = false)
        {
            try {
                return await props.act(args);
            }
            catch (error)
            {
                if (noCatch) {
                    console.warn("Silent catch in action", error);
                    throw error;
                }
                else {
                    await props.on_error(args);
                    console.warn("Catch in action", error);
                    ll_error_popup__(props.failMessage);
                }

                return false;
            }
            finally {
                await props.finally(args);
            }
        },

        ...LL_BaseType(LL_Action),
    });

    return publicInterface;
}
