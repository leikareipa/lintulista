"use strict";

import { tr } from "./translator.js";
export function error_popup(errorMessage = "") {
  console.log(tr("Encountered an error"), errorMessage);
}