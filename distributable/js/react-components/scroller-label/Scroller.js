"use strict";

import { panic_if_not_type, throw_if_not_true } from "../../assert.js";
import { delay } from "../../delay.js";
export function Scroller(props = {}) {
  Scroller.validateProps(props);
  const firingLoopDelayMs = 350;
  const firingLoopIntervalMs = 190;
  const [firingLoopCountdown, setFiringLoopCountdown] = React.useState(null);
  const [firingLoop, setFiringLoop] = React.useState(null);
  const [mouseDown, setMouseDown] = React.useState(false);
  React.useEffect(() => {
    if (mouseDown) {
      fire();
      setFiringLoopCountdown(setTimeout(start_firing_loop, firingLoopDelayMs));
    } else {
      clearTimeout(firingLoopCountdown);
      setFiringLoopCountdown(null);
      stop_firing_loop();
    }
  }, [mouseDown]);
  return React.createElement("div", {
    className: `Scroller ${props.additionalClassName || ""}`.trim(),
    onMouseDown: () => setMouseDown(true),
    onMouseUp: () => setMouseDown(false),
    onMouseLeave: () => setMouseDown(false)
  }, React.createElement("i", {
    className: props.icon
  }));

  function start_firing_loop() {
    if (!firingLoop) {
      setFiringLoop(setInterval(fire, firingLoopIntervalMs));
    } else {
      warn("The scroller started firing twice.");
    }
  }

  function stop_firing_loop() {
    if (firingLoop) {
      clearInterval(firingLoop);
      setFiringLoop(null);
    }
  }

  function fire() {
    props.callback();
  }
}
Scroller.defaultProps = {
  symbol: "fas fa-question"
};

Scroller.validateProps = function (props) {
  panic_if_not_type("function", props.callback);
  return;
};

Scroller.test = async () => {
  let container = {
    remove: () => {}
  };

  try {
    container = document.createElement("div");
    document.body.appendChild(container);
    container.style.display = "none";
    let value = 0;
    ReactTestUtils.act(() => {
      const unitElement = React.createElement(Scroller, {
        icon: "fas fa-caret-up fa-2x",
        additionalClassName: "up",
        callback: () => {
          value++;
        }
      });
      ReactDOM.unmountComponentAtNode(container);
      ReactDOM.render(unitElement, container);
    });
    const scroller = container.querySelector(".Scroller.up");
    throw_if_not_true([() => scroller !== null]);
    {
      throw_if_not_true([() => value === 0]);
      ReactTestUtils.Simulate.mouseDown(scroller);
      ReactTestUtils.Simulate.mouseUp(scroller);
      throw_if_not_true([() => value === 1]);
    }
    {
      throw_if_not_true([() => value === 1]);
      ReactTestUtils.Simulate.mouseDown(scroller);
      await delay(700);
      ReactTestUtils.Simulate.mouseUp(scroller);
      throw_if_not_true([() => value > 2]);
    }
  } catch (error) {
    if (error === "assertion failure") return false;
    throw error;
  } finally {
    container.remove();
  }

  return true;
};