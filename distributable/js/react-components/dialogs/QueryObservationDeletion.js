"use strict";

import { panic_if_undefined, panic_if_not_type } from "../../assert.js";
import { BirdThumbnail } from "../misc/BirdThumbnail.js";
import { Dialog } from "./Dialog.js";
export function QueryObservationDeletion(props = {}) {
  QueryObservationDeletion.validateProps(props);

  let setButtonEnabled = (button, state) => {};

  return React.createElement(Dialog, {
    component: "QueryObservationDeletion",
    title: "Poistetaanko havainto?",
    rejectButtonText: "Peruuta",
    acceptButtonText: "Poista",
    acceptButtonEnabled: false,
    callbackSetButtonEnabled: callback => {
      setButtonEnabled = callback;
    },
    enterAccepts: true,
    onDialogAccept: accept,
    onDialogReject: reject
  }, React.createElement(BirdThumbnail, {
    bird: props.observation.bird,
    useLazyLoading: false
  }), React.createElement("div", {
    className: "fields"
  }, React.createElement("div", {
    className: "bird-name"
  }, props.observation.bird.species, ":"), React.createElement("input", {
    className: "list-id",
    type: "text",
    onChange: update_on_input,
    spellCheck: "false",
    autoFocus: true
  }), React.createElement("div", {
    className: "instruction"
  }, "Kirjoita \"", props.observation.bird.species, "\" jatkaaksesi")));

  function update_on_input(inputEvent) {
    if (inputEvent.target.value.toLowerCase() === props.observation.bird.species.toLowerCase()) {
      setButtonEnabled("accept", true);
    } else {
      setButtonEnabled("accept", false);
    }
  }

  function accept() {
    props.onDialogAccept();
  }

  function reject() {
    props.onDialogReject();
  }
}

QueryObservationDeletion.validateProps = function (props) {
  panic_if_undefined(props, props.observation);
  panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);
  return;
};