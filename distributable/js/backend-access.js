"use strict";

import { error, panic_if_undefined, warn, panic_if_not_type, panic } from "./assert.js";
import { Observation } from "./observation.js";
import { Bird } from "./bird.js";
const httpRequests = Object.freeze({
  backendURLs: Object.freeze({
    observations: "./server/api/observations.php",
    metadata: "./server/api/metadata.php",
    lists: "./server/api/lists.php"
  }),
  send_request: function (url, params = {}) {
    panic_if_not_type("string", url);
    panic_if_not_type("object", params);
    return fetch(url, params).then(response => {
      if (!response.ok) {
        throw response.statusText;
      }

      return response.json();
    }).then(ticket => {
      if (!ticket) {
        return [false, null];
      }

      if (!ticket.valid) {
        throw ticket.message ? ticket.message : "unknown";
      }

      return [true, ticket.data];
    }).catch(errorMessage => {
      error(`Client-to-server query for "${url}" failed. Cause: ${errorMessage}`);
      return [false, null];
    });
  },
  delete_observation: async function (listKey, observation) {
    panic_if_undefined(observation, observation.unixTimestamp, observation.bird);
    const [wasSuccessful] = await this.send_request(`${this.backendURLs.observations}?list=${listKey}`, {
      method: "DELETE",
      body: JSON.stringify({
        species: observation.bird.species
      })
    });
    return wasSuccessful;
  },
  get_view_key: async function (listKey) {
    panic_if_not_type("string", listKey);
    const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.lists}?list=${listKey}`, {
      method: "GET"
    });

    if (wasSuccessful) {
      const data = (() => {
        try {
          return JSON.parse(responseData);
        } catch (error) {
          panic(`Failed to parse a server response. Error: ${error}`);
          return false;
        }
      })();

      panic_if_not_type("string", data.viewKey);
      return data.viewKey;
    } else {
      panic("Failed to fetch the view key from the server.");
    }
  },
  get_known_birds_list: async function () {
    const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.metadata}?type=knownBirds`, {
      method: "GET"
    });

    if (wasSuccessful) {
      const birds = (() => {
        try {
          return JSON.parse(responseData);
        } catch (error) {
          panic(`Failed to parse a server response. Error: ${error}`);
          return false;
        }
      })();

      panic_if_not_type("array", birds);
      return birds.map(b => Bird({
        order: b.order,
        family: b.family,
        species: b.species,
        thumbnailUrl: (() => {
          if (!Bird.thumbnailFilename[b.species]) {
            return null;
          }

          return "./img/bird-thumbnails/" + Bird.thumbnailFilename[b.species];
        })()
      }));
    } else {
      return [];
    }
  },
  get_backend_limits: async function () {
    const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.metadata}?type=backendLimits`, {
      method: "GET"
    });

    if (wasSuccessful) {
      try {
        return JSON.parse(responseData);
      } catch (error) {
        panic(`Failed to parse a server response. Error: ${error}`);
        return false;
      }
    } else {
      return {};
    }
  },
  get_observations: async function (listKey, knownBirds = []) {
    panic_if_not_type("string", listKey);
    panic_if_not_type("object", knownBirds);
    const [wasSuccessful, responseData] = await this.send_request(`${this.backendURLs.observations}?list=${listKey}`, {
      method: "GET"
    });

    if (wasSuccessful) {
      const observationData = (() => {
        try {
          return JSON.parse(responseData);
        } catch (error) {
          panic(`Failed to parse a server response. Error: ${error}`);
          return false;
        }
      })();

      panic_if_not_type("array", observationData);
      observationData.filter(obs => !is_known_bird_species(obs.species)).forEach(unknownObs => {
        warn(`Unknown bird in the observation list: ${unknownObs.species}. Skipping it.`);
      });
      return observationData.filter(obs => is_known_bird_species(obs.species)).map(obs => Observation({
        bird: knownBirds.find(b => b.species === obs.species),
        date: new Date(obs.timestamp * 1000)
      }));
    } else {
      return [];
    }

    function is_known_bird_species(species) {
      return Boolean(knownBirds.map(b => b.species.toLowerCase()).includes(species.toLowerCase()));
    }
  },
  put_observation: async function (listKey, observation) {
    panic_if_not_type("string", listKey);
    panic_if_not_type("object", observation, observation.bird);
    panic_if_undefined(observation.unixTimestamp);
    const [wasSuccessful] = await this.send_request(`${this.backendURLs.observations}?list=${listKey}`, {
      method: "PUT",
      body: JSON.stringify({
        species: observation.bird.species,
        timestamp: observation.unixTimestamp
      })
    });
    return wasSuccessful;
  },
  create_new_list: async function () {
    const [wasSuccessful, responseData] = await this.send_request(this.backendURLs.lists, {
      method: "POST"
    });

    if (wasSuccessful) {
      try {
        const jsonData = JSON.parse(responseData);

        if (typeof jsonData.keys !== "object" || typeof jsonData.keys.viewKey !== "string" || typeof jsonData.keys.editKey !== "string") {
          return false;
        }

        return jsonData.keys;
      } catch (error) {
        panic(`Failed to parse a server response. Error: ${error}`);
        return false;
      }
    } else {
      return false;
    }
  }
});
export async function BackendAccess(listKey) {
  const backendLimits = Object.freeze((await httpRequests.get_backend_limits()));

  const hasEditRights = (() => {
    return Boolean(listKey.length > 15);
  })();

  const viewKey = await (async () => {
    if (!hasEditRights) {
      return listKey;
    }

    return httpRequests.get_view_key(listKey);
  })();
  const localCache = {
    knownBirds: Object.freeze([]),
    observations: Object.freeze([]),
    refresh: async function () {
      await this.refresh_known_birds();
      await this.refresh_observations();
    },
    refresh_known_birds: async function () {
      this.knownBirds = await httpRequests.get_known_birds_list();
    },
    refresh_observations: async function () {
      this.observations = await httpRequests.get_observations(listKey, this.knownBirds);
    }
  };
  await localCache.refresh();
  const publicInterface = {
    hasEditRights,
    viewKey,
    known_birds: () => localCache.knownBirds,
    observations: () => localCache.observations,
    backend_limits: () => backendLimits,
    refresh_observation_cache: async () => {
      await localCache.refresh_observations();
    },
    delete_observation: async existingObservation => {
      panic_if_not_type("string", listKey);
      panic_if_not_type("object", existingObservation);
      const obsIdx = localCache.observations.findIndex(obs => obs.bird.species === existingObservation.bird.species);

      if (obsIdx === -1) {
        error("Can't delete an unknown observation.");
        return false;
      }

      const deletedSuccessfully = await httpRequests.delete_observation(listKey, existingObservation);

      if (!deletedSuccessfully) {
        error("Failed to delete an observation.");
        return false;
      }

      localCache.observations.splice(obsIdx, 1);
      return true;
    },
    put_observation: async newObservation => {
      panic_if_undefined(newObservation, newObservation.bird, newObservation.unixTimestamp);
      const obsIdx = localCache.observations.findIndex(obs => obs.bird.species === newObservation.bird.species);
      const postedSuccessfully = await httpRequests.put_observation(listKey, newObservation);

      if (!postedSuccessfully) {
        error("Failed to POST an observation.");
        return false;
      }

      localCache.observations.splice(obsIdx, obsIdx !== -1, newObservation);
      return true;
    }
  };
  return publicInterface;
}

BackendAccess.create_new_list = () => httpRequests.create_new_list();

BackendAccess.get_known_birds_list = () => httpRequests.get_known_birds_list();