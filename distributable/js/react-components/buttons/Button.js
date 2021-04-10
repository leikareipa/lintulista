"use strict";

import { panic_if_not_type } from "../../assert.js";
export function Button(props = {}) {
  Button.validate_props(props);
  return React.createElement("div", {
    className: `Button ${props.enabled ? "enabled" : "disabled"}`,
    onClick: handle_click
  }, React.createElement("div", {
    className: "tooltip",
    style: {
      display: props.showTooltip ? "initial" : "none"
    }
  }, props.tooltip), React.createElement("div", {
    className: "icon",
    title: props.title
  }, React.createElement("i", {
    className: props.icon
  })));

  function handle_click() {
    props.callbackOnButtonClick();
    return;
  }
}
Button.defaultProps = {
  id: "undefined-button",
  title: "?",
  icon: "fas fa-question fa-fw",
  enabled: true,
  showTooltip: false,
  tooltip: "?",
  callbackOnButtonClick: () => {}
};

Button.validate_props = function (props) {
  panic_if_not_type("object", props);
  return;
};