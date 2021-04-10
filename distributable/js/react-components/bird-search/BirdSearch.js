"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { open_modal_dialog } from "../../open-modal-dialog.js";
import { QueryObservationDate } from "../dialogs/QueryObservationDate.js";
import { BirdSearchResult } from "./BirdSearchResult.js";
import { BirdSearchBar } from "./BirdSearchBar.js";
import { Observation } from "../../observation.js";
import { Bird } from "../../bird.js";
export function BirdSearch(props = {}) {
  BirdSearch.validate_props(props);
  const knownBirds = ReactRedux.useSelector(state => state.knownBirds);
  const isLoggedIn = ReactRedux.useSelector(state => state.isLoggedIn);
  const observations = ReactRedux.useSelector(state => state.observations);
  const [currentSearchResult, setCurrentSearchResult] = React.useState(false);
  return React.createElement("div", {
    className: "BirdSearch"
  }, React.createElement(BirdSearchBar, {
    initialState: "inactive",
    callbackOnChange: refresh_search_results,
    callbackOnInactivate: reset_search_results
  }), React.createElement("div", {
    className: `BirdSearchResultsDisplay ${currentSearchResult ? "active" : "inactive"}
                                                         ${isLoggedIn ? "logged-in" : "not-logged-in"}`.trim()
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
      })(knownBirds.find(bird => bird.species.toLowerCase().includes(searchString.toLowerCase())));
    })(knownBirds.find(bird => bird.species.toLowerCase() === searchString.toLowerCase()));

    function update_match(bird) {
      if (!currentSearchResult || bird.species !== currentSearchResult.bird.species) {
        setCurrentSearchResult({
          bird,
          element: make_result_element(bird)
        });
      }
    }

    function make_result_element(bird) {
      const observation = observations.find(obs => obs.bird.species === bird.species);
      return React.createElement(BirdSearchResult, {
        key: bird.species,
        bird: bird,
        observation: observation ? observation : null,
        userHasEditRights: isLoggedIn,
        callbackAddObservation: add_bird_to_list,
        callbackRemoveObservation: remove_bird_from_list,
        callbackChangeObservationDate: change_observation_date
      });
    }
  }

  async function add_bird_to_list(bird = Bird) {
    panic_if_not_type("object", bird);
    const observation = Observation({
      bird,
      date: new Date()
    });
    await props.backend.add_observation(observation);
    reset_search_results();
  }

  async function remove_bird_from_list(bird = Bird) {
    panic_if_not_type("object", bird);
    const observation = Observation({
      bird,
      date: new Date()
    });
    await props.backend.delete_observation(observation);
    reset_search_results();
  }

  async function change_observation_date(bird = Bird) {
    panic_if_not_type("object", bird);
    const observation = observations.find(obs => obs.bird.species === bird.species);

    if (observation === undefined) {
      panic("Was asked to delete an observation of a species of which no observation exists.");
      return;
    }

    await open_modal_dialog(QueryObservationDate, {
      observation,
      onAccept: async ({
        year,
        month,
        day
      }) => {
        const newDate = new Date();
        newDate.setFullYear(year);
        newDate.setMonth(month - 1);
        newDate.setDate(day);
        const modifiedObservation = Observation({
          bird,
          date: newDate
        });

        if (!(await props.backend.add_observation(modifiedObservation))) {
          panic("Failed to update the observation.");
          return;
        }
      }
    });
    reset_search_results();
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