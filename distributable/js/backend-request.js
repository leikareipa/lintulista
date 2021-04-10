"use strict";

import { error, panic_if_undefined, panic_if_not_type, panic } from "./assert.js";
import { birdThumbnailFilename } from "./bird-thumbnail-filename.js";
import { Bird } from "./bird.js";
const backendURLs = {
  lists: "http://localhost:8080",
  login: "http://localhost:8080/login",
  metadata: "./server/api/metadata.php",
  knownBirdSpecies: "./server/metadata/known-birds.json"
};
export const BackendRequest = {
  make_request: function (url, params = {}) {
    panic_if_not_type("string", url);
    panic_if_not_type("object", params);
    return fetch(url, params).then(response => {
      if (!response.ok) {
        throw response.statusText;
      }

      return response.json();
    }).then(ticket => {
      if (!ticket || !ticket.valid) {
        throw ticket.message ? ticket.message : "Unknown error.";
      }

      return [true, ticket.data];
    }).catch(errorMessage => {
      console.error("Lintulista server error:", errorMessage);
      return [false, null];
    });
  },
  login: async function (listKey, username, password) {
    const [wasSuccessful, responseData] = await this.make_request(`${backendURLs.login}?list=${listKey}`, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });
    return wasSuccessful ? responseData : false;
  },
  logout: async function (listKey, token) {
    const [wasSuccessful] = await this.make_request(`${backendURLs.login}?list=${listKey}`, {
      method: "DELETE",
      body: JSON.stringify({
        token
      })
    });
    return wasSuccessful;
  },
  delete_observation: async function (observation, listKey, token) {
    panic_if_undefined(observation, observation.unixTimestamp, observation.bird);
    const [wasSuccessful] = await this.make_request(`${backendURLs.lists}?list=${listKey}`, {
      method: "DELETE",
      body: JSON.stringify({
        token,
        species: observation.bird.species
      })
    });
    return wasSuccessful;
  },
  get_known_birds_list: async function () {
    let response = await fetch(backendURLs.knownBirdSpecies);

    if (!response.ok) {
      panic(`The server responded with an error: ${response.statusText}`);
      return false;
    } else {
      response = await response.json();
    }

    panic_if_not_type("array", response.birds);
    return response.birds.map(b => Bird({
      order: b.order,
      family: b.family,
      species: b.species,
      thumbnailUrl: birdThumbnailFilename[b.species] ? "./img/bird-thumbnails/" + birdThumbnailFilename[b.species] : null
    }));
  },
  get_observations: async function (listKey) {
    panic_if_not_type("string", listKey);
    const [wasSuccessful, responseData] = await this.make_request(`${backendURLs.lists}?list=${listKey}`, {
      method: "GET"
    });

    if (!wasSuccessful) {
      return [];
    }

    panic_if_not_type("array", responseData.observations);
    return responseData.observations;
  },
  put_observation: async function (observation, listKey, token) {
    panic_if_not_type("string", listKey);
    panic_if_not_type("object", observation, observation.bird);
    panic_if_undefined(observation.unixTimestamp);
    const date = new Date(observation.unixTimestamp * 1000);
    const [wasSuccessful] = await this.make_request(`${backendURLs.lists}?list=${listKey}`, {
      method: "PUT",
      body: JSON.stringify({
        token,
        species: observation.bird.species,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      })
    });
    return wasSuccessful;
  }
};