# Lintulista
Lintulista is a Finnish language web app for hobbyist birdwatchers to keep track of their sightings.

With an easy-to-use interface and emphasis on visual presentation, Lintulista offers an interesting and accessible way to record your sightings - a good alternative to plain Excel tables.

You can find Lintulista live on the web [here](http://www.tarpeeksihyvaesoft.com/lintulista/). Note that the app is currently in beta, so you may still encounter issues that will be absent in more mature versions.

**Features**
- Easy and convenient to use - no account creation or login required
- Visually compelling - sightings are displayed as images rather than as plain text
- Share your sightings with others via a URL
- Integrates BirdLife Finland's 100 Lajia challenge

# Code
Lintulista's code comes in two 'modules' if you will: the client, and the server. The client handles the end-user UI and so on, while the server takes care of backend duties like managing access to the database.

The client, the code for which you'll find under [client/](client/), is written with JavaScript, and uses the React library for most of the UI functionality.

The server, the code for which you'll find under [server/](server/), is written with PHP of up to version 7.0.

# Usage
This section describes how to put Lintulista into use, either as an end-user or a developer.

For instance, you'll find instructions here on how to set up and deploy Lintulista on a server.

## End-user
You can find Lintulista's end-user documentation in the [guide/](guide/) directory; noting that the documentation is in Finnish.

## Developer

### Setting up

#### Building
Lintulista depends on Babel for JSX and minification. You can install the required dependencies by executing the following in the repo's root:
```
$ npm install @babel/core @babel/cli @babel/preset-react babel-preset-minify
```

Once you have Babel installed as per above, you can build Lintulista with
```
$ cd build
$ ./build-dev.sh
```

substituting `build-dev.sh` with `build-release.sh` for release builds. The compiled files will be placed in the [client/dist/](client/dist/) directory, from which [index.html](index.html) and [view.php](view.php) will pick them up as appropriate.

#### Database
Lintulista uses a MySQL database for storing user-generated data.

##### Credentials
You are expected to provide the database credentials in `lintulista-sql.json`, which is to take the following form:
```
{
	"host": "...",
	"user": "...",
	"password": "...",
	"database": "...",
    "pepper": "..."
}
```

The first four properties correspond to the parameters to PHP's `mysqli_connect()`. The last property, `pepper`, which you should also provide, is a string used to pepper certain hashes.

The path to the credentials file can be set in [server/database.php](server/database.php).

##### Tables
The data are laid out in four tables, as described below.

**Table 1: lintulista_lists**. Stores metadata about each user-created observation list.

| Field        | Type                  | Null | Key | Default | Extra          |
|--------------|-----------------------|------|-----|---------|----------------|
| list_id      | mediumint(8) unsigned | NO   | PRI | NULL    | auto_increment |
| view_key     | varchar(9)            | NO   | UNI | NULL    |                |
| edit_key     | varchar(60)           | NO   | UNI | NULL    |                |
| creator_hash | text                  | NO   |     | NULL    |                |

Fields:
- list_id: Running row id.
- view_key: An identifier with which the list's observations can be viewed (but not edited). This is provided by the user as a URL parameter when accessing the list.
- edit_key: An identifier with which the list's observations can be both viewed and edited. This is provided by the user as a URL parameter when accessing the list.
- creator_hash: An anonymized identifier of the list's creator; a substring of the hash of remote IP + pepper. Intended not to identify an individual but to give some idea of where the list originated, relative to the other lists.

**Table 2: lintulista_observations**. Stores observations added by users across all lists.

| Field     | Type                  | Null | Key | Default | Extra          |
|-----------|-----------------------|------|-----|---------|----------------|
| id        | int(10) unsigned      | NO   | PRI | NULL    | auto_increment |
| list_id   | mediumint(8) unsigned | NO   | MUL | NULL    |                |
| timestamp | bigint(20)            | NO   |     | NULL    |                |
| species   | text                  | NO   |     | NULL    |                |

Fields:
- id: Running row id.
- list_id: Corresponds to a list_id in **lintulista_lists**, identifying the list to which this observation belongs.
- timestamp: A Unix timestamp (seconds from epoch) for when this observation was entered into the database.
- species: A string giving the name of the species observed (e.g. "Idänuunilintu"). This must be a species name recognized by Lintulista.

**Tables 3, 4: lintulista_event_log, lintulista_error_log**. For the developer; stores information about events and errors related to the user's interaction with Lintulista. Since, depending on the type of activity, the error log might grow considerably larger than the event log, for which reason they've been separated into their own tables. The table layout is identical.

| Field          | Type                  | Null | Key | Default | Extra          |
|----------------|-----------------------|------|-----|---------|----------------|
| id             | int(10) unsigned      | NO   | PRI | NULL    | auto_increment |
| timestamp      | int(10) unsigned      | NO   |     | NULL    |                |
| event_id       | tinyint(3) unsigned   | NO   |     | NULL    |                |
| target_list_id | mediumint(8) unsigned | YES  |     | NULL    |                |

Fields:
- id: Running row id.
- timestamp: A Unix timestamp (seconds from epoch) for when this log entry was entered into the database. Stored as a 4-byte int to save space.
- event_id: A code identifying the event/error. See [server/database.php](server/database.php) for a list of the codes.
- target_list_id: Corresponds to a list_id in **lintulista_lists**, identifying the list of which this log entry is about. Can be NULL if e.g. no particular list was implicated, such as when logging the error of a user attempting to access a list using an invalid key.

#### The .htaccess file
Lintulista comes with a pre-configured Apache `.htaccess` file for URL rewriting.

For instance, the end-user can provide the URL `/lintulista/view.php?list=abc` as `/lintulista/katsele/abc` given the rewrite rules provided in this file.

You may need to adapt the file to fit your particular web hosting etc.

#### Deploying
To deploy Lintulista on a server, copy into a directory on the server the following files (maintaining the directory structure):
- client/dist/*
- client/assets/*
- server/*
- guide/*
- view.php
- view-*.css
- index.html
- index-*.css
- .htaccess

### Server-to-client API
The server provides the client a REST-like API for interacting with the database.

For instance, to add an observation to the list `abc`, the client will issue a PUT request to `/server/api/observations.php?list=abc`, with the observation data in the request body.

The API is documented in-source under [server/api/](server/api/).

You can find the client-side API code in [client/src/backend-access.js](client/src/backend-access.js).

#### Keys
A given list in the database is identified by either of a set of two key strings: a view key, and an edit key.

The view key can be used to GET public data associated with a list, such as its observations. The edit key can be used to GET, PUT, DELETE, etc. data associated with the list.

In other words, the view key identifies a particular list and grants the client read access to it; while the edit key identifies a list and grants the client both read and write access to that list.

When the client interacts with the API, it's expected to provide the key via the `list` URL parameter.

For instance, to request all observations in a particular list, the client would send a GET request to `/server/api/observations.php?list=abc`, where `abc` is the list's view or edit key (since this is a GET request, both keys are valid).

GET requests using an invalid/unrecognized key will in most cases return purposefully-generated random but superficially valid data.

Requests to modify data using a read-only view key will in most cases be silently ignored by the server.

# Project status
The project is currently in functional beta.

## Browser compatibility
Below are rough estimates of the required browser versions to run Lintulista. Browsers marked with "No" are expected to not be compatible at all.

<table>
    <tr>
        <th align="center" width="90">
            <img alt="Chrome" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_24x24.png">
            <br>Chrome
        </th>
        <th align="center" width="90">
            <img alt="Firefox" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_24x24.png">
            <br>Firefox
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
            <img alt="Edge" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_24x24.png">
            <br>Edge
        </th>
        <th align="center" width="90">
            <img title="Internet Explorer" alt="Internet Explorer" src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_6/internet-explorer_6_24x24.png">
            <br>IE
        </th>
    </tr>
    <tr>
        <td align="center">64</td>
        <td align="center">60</td>
        <td align="center">51</td>
        <td align="center">11.1</td>
        <td align="center">No</td>
        <td align="center">No</td>
    </tr>
</table>

# Credits
Lintulista uses the [React](https://reactjs.org/) library for most of its UI.

Lintulista makes use of certain fonts from [Google Fonts](https://fonts.google.com/): Nunito, Delius, and Beth Ellen.

The browser icons used in the Browser compatibility section, above, come from [alrra](https://github.com/alrra)'s [Browser Logos](https://github.com/alrra/browser-logos) repository.
