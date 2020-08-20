"use strict";

import { error, panic_if_not_type, is_function, throw_if_not_true } from "../../assert.js";
export function AsyncIconButton(props = {}) {
  AsyncIconButton.validate_props(props);
  const [currentIcon, setCurrentIcon] = React.useState(props.icon);
  const [currentTitle, setCurrentTitle] = React.useState(props.title);

  const iconSize = (() => {
    const sizeStrings = props.icon.match(/fa-([0-9]+x|xs|sm|lg)/g);
    return sizeStrings ? sizeStrings.join(" ") : "";
  })();

  const [currentState, setCurrentState] = React.useState(props.task && props.enabled ? "enabled" : "disabled");

  if (is_function(props.giveCallbackTriggerPress)) {
    props.giveCallbackTriggerPress(handle_click);
  }

  return React.createElement("span", {
    className: `AsyncIconButton ${currentState}`,
    onClick: handle_click,
    title: props.titleIsAlwaysVisible ? "" : currentTitle
  }, React.createElement("i", {
    className: currentIcon
  }), props.titleIsAlwaysVisible ? React.createElement(React.Fragment, null, React.createElement("br", null), currentTitle) : React.createElement(React.Fragment, null));

  async function handle_click() {
    if (currentState !== "enabled" || !props.task) {
      return;
    }

    set_button_state("waiting");
    await props.task({
      resetButtonState: (state = "enabled") => {
        set_button_state(state);
      }
    });
  }

  function set_button_state(newState) {
    panic_if_not_type("string", newState);

    if (!props.task && newState === "enabled") {
      newState = "disabled";
    }

    switch (newState) {
      case "enabled":
        {
          setCurrentState("enabled");
          setCurrentIcon(props.icon);
          setCurrentTitle(props.title);
          break;
        }

      case "waiting":
        {
          setCurrentState("waiting");
          setCurrentIcon(`fas fa-spinner fa-spin ${iconSize}`.trim());
          setCurrentTitle(props.titleWhenClicked);
          break;
        }

      case "disabled":
        {
          setCurrentState("disabled");
          setCurrentIcon(props.icon);
          setCurrentTitle(props.title);
          break;
        }

      default:
        error("Unknown button state.");
    }
  }
}
AsyncIconButton.defaultProps = {
  enabled: true,
  title: null,
  titleWhenClicked: null,
  titleIsAlwaysVisible: false,
  icon: "fas fa-question"
};

AsyncIconButton.validate_props = function (props) {
  panic_if_not_type("object", props);
  return;
};

AsyncIconButton.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(AsyncIconButton, {
        icon: "fas fa-times",
        title: "Test1",
        titleIsAlwaysVisible: true,
        titleWhenClicked: "Test1-Clicked",
        task: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.textContent === "Test1"]);
    {
      throw_if_not_true([() => container.childNodes.length === 1]);
      const buttonElement = container.childNodes[0];
      throw_if_not_true([() => buttonElement.tagName.toLowerCase() === "span", () => buttonElement.classList.contains("enabled"), () => !buttonElement.classList.contains("waiting"), () => !buttonElement.classList.contains("disabled")]);
      {
        ReactTestUtils.Simulate.click(buttonElement);
        throw_if_not_true([() => container.textContent === "Test1-Clicked", () => buttonElement.classList.contains("waiting"), () => !buttonElement.classList.contains("enabled"), () => !buttonElement.classList.contains("disabled")]);
      }
    }
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
      const unitElement = React.createElement(AsyncIconButton, {
        icon: "fas fa-times",
        enabled: true
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.childNodes.length === 1]);
    const buttonElement = container.childNodes[0];
    throw_if_not_true([() => buttonElement.classList.contains("disabled")]);
    {
      ReactTestUtils.Simulate.click(buttonElement);
      throw_if_not_true([() => buttonElement.classList.contains("disabled"), () => !buttonElement.classList.contains("waiting"), () => !buttonElement.classList.contains("enabled")]);
    }
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};