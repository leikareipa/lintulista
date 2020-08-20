"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { BirdSearchResult } from "./BirdSearchResult.js";
import { BirdSearchBar } from "./BirdSearchBar.js";
import { Observation } from "../../observation.js";
import { Bird } from "../../bird.js";
export function BirdSearch(props = {}) {
  BirdSearch.validate_props(props);
  const [currentSearchResult, setCurrentSearchResult] = React.useState(false);
  return React.createElement("div", {
    className: "BirdSearch"
  }, React.createElement(BirdSearchBar, {
    initialState: "inactive",
    callbackOnChange: refresh_search_results,
    callbackOnInactivate: reset_search_results
  }), React.createElement("div", {
    className: `BirdSearchResultsDisplay ${currentSearchResult ? "active" : "inactive"}`.trim()
  }, currentSearchResult ? currentSearchResult.element : React.createElement(React.Fragment, null)));

  function refresh_search_results(searchString) {
    searchString = searchString.trim();

    if (!searchString.length) {
      reset_search_results();
      return;
    }

    (exactMatch => {
      if (exactMatch) {
        update_match(exactMatch);
        return;
      }

      (partialMatch => {
        if (partialMatch) {
          update_match(partialMatch);
          return;
        }
      })(props.backend.known_birds().find(bird => bird.species.toLowerCase().includes(searchString.toLowerCase())));
    })(props.backend.known_birds().find(bird => bird.species.toLowerCase() === searchString.toLowerCase()));

    function update_match(bird) {
      if (!currentSearchResult || bird.species !== currentSearchResult.bird.species) {
        setCurrentSearchResult({
          bird,
          element: make_result_element(bird)
        });
      }
    }

    function make_result_element(bird) {
      const observation = props.backend.observations().find(obs => obs.bird.species === bird.species);
      return React.createElement(BirdSearchResult, {
        key: bird.species,
        bird: bird,
        observation: observation ? observation : null,
        userHasEditRights: props.backend.hasEditRights,
        callbackAddObservation: add_bird_to_list,
        callbackRemoveObservation: remove_bird_from_list,
        callbackChangeObservationDate: change_observation_date
      });
    }
  }

  async function add_bird_to_list(bird) {
    panic_if_not_type("object", bird);
    await props.callbackAddObservation(bird);
    reset_search_results();
  }

  async function remove_bird_from_list(bird) {
    panic_if_not_type("object", bird);
    reset_search_results();
    await props.callbackRemoveObservation(bird);
  }

  async function change_observation_date(bird) {
    reset_search_results();
    await props.callbackChangeObservationDate(bird);
  }

  function reset_search_results() {
    setCurrentSearchResult(false);
  }
}
BirdSearch.defaultProps = {
  maxNumResultElements: 1
};

BirdSearch.validate_props = function (props) {
  panic_if_not_type("object", props, props.backend);
  panic_if_not_type("function", props.callbackAddObservation);
  return;
};

BirdSearch.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    const backend = {
      known_birds: () => [Bird({
        species: "Alli",
        family: "",
        order: ""
      }), Bird({
        species: "Naakka",
        family: "",
        order: ""
      })],
      observations: () => [Observation({
        bird: Bird({
          species: "Naakka",
          family: "",
          order: ""
        }),
        date: new Date(1000)
      })]
    };
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(BirdSearch, {
        backend,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const searchElement = container.querySelector(".BirdSearch");
    const searchBar = container.querySelector(".BirdSearchBar");
    const searchResultsDisplay = container.querySelector(".BirdSearchResultsDisplay");
    const searchBarInput = searchBar.querySelector("input");
    throw_if_not_true([() => searchElement !== null, () => searchBar !== null, () => searchResultsDisplay !== null, () => searchBarInput !== null]);
    ReactTestUtils.Simulate.focus(searchBarInput);
    {
      searchBarInput.value = "alli";
      ReactTestUtils.Simulate.change(searchBarInput);
      throw_if_not_true([() => searchResultsDisplay.childNodes.length === 1, () => searchResultsDisplay.childNodes[0].getAttribute("class") === "BirdSearchResult not-previously-observed"]);
    }
    {
      searchBarInput.value = "naakka";
      ReactTestUtils.Simulate.change(searchBarInput);
      throw_if_not_true([() => searchResultsDisplay.childNodes.length === 1, () => searchResultsDisplay.childNodes[0].getAttribute("class") === "BirdSearchResult"]);
    }
    {
      searchBarInput.value = "naakka";
      ReactTestUtils.Simulate.change(searchBarInput);
      throw_if_not_true([() => searchResultsDisplay.childNodes.length === 1]);
      searchBarInput.value = "";
      ReactTestUtils.Simulate.change(searchBarInput);
      throw_if_not_true([() => searchResultsDisplay.childNodes.length === 0]);
    }
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};