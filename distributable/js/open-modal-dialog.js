"use strict";

import { panic_if_undefined, is_function } from "./assert.js";
import { darken_viewport } from "./darken_viewport.js";
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
        if (is_function(parameters.onAccept)) {
          await parameters.onAccept(returnData);
        }

        close_this_dialog();
        return returnData;
      },
      onDialogReject: async () => {
        if (is_function(parameters.onReject)) {
          await parameters.onReject();
        }

        close_this_dialog();
        return null;
      }
    });
    document.body.appendChild(dialogContainer);
    ReactDOM.render(dialogElement, dialogContainer);
  })();

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