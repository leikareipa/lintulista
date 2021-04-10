"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { AsyncIconButton } from "../buttons/AsyncIconButton.js";
import { BirdThumbnail } from "../misc/BirdThumbnail.js";
import { Observation } from "../../observation.js";
import { Bird } from "../../bird.js";
export function BirdSearchResult(props = {}) {
  BirdSearchResult.validate_props(props);

  const addAndRemoveButton = (() => {
    if (!props.userHasEditRights) {
      return React.createElement(React.Fragment, null);
    }

    if (!props.observation) {
      return React.createElement(AsyncIconButton, {
        icon: "fas fa-plus",
        title: `Lisää ${props.bird.species} listaan`,
        titleWhenClicked: "Lis\xE4t\xE4\xE4n listaan...",
        task: () => props.callbackAddObservation(props.bird)
      });
    } else {
      return React.createElement(AsyncIconButton, {
        icon: "fas fa-eraser",
        title: `Poista ${props.bird.species} listasta`,
        titleWhenClicked: "Poistetaan listasta...",
        task: () => props.callbackRemoveObservation(props.bird)
      });
    }
  })();

  const dateElement = (() => {
    if (props.observation) {
      if (props.userHasEditRights) {
        return React.createElement("span", {
          className: "edit-date",
          onClick: () => props.callbackChangeObservationDate(props.bird)
        }, props.observation.dateString);
      } else {
        return React.createElement(React.Fragment, null, props.observation.dateString);
      }
    } else {
      return React.createElement(React.Fragment, null, "Ei havaintoa");
    }
  })();

  return React.createElement("div", {
    className: `BirdSearchResult ${!props.observation ? "not-previously-observed" : ""}`.trim()
  }, React.createElement(BirdThumbnail, {
    bird: props.bird,
    useLazyLoading: false
  }), React.createElement("div", {
    className: "card"
  }, React.createElement("div", {
    className: "bird-name"
  }, props.bird.species), React.createElement("div", {
    className: "date-observed"
  }, dateElement)), addAndRemoveButton);
}
BirdSearchResult.defaultProps = {
  userHasEditRights: false,
  observation: null
};

BirdSearchResult.validate_props = function (props) {
  panic_if_not_type("object", props);
  panic_if_not_type("boolean", props.userHasEditRights);
  panic_if_not_type("function", props.callbackAddObservation, props.callbackRemoveObservation, props.callbackChangeObservationDate);
  return;
};

BirdSearchResult.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const bird = Bird({
        species: "Alli",
        family: "",
        order: ""
      });
      const observation = Observation({
        bird: Bird({
          species: "Alli",
          family: "",
          order: ""
        }),
        date: new Date(0)
      });
      const unitElement = React.createElement(BirdSearchResult, {
        bird,
        observation,
        userHasEditRights: false,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const searchResult = container.querySelector(".BirdSearchResult");
    const birdThumbnail = container.querySelector(".BirdThumbnail");
    const infoCard = container.querySelector(".card");
    const infoCardBirdName = infoCard.querySelector(".bird-name");
    const infoCardObservationDate = infoCard.querySelector(".date-observed");
    const addRemoveButton = container.querySelector(".AsyncIconButton");
    const changeDate = infoCardObservationDate.querySelector(".edit-date");
    throw_if_not_true([() => searchResult !== null, () => birdThumbnail !== null, () => addRemoveButton === null, () => changeDate === null, () => infoCard !== null, () => infoCardBirdName !== null, () => infoCardObservationDate !== null, () => infoCardBirdName.textContent === "Alli", () => infoCardObservationDate.textContent === "1. tammikuuta 1970"]);
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
      const bird = Bird({
        species: "Alli",
        family: "",
        order: ""
      });
      const observation = Observation({
        bird: Bird({
          species: "Alli",
          family: "",
          order: ""
        }),
        date: new Date(0)
      });
      const unitElement = React.createElement(BirdSearchResult, {
        bird,
        observation,
        userHasEditRights: true,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const searchResult = container.querySelector(".BirdSearchResult");
    const birdThumbnail = container.querySelector(".BirdThumbnail");
    const infoCard = container.querySelector(".card");
    const infoCardBirdName = infoCard.querySelector(".bird-name");
    const infoCardObservationDate = infoCard.querySelector(".date-observed");
    const addRemoveButton = container.querySelector(".AsyncIconButton");
    const changeDate = infoCardObservationDate.querySelector(".edit-date");
    throw_if_not_true([() => searchResult !== null, () => birdThumbnail !== null, () => addRemoveButton !== null, () => infoCard !== null, () => changeDate !== null, () => infoCardBirdName !== null, () => infoCardObservationDate !== null, () => infoCardBirdName.textContent === "Alli", () => infoCardObservationDate.textContent === "1. tammikuuta 1970", () => addRemoveButton.getAttribute("title").startsWith("Poista")]);
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
      const bird = Bird({
        species: "Alli",
        family: "",
        order: ""
      });
      const unitElement = React.createElement(BirdSearchResult, {
        bird,
        userHasEditRights: true,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const searchResult = container.querySelector(".BirdSearchResult");
    const birdThumbnail = container.querySelector(".BirdThumbnail");
    const infoCard = container.querySelector(".card");
    const infoCardBirdName = infoCard.querySelector(".bird-name");
    const infoCardObservationDate = infoCard.querySelector(".date-observed");
    const addRemoveButton = container.querySelector(".AsyncIconButton");
    const changeDate = infoCardObservationDate.querySelector(".edit-date");
    throw_if_not_true([() => searchResult !== null, () => birdThumbnail !== null, () => addRemoveButton !== null, () => infoCard !== null, () => changeDate === null, () => infoCardBirdName !== null, () => infoCardObservationDate !== null, () => infoCardBirdName.textContent === "Alli", () => infoCardObservationDate.textContent === "Ei havaintoa", () => addRemoveButton.getAttribute("title").startsWith("Lisää")]);
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
      const bird = Bird({
        species: "Alli",
        family: "",
        order: ""
      });
      const unitElement = React.createElement(BirdSearchResult, {
        bird,
        userHasEditRights: false,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const searchResult = container.querySelector(".BirdSearchResult");
    const birdThumbnail = container.querySelector(".BirdThumbnail");
    const infoCard = container.querySelector(".card");
    const infoCardBirdName = infoCard.querySelector(".bird-name");
    const infoCardObservationDate = infoCard.querySelector(".date-observed");
    const addRemoveButton = container.querySelector(".AsyncIconButton");
    const changeDate = infoCardObservationDate.querySelector(".edit-date");
    throw_if_not_true([() => searchResult !== null, () => birdThumbnail !== null, () => infoCard !== null, () => addRemoveButton === null, () => changeDate === null, () => infoCardBirdName !== null, () => infoCardObservationDate !== null, () => infoCardBirdName.textContent === "Alli", () => infoCardObservationDate.textContent === "Ei havaintoa"]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};