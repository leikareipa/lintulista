"use strict";

import { panic_if_not_type, panic, throw_if_not_true } from "../../assert.js";
export function BirdSearchBar(props = {}) {
  BirdSearchBar.validateProps(props);
  const searchRef = React.useRef();
  const [state, setState] = React.useState(props.initialState);
  const [currentText, setCurrentText] = React.useState("");
  React.useEffect(() => {
    window.addEventListener("mousedown", handle_search_click);
    return () => window.removeEventListener("mousedown", handle_search_click);

    function handle_search_click(clickEvent) {
      const clickedOnSearchElement = (() => {
        let targetNode = clickEvent.target;

        if (targetNode && targetNode.tagName.toLowerCase() === "html") {
          return true;
        }

        while (targetNode) {
          if (targetNode.classList && (targetNode.classList.contains("BirdSearchResultsDisplay") || targetNode.classList.contains("BirdSearchResult") || targetNode.classList.contains("BirdSearchBar"))) {
            return true;
          }

          targetNode = targetNode.parentNode;
        }

        return false;
      })();

      if (!clickedOnSearchElement) {
        setState("inactive");
      }
    }
  }, []);
  React.useEffect(() => {
    if (!["active", "inactive"].includes(state)) {
      panic(`Invalid state value "${state}".`);
    }

    switch (state) {
      case "inactive":
        {
          props.callbackOnInactivate();
          break;
        }

      case "active":
        {
          props.callbackOnActivate();
          break;
        }

      default:
        panic(`Unknown state "${state}".`);
        break;
    }
  }, [state]);
  return React.createElement("div", {
    className: "BirdSearchBar"
  }, React.createElement("input", {
    className: `search-field ${state}`.trim(),
    ref: searchRef,
    type: "search",
    onBlur: () => {
      if (!currentText.length) {
        got_focus(false);
      }
    },
    onFocus: () => got_focus(true),
    onChange: handle_input_event,
    spellCheck: "false",
    placeholder: "Hae lajia",
    autoComplete: "off"
  }), React.createElement("i", {
    className: "icon fas fa-search"
  }));

  function got_focus(gotIt) {
    setState(gotIt ? "active" : "inactive");

    if (gotIt && currentText) {
      props.callbackOnChange(currentText);
    }
  }

  function handle_input_event(inputEvent) {
    const inputString = inputEvent.target.value.trim();
    setCurrentText(inputString);
    props.callbackOnChange(inputString);
  }
}
BirdSearchBar.defaultProps = {
  initialState: "inactive",
  callbackOnChange: () => {},
  callbackOnActivate: () => {},
  callbackOnInactivate: () => {}
};

BirdSearchBar.validateProps = function (props) {
  panic_if_not_type("object", props);
  panic_if_not_type("string", props.initialState);
  panic_if_not_type("function", props.callbackOnChange, props.callbackOnActivate, props.callbackOnInactivate);

  if (!["active", "inactive"].includes(props.initialState)) {
    panic(`Invalid state value "${props.initialState}".`);
  }

  return;
};

BirdSearchBar.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    let currentSearchString = "nothing";
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(BirdSearchBar, {
        callbackOnChange: string => {
          currentSearchString = string;
        }
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    {
      const inputField = container.querySelector("input");
      throw_if_not_true([() => inputField !== null]);
      inputField.value = "blub blab";
      ReactTestUtils.Simulate.change(inputField);
      throw_if_not_true([() => currentSearchString === inputField.value]);
      inputField.value = "";
      ReactTestUtils.Simulate.change(inputField);
      throw_if_not_true([() => currentSearchString.length === 0]);
    }
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};