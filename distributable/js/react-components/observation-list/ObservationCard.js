"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { BirdThumbnail } from "../misc/BirdThumbnail.js";
import { Observation } from "../../observation.js";
import { Bird } from "../../bird.js";
export function ObservationCard(props = {}) {
  ObservationCard.validate_props(props);
  return React.createElement("div", {
    className: `ObservationCard${props.isGhost ? "Ghost" : ""}`
  }, props.isGhost ? React.createElement("div", {
    className: "BirdThumbnail"
  }) : React.createElement(BirdThumbnail, {
    bird: props.observation.bird
  }), React.createElement("div", {
    className: "observation-info"
  }, React.createElement("div", {
    className: "bird-name"
  }, props.observation.bird.species), React.createElement("div", {
    className: "date"
  }, props.isGhost ? "100 Lajia -haaste" : props.observation.dateString)));
}
ObservationCard.defaultProps = {
  isGhost: false
};

ObservationCard.validate_props = function (props) {
  panic_if_not_type("object", props, props.observation);
  panic_if_not_type("boolean", props.isGhost);
  return;
};

ObservationCard.test = () => {
  let container = {
    remove: () => {}
  };
  const bird = Bird({
    species: "Naakka",
    family: "",
    order: ""
  });

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(ObservationCard, {
        observation: Observation({
          bird,
          date: new Date(0)
        }),
        isGhost: false
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.querySelector(".ObservationCard") !== null, () => container.querySelector(".BirdThumbnail") !== null, () => container.querySelector(".observation-info") !== null, () => container.querySelector(".observation-info > .bird-name") !== null, () => container.querySelector(".observation-info > .bird-name").textContent === bird.species, () => container.querySelector(".observation-info > .date") !== null, () => container.querySelector(".observation-info > .date").textContent === "1. tammikuuta 1970"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(ObservationCard, {
        observation: Observation({
          bird,
          date: new Date(0)
        }),
        isGhost: true
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.querySelector(".ObservationCardGhost") !== null, () => container.querySelector(".BirdThumbnail") !== null, () => container.querySelector(".observation-info") !== null, () => container.querySelector(".observation-info > .bird-name") !== null, () => container.querySelector(".observation-info > .bird-name").textContent === bird.species, () => container.querySelector(".observation-info > .date") !== null, () => container.querySelector(".observation-info > .date").textContent === "100 Lajia -haaste"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};