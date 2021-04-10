"use strict";

import { is_public_ll_error } from "../../throwable.js";
import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { open_modal_dialog } from "../../open-modal-dialog.js";
import { QueryLoginCredentials } from "../dialogs/QueryLoginCredentials.js";
import { Observation } from "../../observation.js";
import { BirdSearch } from "../bird-search/BirdSearch.js";
import { MenuButton } from "../buttons/MenuButton.js";
import { CheckBoxButton } from "../buttons/CheckBoxButton.js";
import { Button } from "../buttons/Button.js";
import { Bird } from "../../bird.js";
export function ObservationListMenuBar(props = {}) {
  ObservationListMenuBar.validate_props(props);
  const knownBirds = ReactRedux.useSelector(state => state.knownBirds);
  const isLoggedIn = ReactRedux.useSelector(state => state.isLoggedIn);
  const is100LajiaMode = ReactRedux.useSelector(state => state.is100LajiaMode);
  const setIs100LajiaMode = ReactRedux.useDispatch();
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
    className: `ObservationListMenuBar ${props.enabled ? "enabled" : "disabled"}
                                                   ${isBarSticky ? "sticky" : ""}
                                                   ${isLoggedIn ? "logged-in" : "not-logged-in"}`
  }, React.createElement(BirdSearch, {
    backend: props.backend
  }), React.createElement("div", {
    className: "buttons"
  }, React.createElement(CheckBoxButton, {
    iconChecked: "fas fa-check-square fa-fw fa-lg",
    iconUnchecked: "fas fa-square fa-fw fa-lg",
    tooltip: "100 Lajia -haaste",
    showTooltip: !isBarSticky,
    title: "Katso tilanteesi 100 Lajia -haasteessa",
    isChecked: is100LajiaMode,
    callbackOnButtonClick: isChecked => setIs100LajiaMode({
      type: "set-100-lajia-mode",
      isEnabled: isChecked
    })
  }), React.createElement(MenuButton, {
    icon: "fas fa-question fa-fw fa-lg",
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
  }), React.createElement(Button, {
    className: `lock ${isLoggedIn ? "unlocked" : "locked"}`,
    title: isLoggedIn ? "Kirjaudu ulos" : "Kirjaudu sisään muokataksesi listaa",
    icon: isLoggedIn ? "fas fa-user-shield fa-fw fa-lg" : "fas fa-lock fa-fw fa-lg",
    callbackOnButtonClick: handle_login_button_click
  })));

  async function handle_login_button_click() {
    await open_modal_dialog(QueryLoginCredentials, {
      randomBird: knownBirds[Math.floor(Math.random() * knownBirds.length)],
      onAccept: async function ({
        username,
        password
      }) {
        await props.backend.login(username, password);
      }
    });
    return;
  }
}
ObservationListMenuBar.defaultProps = {
  enabled: true
};

ObservationListMenuBar.validate_props = function (props) {
  panic_if_not_type("object", props, props.backend);
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
    throw_if_not_true([() => container.querySelector(".ObservationListMenuBar") !== null, () => container.querySelector(".BirdSearch") !== null, () => container.querySelector(".buttons") !== null, () => container.querySelector(".lock") !== null, () => container.querySelector(".lock").tagName.toLowerCase() === "a", () => container.querySelector(".lock").classList.contains("unlocked"), () => container.querySelector(".lock").getAttribute("href") === `./katsele/${backend.listKey}`]);
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
      isLoggedIn: false,
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