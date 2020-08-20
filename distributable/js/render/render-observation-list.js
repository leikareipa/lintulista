"use strict";

import { panic, panic_if_undefined } from "../assert.js";
import { ObservationList } from "../react-components/observation-list/ObservationList.js";
export function render_observation_list(backend) {
  panic_if_undefined(backend);
  const container = document.getElementById("observation-list");

  if (!container) {
    panic("Can't find the container to render the observation list into.");
    return;
  }

  const observationListElement = React.createElement(ObservationList, {
    backend
  });
  ReactDOM.unmountComponentAtNode(container);
  ReactDOM.render(observationListElement, container);
}