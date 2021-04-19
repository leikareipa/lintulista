# lintulista-client

A front-end client component of Lintulista, complementing the [Lintulista server](https://www.github.com/leikareipa/lintulista-server).

You can find a live preview [here](https://www.tarpeeksihyvaesoft.com/lintulista/#samplelst/lang/enEN).

![](./images/screenshots/lintulista-beta.2.png)

# Overview

Lintulista is a full-stack web app for hobbyist birdwatchers to keep track of their sightings ("observations").

The client provides users a browser-based front-end view to the Lintulista back-end along with controls for adding, removing, and modifying observations.

# User's guide

On the heels of a large refactoring of the entire app, there's currently no user's guide available. Time permitting, one will be provided in the future.

# Deployment

## Preparation

The Lintulista client requires the [Lintulista server](https://www.github.com/leikareipa/lintulista-server) to be hosted and accessible; and the constant `lintulistaServerUrl` in [source/backend-request.js](./source/backend-request.js) must provide the server's URL. The server should additionally be configured to allow CORS requests from where the Lintulista client is hosted.

## Building the distributable

First, install the required packages:

```shell
$ npm install @babel/core @babel/cli @babel/preset-react babel-preset-minify
```

Then, build the client distributable:

```shell
$ ./build-dev.sh
```

You can substitute `build-dev.sh` with `build-release.sh` for release builds.

The built distributable files will be placed in the [distributable/](./distributable/) directory.

## Deploying the distributable

The Lintulista client distributable is static content.

Simply copy the [distributable/](./distributable/) folder onto your server, renaming it to something like `lintulista` as you see fit.

**Note:** The bird thumbnail images contained in the Lintulista client distributable are under various licenses. See [distributable/guide/images.html](./distributable/guide/images.html) for more information.

**Note:** By default, the [distributable/index.html](./distributable/index.html) file imports versions of React and Redux intended for development environments. For release environments, you may want to use the libraries' release versions:

- react.development.js &rarr; react.production.min.js
- react-dom.development.js &rarr; react-dom.production.min.js
- redux.js &rarr; redux.min.js
- react-redux.development.js &rarr; react-redux.min.js

# Credits
The bird thumbnails used in Lintulista come from a variety of authors. See [distributable/guide/images.html](./distributable/guide/images.html) for a full list.

Lintulista uses [React](https://reactjs.org/) for most of its UI, along with the Redux and React Redux libraries.

The [FileSaver.js](https://github.com/eligrey/FileSaver.js/) library is used in Lintulista for exporting data to a local CSV file.

Lintulista makes use of certain fonts from [Google Fonts](https://fonts.google.com/): Nunito, Delius, and Beth Ellen.

Certain icons from [Font Awesome](https://fontawesome.com/) are used in Lintulista's HTML.
