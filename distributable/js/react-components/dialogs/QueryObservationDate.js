"use strict";

import { panic_if_not_type, panic_if_undefined } from "../../assert.js";
import { ScrollerLabel } from "../scroller-label/ScrollerLabel.js";
import { BirdThumbnail } from "../misc/BirdThumbnail.js";
import { Dialog } from "./Dialog.js";
export function QueryObservationDate(props = {}) {
  QueryObservationDate.validateProps(props);
  let day = props.observation.date.getDate();
  let month = props.observation.date.getMonth() + 1;
  let year = props.observation.date.getFullYear();
  return React.createElement(Dialog, {
    component: "QueryObservationDate",
    title: "Muokkaa havaintop\xE4iv\xE4m\xE4\xE4r\xE4\xE4",
    enterAccepts: true,
    onDialogAccept: accept,
    onDialogReject: reject
  }, React.createElement(BirdThumbnail, {
    bird: props.observation.bird,
    useLazyLoading: false
  }), React.createElement("div", {
    className: "fields"
  }, React.createElement("div", {
    className: "bird-name"
  }, props.observation.bird.species), React.createElement("div", {
    className: "date-bar"
  }, React.createElement("div", {
    className: "day"
  }, React.createElement(ScrollerLabel, {
    type: "integer",
    min: 1,
    max: 31,
    suffix: ".",
    value: day,
    onChange: value => {
      day = value;
    }
  })), React.createElement("div", {
    className: "month"
  }, React.createElement(ScrollerLabel, {
    type: "month-name",
    min: 1,
    max: 12,
    suffix: "ta",
    value: month,
    onChange: value => {
      month = value;
    }
  })), React.createElement("div", {
    className: "year"
  }, React.createElement(ScrollerLabel, {
    type: "integer",
    min: 1,
    max: 5000,
    suffix: "",
    value: year,
    onChange: value => {
      year = value;
    }
  })))));

  function accept() {
    props.onDialogAccept({
      day,
      month,
      year
    });
  }

  function reject() {
    props.onDialogReject();
  }
}

QueryObservationDate.validateProps = function (props) {
  panic_if_undefined(props, props.observation);
  panic_if_not_type("function", props.onDialogAccept, props.onDialogReject);
  return;
};