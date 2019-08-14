# Lintulista
*(Coming.)*

# Usage
*(Coming.)*

## End-user
*(Coming.)*

## Developer
*(Coming.)*

### Setting up

#### Building
The app depends on Babel for JSX and minification. You can install the required dependencies by executing the following in the repo's root:
```
$ npm install @babel/core @babel/cli @babel/preset-react babel-preset-minify
```

Once you have Babel installed as per above, you can build the app with
```
$ cd build
$ ./build-dev.sh
```

substituting `build-dev.sh` with `build-release.sh` for release builds. The compiled files will be placed in the [client/dist/](client/dist/) directory, from which [index.html](index.html) and [view.html](view.html) will pick them up as appropriate.

#### Database
*(Coming.)*

# Project status
The project is currently in early beta.

## Browser compatibility
Here are rough estimates of the required browser versions to run the app. Browsers marked with "No" are not compatible at all.

<table>
    <tr>
        <th align="center" width="90">
            <img alt="Chrome" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_24x24.png">
            <br>Chrome
        </th>
        <th align="center" width="90">
            <img alt="Opera" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_24x24.png">
            <br>Opera
        </th>
        <th align="center" width="90">
            <img alt="Safari" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_24x24.png">
            <br>Safari
        </th>
        <th align="center" width="90">
            <img alt="Firefox" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_24x24.png">
            <br>Firefox
        </th>
        <th align="center" width="90">
            <img alt="Edge" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_24x24.png">
            <br>Edge
        </th>
        <th align="center" width="90">
            <img title="Internet Explorer" alt="Internet Explorer" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_6/internet-explorer_6_24x24.png">
            <br>IE
        </th>
    </tr>
    <tr>
        <td align="center"><i>TBA</i></td>
        <td align="center"><i>TBA</i></td>
        <td align="center"><i>TBA</i></td>
        <td align="center">No</td>
        <td align="center">No</td>
        <td align="center">No</td>
    </tr>
</table>

# Credits
The bird images used in Lintulista come from [Luontoportti](http://www.luontoportti.com/).

The browser icons used in the Browser compatibility section, above, come from [alrra](https://github.com/alrra)'s [Browser Logos](https://github.com/alrra/browser-logos) repository.
