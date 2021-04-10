"use strict";

import { panic_if_undefined, panic_if_not_type, error, warn, panic, throw_if_not_true } from "../../assert.js";
import { Scroller } from "./Scroller.js";
export function ScrollerLabel(props = {}) {
  ScrollerLabel.validate_props(props);
  const [underlyingValue, setUnderlyingValue] = React.useState(props.value);
  let value = underlyingValue;
  React.useEffect(() => {
    props.onChange(underlyingValue);
    return () => props.onChange(underlyingValue);
  }, [underlyingValue]);
  return React.createElement("div", {
    className: "ScrollerLabel"
  }, React.createElement(Scroller, {
    icon: "fas fa-caret-up fa-2x",
    additionalClassName: "up",
    callback: () => scroll_value(1)
  }), React.createElement("div", {
    className: "value"
  }, `${displayable_value()}${props.suffix || ""}`), React.createElement(Scroller, {
    icon: "fas fa-caret-down fa-2x",
    additionalClassName: "down",
    callback: () => scroll_value(-1)
  }));

  function scroll_value(direction = 1) {
    value = value + direction < props.min ? props.max : value + direction > props.max ? props.min : value + direction;
    setUnderlyingValue(value);
  }

  function displayable_value() {
    switch (props.type) {
      case "integer":
        return underlyingValue;

      case "month-name":
        return month_name(underlyingValue - 1, props.language);

      default:
        error("Unknown value type.");
        return "?";
    }
  }

  function month_name(idx = 0) {
    const monthNamesFI = ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"];
    return monthNamesFI[idx % 12];
  }
}

ScrollerLabel.validate_props = function (props) {
  panic_if_undefined(props.type, props.min, props.max);
  panic_if_not_type("number", props.min, props.max, props.value);

  if (!props.onChange) {
    warn("No onChange callback function passed to this scroller label.");
  } else if (typeof props.onChange !== "function") {
    panic("Expected the onChange property to be a function.");
  }

  return;
};

ScrollerLabel.test = () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(ScrollerLabel, {
        type: "month-name",
        value: 3,
        min: 1,
        max: 12,
        suffix: "ta",
        onChange: () => {}
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.textContent === "maaliskuuta"]);
    const scrollUp = container.querySelector(".Scroller.up");
    const scrollDown = container.querySelector(".Scroller.down");
    throw_if_not_true([() => scrollUp !== null, () => scrollDown !== null]);
    {
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "huhtikuuta"]);
    }
    {
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      throw_if_not_true([() => container.textContent === "helmikuuta"]);
    }
    {
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      throw_if_not_true([() => container.textContent === "joulukuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "tammikuuta"]);
    }
    {
      throw_if_not_true([() => container.textContent === "tammikuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "helmikuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "maaliskuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "huhtikuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "toukokuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "kesäkuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "heinäkuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "elokuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "syyskuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "lokakuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "marraskuuta"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "joulukuuta"]);
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
      const unitElement = React.createElement(ScrollerLabel, {
        type: "integer",
        value: 1,
        min: 0,
        max: 2,
        onChange: () => {}
      });
      ReactDOM.render(unitElement, container);
    });
    throw_if_not_true([() => container.textContent === "1"]);
    const scrollUp = container.querySelector(".Scroller.up");
    const scrollDown = container.querySelector(".Scroller.down");
    throw_if_not_true([() => scrollUp instanceof HTMLElement, () => scrollDown instanceof HTMLElement]);
    {
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "2"]);
    }
    {
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      throw_if_not_true([() => container.textContent === "0"]);
    }
    {
      ReactTestUtils.Simulate.mouseDown(scrollDown);
      ReactTestUtils.Simulate.mouseUp(scrollDown);
      throw_if_not_true([() => container.textContent === "2"]);
      ReactTestUtils.Simulate.mouseDown(scrollUp);
      ReactTestUtils.Simulate.mouseUp(scrollUp);
      throw_if_not_true([() => container.textContent === "0"]);
    }
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};