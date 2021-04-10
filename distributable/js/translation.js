"use strict";

import { private_error } from "./throwable.js";
const translations = {
  "Encountered an error": {
    fiFI: "Sattui virhe"
  },
  "Invalid server response": {
    fiFI: "Palvelinyhteysvirhe"
  },
  "Login failed": {
    fiFI: "Sisäänkirjautuminen epäonnistui"
  },
  "Logout failed": {
    fiFI: "Uloskirjautuminen epäonnistui"
  }
};
export function tr(originalString = "", dstLanguage = "enEN") {
  if (typeof originalString !== "string") {
    throw private_error("Invalid arguments.");
  }

  if (dstLanguage === "enEN") {
    return originalString;
  }

  const translation = translations[originalString] || [];
  const translatedString = translation[dstLanguage] || null;
  return translatedString || originalString;
}