"use strict";

import { panic_if_undefined, panic_if_not_type } from "../../assert.js";
import { BirdThumbnail } from "../misc/BirdThumbnail.js";
import { Dialog } from "./Dialog.js";
export function QueryLoginCredentials(props = {}) {
  QueryLoginCredentials.validateProps(props);
  const usernameRef = React.useRef();
  let password = "";
  let username = "";

  let setButtonEnabled = (button, state) => {};

  return React.createElement(Dialog, {
    component: "QueryLoginCredentials",
    title: "Kirjaudu sis\xE4\xE4n",
    rejectButtonText: "Peruuta",
    acceptButtonText: "Kirjaudu",
    acceptButtonWaitingText: "Kirjaudutaan...",
    acceptButtonEnabled: true,
    callbackSetButtonEnabled: callback => {
      setButtonEnabled = callback;
    },
    enterAccepts: true,
    disableTabKey: false,
    onDialogAccept: accept,
    onDialogReject: props.onDialogReject,
    onKeyDown: control_tab_presses
  }, React.createElement("form", {
    className: "fields"
  }, React.createElement("div", {
    className: "username"
  }, "K\xE4ytt\xE4j\xE4nimi"), React.createElement("input", {
    ref: usernameRef,
    className: "username",
    type: "text",
    onChange: event => {
      username = event.target.value;
    },
    spellCheck: "false",
    autoComplete: "username",
    autoFocus: true
  }), React.createElement("div", {
    className: "password"
  }, "Salasana"), React.createElement("input", {
    className: "password",
    type: "password",
    onKeyDown: control_tab_presses,
    onChange: event => {
      password = event.target.value;
    },
    spellCheck: "false",
    autoComplete: "current-password"
  }), React.createElement("div", {
    className: "instruction"
  }, "Kirjautuminen on voimassa, kunnes kirjaudut ulos tai lataat sivun uudelleen; kuitenkin korkeintaan kuutisen tuntia.")));

  function control_tab_presses(keyDownEvent) {
    if (keyDownEvent.code === "Tab") {
      usernameRef.current.focus();
      keyDownEvent.preventDefault();
    }

    return;
  }

  function accept() {
    props.onDialogAccept({
      username,
      password
    });
    return;
  }
}

QueryLoginCredentials.validateProps = function (props) {
  panic_if_not_type("object", props, props.randomBird);
  panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);
  return;
};