"use strict";

import { panic_if_undefined, panic, panic_if_not_type } from "../../assert.js";
import { QueryObservationDeletion } from "../dialogs/QueryObservationDeletion.js";
import { ObservationListFootnotes } from "./ObservationListFootnotes.js";
import { ObservationListMenuBar } from "./ObservationListMenuBar.js";
import { QueryObservationDate } from "../dialogs/QueryObservationDate.js";
import { open_modal_dialog } from "../../open-modal-dialog.js";
import { ObservationCard } from "./ObservationCard.js";
import { Observation } from "../../observation.js";
import * as FileSaver from "../../filesaver/FileSaver.js";
const sataLajia = Object.freeze(["Alli", "Fasaani", "Haahka", "Haapana", "Haarapääsky", "Harakka", "Härkälintu", "Harmaahaikara", "Harmaalokki", "Harmaapäätikka", "Harmaasieppo", "Helmipöllö", "Hemppo", "Hernekerttu", "Hiirihaukka", "Hiiripöllö", "Hippiäinen", "Hömötiainen", "Huuhkaja", "Isokoskelo", "Isolepinkäinen", "Järripeippo", "Jouhisorsa", "Käenpiika", "Käki", "Kalalokki", "Kalatiira", "Kanadanhanhi", "Kanahaukka", "Kapustarinta", "Käpytikka", "Kaulushaikara", "Kehrääjä", "Keltasirkku", "Keltavästäräkki", "Kesykyyhky", "Kirjosieppo", "Kiuru", "Kivitasku", "Korppi", "Koskikara", "Kottarainen", "Kuikka", "Kultarinta", "Kuovi", "Kurki", "Kuukkeli", "Kuusitiainen", "Kyhmyjoutsen", "Lapasorsa", "Lapintiainen", "Lapintiira", "Laulujoutsen", "Laulurastas", "Lehtokerttu", "Lehtokurppa", "Lehtopöllö", "Leppälintu", "Liro", "Luhtakerttunen", "Merihanhi", "Merikotka", "Merilokki", "Merimetso", "Metsähanhi", "Metsäkirvinen", "Metso", "Mustalintu", "Mustapääkerttu", "Mustarastas", "Naakka", "Närhi", "Naurulokki", "Niittykirvinen", "Nokikana", "Nuolihaukka", "Pajulintu", "Pajusirkku", "Palokärki", "Peippo", "Peltosirkku", "Pensaskerttu", "Pensassirkkalintu", "Pensastasku", "Peukaloinen", "Piekana", "Pikkukäpylintu", "Pikkulepinkäinen", "Pikkulokki", "Pikkutikka", "Pikkuvarpunen", "Pilkkasiipi", "Pulmunen", "Punakylkirastas", "Punarinta", "Punatulkku", "Punavarpunen", "Puukiipijä", "Pyrstötiainen", "Pyy", "Räkättirastas", "Rantasipi", "Rautiainen", "Räyskä", "Räystäspääsky", "Riekko", "Ruisrääkkä", "Ruokokerttunen", "Ruskosuohaukka", "Rytikerttunen", "Sääksi", "Sarvipöllö", "Satakieli", "Selkälokki", "Sepelkyyhky", "Silkkiuikku", "Sinirinta", "Sinisorsa", "Sinisuohaukka", "Sinitiainen", "Sirittäjä", "Suokukko", "Taivaanvuohi", "Talitiainen", "Tavi", "Teeri", "Telkkä", "Tervapääsky", "Tikli", "Tilhi", "Tiltaltti", "Törmäpääsky", "Töyhtöhyyppä", "Töyhtötiainen", "Tukkakoskelo", "Tukkasotka", "Tundrahanhi", "Tuulihaukka", "Urpiainen", "Uuttukyyhky", "Valkoposkihanhi", "Varis", "Varpunen", "Varpushaukka", "Varpuspöllö", "Västäräkki", "Viherpeippo", "Vihervarpunen", "Viirupöllö", "Viitakerttunen"]);
export function ObservationList(props = {}) {
  ObservationList.validate_props(props);
  const [observationCardsKey, setObservationCardsKey] = React.useState(0);
  const [isMenuBarEnabled, setIsMenuBarEnabled] = React.useState(true);
  const [sortListBy, setSortListBy] = React.useState(props.backend.observations().length ? "date" : "sata-lajia");
  const [renderCount] = React.useState(() => ({
    total: 0,
    elements: 0,
    isInitialRender: true
  }));
  renderCount.total++;
  const [observationCards] = React.useState(() => create_observation_cards());
  const observationSorter = {
    species: (a, b) => a.observation.bird.species < b.observation.bird.species ? -1 : a.observation.bird.species > b.observation.bird.species ? 1 : 0,
    family: (a, b) => a.observation.bird.family < b.observation.bird.family ? -1 : a.observation.bird.family > b.observation.bird.family ? 1 : 0,
    order: (a, b) => a.observation.bird.order < b.observation.bird.order ? -1 : a.observation.bird.order > b.observation.bird.order ? 1 : 0,
    date: (a, b) => a.observation.unixTimestamp < b.observation.unixTimestamp ? 1 : a.observation.unixTimestamp > b.observation.unixTimestamp ? -1 : 0
  };
  React.useEffect(() => {
    if (renderCount.total > 1) {
      observationCards.splice(0, observationCards.length, ...create_observation_cards());
      sort_observation_cards();
      redraw_observation_cards();
    }

    renderCount.isInitialRender = false;
  }, [sortListBy]);
  const observationDataMutator = Object.freeze({
    add_observation: async function (bird) {
      const obs = Observation({
        bird,
        date: new Date()
      });

      if (await props.backend.put_observation(obs)) {
        const elementIdx = observationCards.map(c => c.observation.bird.species).findIndex(species => species === obs.bird.species);

        if (elementIdx === -1) {
          observationCards.unshift(observation_card(obs));
        } else {
          observationCards.splice(elementIdx, 1, observation_card(obs));
        }

        sort_observation_cards();
        redraw_observation_cards();
      } else {
        error(`Could not add an observation for ${bird.species}.`);
      }
    },
    delete_observation: async function (bird) {
      const obs = observationCards.map(o => o.observation).find(obs => obs.bird.species === bird.species);

      if (!obs) {
        panic("Was asked to delete an observation of a species of which no observation exists.");
        return;
      }

      setIsMenuBarEnabled(false);
      await open_modal_dialog(QueryObservationDeletion, {
        observation: obs,
        onAccept: async () => {
          const elementIdx = observationCards.map(c => c.observation.bird.species).findIndex(species => species === obs.bird.species);

          if (elementIdx !== -1 && (await props.backend.delete_observation(obs))) {
            const speciesName = observationCards[elementIdx].observation.bird.species;

            if (sortListBy === "sata-lajia" && sataLajia.includes(speciesName)) {
              observationCards.splice(elementIdx, 1, ghost_observation_card(speciesName));
            } else {
              observationCards.splice(elementIdx, 1);
            }

            sort_observation_cards();
            redraw_observation_cards();
          } else {
            error(`Could not delete the observation of ${bird.species}.`);
          }
        },
        onClose: () => {
          setIsMenuBarEnabled(true);
        }
      });
    },
    set_observation_date: async function (bird) {
      panic_if_not_type("object", bird);
      const existingObservation = observationCards.map(o => o.observation).find(obs => obs.bird.species === bird.species);

      if (!existingObservation) {
        panic("Was asked to set the date of an observation of a species of which no observation exists.");
        return;
      }

      setIsMenuBarEnabled(false);
      await open_modal_dialog(QueryObservationDate, {
        observation: existingObservation,
        onAccept: async ({
          year,
          month,
          day
        }) => {
          const newDate = new Date();
          newDate.setFullYear(year);
          newDate.setMonth(month - 1);
          newDate.setDate(day);
          const modifiedObservation = Observation({ ...existingObservation,
            date: newDate
          });

          if (!(await props.backend.put_observation(modifiedObservation))) {
            return null;
          }

          const cardIdx = observationCards.map(o => o.observation).findIndex(obs => obs.bird.species === bird.species);

          if (cardIdx === -1) {
            panic("Unable to find the observation card whose date was modified.");
          }

          observationCards.splice(cardIdx, 1, observation_card(modifiedObservation));

          if (sortListBy === "date") {
            sort_observation_cards();
            redraw_observation_cards();
          }
        },
        onClose: () => {
          setIsMenuBarEnabled(true);
        }
      });
    }
  });
  return React.createElement("div", {
    className: "ObservationList"
  }, React.createElement(ObservationListMenuBar, {
    enabled: isMenuBarEnabled,
    backend: props.backend,
    callbackAddObservation: observationDataMutator.add_observation,
    callbackRemoveObservation: observationDataMutator.delete_observation,
    callbackChangeObservationDate: observationDataMutator.set_observation_date,
    callbackSetListSorting: setSortListBy
  }), React.createElement("div", {
    className: `observation-cards ${sortListBy}`.trim(),
    key: observationCardsKey
  }, observationCards.map(card => card.element)), React.createElement(ObservationListFootnotes, {
    numObservationsInList: props.backend.observations().length,
    callbackDownloadList: save_observations_to_csv_file
  }));

  function redraw_observation_cards() {
    renderCount.cards++;
    setObservationCardsKey(observationCardsKey + 1);
  }

  function create_observation_cards() {
    if (sortListBy === "sata-lajia") {
      const sata = sataLajia.reduce((array, species) => {
        const existingObservation = props.backend.observations().find(obs => obs.bird.species === species);
        array.push(existingObservation ? observation_card(existingObservation) : ghost_observation_card(species));
        return array;
      }, []);
      const normal = props.backend.observations().filter(obs => !sataLajia.includes(obs.bird.species)).map(obs => observation_card(obs));
      return [...sata, ...normal];
    } else {
        return props.backend.observations().map(obs => observation_card(obs));
      }
  }

  function ghost_observation_card(speciesName) {
    panic_if_not_type("string", speciesName);
    const bird = props.backend.known_birds().find(bird => bird.species === speciesName);

    if (!bird) {
      panic(`Unknown species '${speciesName}'.`);
      return {};
    }

    const obs = Observation({
      bird,
      date: new Date()
    });
    return {
      observation: obs,
      element: React.createElement(ObservationCard, {
        observation: obs,
        isGhost: true,
        key: obs.bird.species
      })
    };
  }

  function observation_card(obs) {
    panic_if_not_type("object", obs);
    return {
      observation: obs,
      element: React.createElement(ObservationCard, {
        observation: obs,
        key: obs.bird.species
      })
    };
  }

  function sort_observation_cards() {
    const sorter = (() => {
      switch (sortListBy) {
        case "sata-lajia":
          return observationSorter["species"];

        case "date":
        case "species":
          return observationSorter[sortListBy];

        default:
          panic("Unknown sorter.");
          return () => {};
      }
    })();

    observationCards.sort(sorter);
  }

  function save_observations_to_csv_file() {
    let csvString = "Ensihavainto, Laji, Heimo, Lahko\n";
    props.backend.observations().forEach(obs => {
      const dateString = new Intl.DateTimeFormat("fi-FI").format(obs.date);
      csvString += `${dateString || ""}, ${obs.bird.species || ""}, ${obs.bird.family || ""}, ${obs.bird.order || ""},\n`;
    });
    saveAs(new Blob([csvString], {
      type: "text/plain;charset=utf-8"
    }), "lintulista.csv");
  }
}

ObservationList.validate_props = function (props) {
  panic_if_undefined(props.backend);
  return;
};