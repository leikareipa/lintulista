"use strict";

import { darken_viewport } from "./darken_viewport.js";
import { public_error } from "./throwable.js";
export function public_assert(condition, failMessage = "") {
  if (!condition) {
    throw public_error(failMessage);
  }

  return;
}
export function panic(errorMessage = "") {
  darken_viewport({
    opacity: 1,
    z: 1000
  });
  alert(`Lintulista is in a panic: ${errorMessage}`);
  throw Error(`Lintulista is in a panic: ${errorMessage}`);
}
export function panic_if_undefined(...properties) {
  properties.forEach(property => {
    if (!is_defined(property)) {
      panic("A required property is undefined.");
    }
  });
}
export function panic_if_not_type(typeName, ...properties) {
  properties.forEach(property => {
    const isOfType = (() => {
      switch (typeName) {
        case "array":
          return Array.isArray(property);

        default:
          return typeof property === typeName;
      }
    })();

    if (!isOfType) {
      panic(`A property is of the wrong type; expected "${typeName}".`);
    }
  });
}
export function is_function(property) {
  return typeof property === "function";
}
export function is_defined(property) {
  return typeof property !== "undefined";
}
export function error(errorMessage = "") {
  console.error(`Lintulista: ${errorMessage}`);
  alert(`Lintulista: ${errorMessage}`);
}
export function warn(errorMessage = "") {
  console.warn(`Lintulista: ${errorMessage}`);
}
export function debug(debugMessage = "") {
  console.debug(`Lintulista: ${debugMessage}`);
}
export function expect_true(expect = []) {
  panic_if_not_type("array", expect);
  const expectFailed = expect.map((test, idx) => ({
    run: test,
    idx
  })).filter(test => test.run() !== true);

  if (expectFailed.length) {
    console.error(...["Not strictly true:\n", ...expectFailed.map(failedTest => `#${failedTest.idx + 1}: ${failedTest.run.toString()}\n`)]);
  }

  return !expectFailed.length;
}
export function throw_if_not_true(expect = []) {
  panic_if_not_type("array", expect);

  if (!expect_true(expect)) {
    throw "assertion failure";
  }

  return;
}