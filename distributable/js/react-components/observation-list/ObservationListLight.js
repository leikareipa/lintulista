"use strict";

import { panic_if_undefined, panic_if_not_type } from "../../assert.js";
import { merge_100_lajia_with } from "../../100-lajia-observations.js";
import { ObservationListFootnotes } from "./ObservationListFootnotes.js";
import { ObservationListMenuBar } from "./ObservationListMenuBar.js";
import { ObservationCard } from "./ObservationCard.js";
import { Observation } from "../../observation.js";
import * as FileSaver from "../../filesaver/FileSaver.js";

function cards_from_observations(observations = [Observation]) {
  panic_if_not_type("array", observations);
  return observations.map(obs => React.createElement(ObservationCard, {
    observation: obs,
    isGhost: obs.isGhost,
    key: obs.bird.species
  }));
}

export function ObservationListLight(props = {}) {
  ObservationListLight.validate_props(props);
  const observations = ReactRedux.useSelector(state => state.observations);
  const is100LajiaMode = ReactRedux.useSelector(state => state.is100LajiaMode);
  const [isMenuBarEnabled, setIsMenuBarEnabled] = React.useState(true);
  return React.createElement("div", {
    className: "ObservationList"
  }, React.createElement(ObservationListMenuBar, {
    enabled: isMenuBarEnabled,
    backend: props.backend,
    callbackSetListSorting: () => {}
  }), React.createElement("div", {
    className: "observation-cards"
  }, cards_from_observations(is100LajiaMode ? merge_100_lajia_with(observations) : observations)), React.createElement(ObservationListFootnotes, {
    numObservationsInList: observations.length,
    callbackDownloadList: save_observations_to_csv_file
  }));

  function save_observations_to_csv_file() {
    let csvString = "Päivämäärä, Laji, Heimo, Lahko\n";
    observations.forEach(obs => {
      const dateString = new Intl.DateTimeFormat("fi-FI").format(obs.date);
      csvString += `${dateString || ""}, ${obs.bird.species || ""}, ${obs.bird.family || ""}, ${obs.bird.order || ""},\n`;
    });
    saveAs(new Blob([csvString], {
      type: "text/plain;charset=utf-8"
    }), "lintulista.csv");
  }
}

ObservationListLight.validate_props = function (props) {
  panic_if_undefined(props.backend);
  return;
};