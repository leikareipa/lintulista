"use strict";

import { panic_if_not_type } from "../../assert.js";
export function ObservationListFootnotes(props = {}) {
  ObservationListFootnotes.validate_props(props);
  const observationCountElement = !props.numObservationsInList ? React.createElement(React.Fragment, null, "Listassa ei viel\xE4 ole lajihavaintoja.") : React.createElement(React.Fragment, null, "Listassa on\xA0", React.createElement("span", {
    style: {
      fontWeight: "bold"
    }
  }, props.numObservationsInList), " laji", props.numObservationsInList !== 1 ? "a" : "", ".");
  const observationDownloadElement = !props.numObservationsInList ? React.createElement(React.Fragment, null) : React.createElement("span", {
    onClick: props.callbackDownloadList,
    style: {
      textDecoration: "underline",
      cursor: "pointer",
      fontVariant: "normal"
    }
  }, "Lataa CSV:n\xE4");
  return React.createElement("div", {
    className: "ObservationListFootnotes"
  }, React.createElement("div", {
    className: "observation-count"
  }, observationCountElement, "\xA0", observationDownloadElement));
}

ObservationListFootnotes.validate_props = function (props) {
  panic_if_not_type("object", props);
  panic_if_not_type("number", props.numObservationsInList);
  panic_if_not_type("function", props.callbackDownloadList);
  return;
};