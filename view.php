<!DOCTYPE html>
<html>
    <head>
        <title>Lintulista!</title>
        <meta name="referrer" content="no-referrer">
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <link href="https://fonts.googleapis.com/css?family=Nunito|Delius|Beth+Ellen&display=swap" rel="stylesheet"> 
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.1/css/all.css" integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="view.css">
        <link rel="stylesheet" type="text/css" href="view-animations.css">
        <link rel="stylesheet" type="text/css" href="view-responsive.css">
    </head>
    <body>
        <div id="content">

            <div id="header">
                <div id="app-title">
                    <span id="app-name">lintulista <i class="fas fa-feather-alt fa-sm" style="transform: translateY(-17px) translateX(-20px);"></i></span>
                </div>
            </div>

            <div id="observation-list"></div>

            <footer>
                <a href="https://www.github.com/leikareipa/lintulista">Lintulista</a>
                &bull; Designed & developed by <a href="http://www.tarpeeksihyvaesoft.com">Tarpeeksi Hyvae Soft</a> 2019
                &bull; Includes content from <a href="http://www.luontoportti.com">LuontoPortti</a>
            </footer>
            
        </div>

        <script src="https://unpkg.com/react@16.8.6/umd/react.development.js" crossorigin="anonymous"></script>
        <script src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js" crossorigin="anonymous"></script>
        <script type="module">
            import {render_observation_list} from "./client/dist/render/render-observation-list.js";
            import {backend_access} from "./client/dist/backend-access.js";
            import {error} from "./client/dist/assert.js";

            // We expect a ?list= parameter to be provided in the URL that gives us the key
            // of the lsit we are expected to operate on. 
            const listKey = `<?php echo $_GET["list"]; ?>`.split("/").pop();

            // Start the app.
            (async()=>
            {
                if (!listKey)
                {
                    error("A list key must be provided.");
                    return;
                }

                const backend = await backend_access(listKey);

                // If viewing with an edit key, hide it from the address bar to prevent its leaking
                // to an over-the-shoulder viewer or the like.
                if (backend.hasEditRights)
                {
                    window.history.replaceState({}, document.title, window.location.pathname.replace(listKey, ""));
                }

                render_observation_list(backend);
            })();
        </script>
    </body>
</html>
