"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { Observation } from "../../observation.js";
import { BirdSearch } from "../bird-search/BirdSearch.js";
import { MenuButton } from "../buttons/MenuButton.js";
import { Bird } from "../../bird.js";
export function ObservationListMenuBar(props = {}) {
  ObservationListMenuBar.validate_props(props);
  const responsive = {
    largeEnoughForTooltips: window.matchMedia("(min-width: 500px)")
  };
  const [isBarSticky, setIsBarSticky] = React.useState(false);
  const [allowMenuButtonTooltips, setAllowMenuButtonTooltips] = React.useState(responsive.largeEnoughForTooltips.matches);
  responsive.largeEnoughForTooltips.addListener(e => setAllowMenuButtonTooltips(e.matches));
  React.useEffect(() => {
    update_sticky_scroll();
    window.addEventListener("scroll", update_sticky_scroll);
    return () => {
      window.removeEventListener("scroll", update_sticky_scroll);
    };

    function update_sticky_scroll() {
      const stickThresholdY = 220;

      if (!isBarSticky && window.scrollY > stickThresholdY) {
        setIsBarSticky(true);
      } else if (isBarSticky && window.scrollY <= stickThresholdY) {
        setIsBarSticky(false);
      }
    }
  });
  return React.createElement("div", {
    className: `ObservationListMenuBar ${props.enabled ? "enabled" : "disabled"} ${isBarSticky ? "sticky" : ""}`.trim()
  }, React.createElement(BirdSearch, {
    backend: props.backend,
    callbackAddObservation: props.callbackAddObservation,
    callbackRemoveObservation: props.callbackRemoveObservation,
    callbackChangeObservationDate: props.callbackChangeObservationDate
  }), React.createElement("div", {
    className: "buttons"
  }, React.createElement(MenuButton, {
    icon: "fas fa-list-ul fa-fw",
    title: "Listan j\xE4rjestys",
    id: "list-sorting",
    items: [{
      text: "Laji",
      callbackOnSelect: () => props.callbackSetListSorting("species")
    }, {
      text: "Päivä",
      callbackOnSelect: () => props.callbackSetListSorting("date")
    }, {
      text: "100 Lajia",
      callbackOnSelect: () => props.callbackSetListSorting("sata-lajia")
    }],
    initialItemIdx: props.backend.observations().length ? 1 : 2,
    showTooltip: !isBarSticky && allowMenuButtonTooltips
  }), React.createElement(MenuButton, {
    icon: "fas fa-question fa-fw",
    title: "Tietoja",
    id: "list-info",
    showTooltip: false,
    customMenu: React.createElement("div", null, React.createElement("div", {
      style: {
        textAlign: "center"
      }
    }, "Tietoja Lintulistasta"), React.createElement("a", {
      href: "./guide/",
      target: "_blank",
      rel: "noopener noreferrer"
    }, "K\xE4ytt\xF6ohje"), React.createElement("br", null), React.createElement("a", {
      href: "mailto:sw@tarpeeksihyvaesoft.com"
    }, "Yhteydenotto"), React.createElement("br", null), React.createElement("a", {
      href: "./guide/images.html",
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Kuvien tiedot"), React.createElement("br", null))
  }), React.createElement("a", {
    className: `lock ${props.backend.hasEditRights ? "unlocked" : "locked"}`.trim(),
    title: props.backend.hasEditRights ? "Avaa listan julkinen versio" : "Julkista listaa ei voi muokata",
    href: props.backend.hasEditRights ? `./katsele/${props.backend.viewKey}` : null,
    rel: "noopener noreferrer",
    target: "_blank"
  }, React.createElement("i", {
    className: props.backend.hasEditRights ? "fas fa-unlock-alt fa-fw" : "fas fa-lock fa-fw"
  }))));
}
ObservationListMenuBar.defaultProps = {
  enabled: true
};

ObservationListMenuBar.validate_props = function (props) {
  panic_if_not_type("object", props, props.backend);
  panic_if_not_type("function", props.callbackAddObservation, props.callbackSetListSorting);
  return;
};

ObservationListMenuBar.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    const backend = {
      hasEditRights: true,
      viewKey: "abcdefg",
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
      const unitElement = React.createElement(ObservationListMenuBar, {
        backend,
        enabled: true,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {},
        callbackSetListSorting: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.querySelector(".ObservationListMenuBar") !== null, () => container.querySelector(".BirdSearch") !== null, () => container.querySelector(".buttons") !== null, () => container.querySelector(".lock") !== null, () => container.querySelector(".lock").tagName.toLowerCase() === "a", () => container.querySelector(".lock").classList.contains("unlocked"), () => container.querySelector(".lock").getAttribute("href") === `./katsele/${backend.viewKey}`]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    const backend = {
      hasEditRights: false,
      viewKey: "abcdefg",
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
      const unitElement = React.createElement(ObservationListMenuBar, {
        backend,
        enabled: true,
        callbackAddObservation: () => {},
        callbackRemoveObservation: () => {},
        callbackChangeObservationDate: () => {},
        callbackSetListSorting: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.querySelector(".ObservationListMenuBar") !== null, () => container.querySelector(".BirdSearch") !== null, () => container.querySelector(".buttons") !== null, () => container.querySelector(".lock") !== null, () => container.querySelector(".lock").tagName.toLowerCase() === "a", () => container.querySelector(".lock").classList.contains("locked"), () => !container.querySelector(".lock").getAttribute("href")]);
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};