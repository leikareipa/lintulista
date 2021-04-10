"use strict";

import { error_popup } from "./message-popup.js";
import { panic_if_undefined, is_function } from "./assert.js";
import { darken_viewport } from "./darken_viewport.js";
import { is_public_ll_error } from "./throwable.js";
export function open_modal_dialog(dialog, parameters = {}) {
  panic_if_undefined(dialog);
  const dialogContainer = document.createElement("div");
  let shades = null;
  return (async () => {
    if (!dialogContainer) {
      panic("Can't find the container to render the observation list into.");
      return;
    }

    shades = await darken_viewport({
      z: 110,
      opacity: 0.5
    });
    const dialogElement = React.createElement(dialog, { ...parameters,
      onDialogAccept: async returnData => {
        await run_callback(parameters.onAccept, returnData);
        close_this_dialog();
        return returnData;
      },
      onDialogReject: async () => {
        await run_callback(parameters.onReject);
        close_this_dialog();
        return;
      }
    });
    document.body.appendChild(dialogContainer);
    ReactDOM.render(dialogElement, dialogContainer);
  })();

  async function run_callback(fn = async function () {}, args = {}) {
    if (is_function(fn)) {
      try {
        await fn(args);
      } catch (error) {
        if (is_public_ll_error(error)) {
          error_popup(error.message);
        }
      }
    }

    return;
  }

  async function close_this_dialog() {
    if (dialogContainer.childElementCount) {
      ReactDOM.unmountComponentAtNode(dialogContainer);
    }

    dialogContainer.remove();

    if (is_function(parameters.onClose)) {
      parameters.onClose();
    }

    await shades.remove();
  }
}