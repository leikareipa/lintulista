/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "./assert.js";
import {LL_BaseType} from "./base-type.js";
import {ll_error_popup__,
        ll_message_popup} from "./message-popup.js";

// An action is a combination of instructions aimed at producing some effect, like
// querying the user for their password and then logging them in. The LL_Action
// object provides an interface for setting up and executing actions these.
//
// Each LL_Action object is composed of an async actor function, act(), and a few
// supporting control functions. The execution of the actor function is wrapped in a
// try/catch block such that if the actor function throws, the on_error() function
// will be called; and the finally() function is called in the manner expected of
// try/catch
//
// The 'props' object allows the caller to define the action's functions, as well
// as messages to be displayed to the user when the action succeeds or fails.
//
// SAMPLE USAGE:
//
//   const action = LL_Action({
//       failMessage: "The action failed",
//       successMessage: "The action succeeded", // Optional.
//       act: async function({variable2, variable2})
//       {
//           // Execute the action's functions here. Failures should be made to throw.
//           // If the function returns !undefined, its successMessage will be displayed.
//       },
//       on_error: async function()
//       {
//           // Optional, to be executed if act() throws.
//           // This function will receive the arguments passed to act().
//       }
//       finally: async function()
//       {
//           // Optional, to be executed when act() finishes (whether thrown or not).
//           // This function will receive the arguments passed to act().
//       }
//   };
//
//   // Data will receive the return value of act() or null if act() throws.
//   const data = await action.async({variable2, variable2});
//
export const LL_Action = function(props = {})
{
    ll_assert_native_type("object", props);

    // Fill in optional properties.
    props = {
        ...props,
        on_error: (typeof props.on_error === "function")? props.on_error : async()=>{},
        finally: (typeof props.finally === "function")? props.finally : async()=>{},
        successMessage: (typeof props.successMessage === "string")? props.successMessage : undefined,
    };
    
    ll_assert_native_type("function", props.act,
                                      props.on_error,
                                      props.finally);
    ll_assert_native_type("string", props.failMessage);

    const publicInterface = Object.freeze({
        async_nocatch: async function(args = {})
        {
            return this.async(args, true);
        },

        async: async function(args = {}, noCatch = false)
        {
            try {
                const actionResult = await props.act(args);

                if ((actionResult !== undefined) &&
                    (typeof props.successMessage === "string"))
                {
                    ll_message_popup(props.successMessage);
                }

                return actionResult;
            }
            catch (error)
            {
                if (noCatch) {
                    console.warn("Silently caught in Action:", error);
                    throw error;
                }
                else {
                    await props.on_error(args);
                    console.warn("Caught in Action:", error);
                    ll_error_popup__(props.failMessage);
                }

                return null;
            }
            finally {
                await props.finally(args);
            }
        },

        ...LL_BaseType(LL_Action),
    });

    return publicInterface;
}
