/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert,
        ll_assert_native_type} from "./assert.js";
import {start_app} from "./render/render-app.js";

const routes = [
    { // View a list.
        url: new RegExp("^#[a-z]{9}/?"),
        go: route_list,
    },
    { // Default route for when no others match.
        url: /.*/,
        go: route_404,
    }
];

export function ll_hash_route(lintulistaUrl = "")
{
    ll_assert_native_type("string", lintulistaUrl);

    const route = routes.filter(r=>lintulistaUrl.match(r.url))[0];

    ll_assert_native_type("object", route);
    ll_assert_native_type("function", route.go);

    route.go(lintulistaUrl);

    return;
}

function route_list(url)
{
    const container = document.querySelector("#lintulista > #app-container");
    ll_assert(container, "Invalid DOM.");

    const keyRegexp = /#([a-z]{9})/;
    ll_assert(url.match(keyRegexp), "Invalid list URL.");

    const startupOptions = {
        // If no parameters are appended here from the URL, defaults will be used.
    };

    // See if the URL specifies any startup options.
    {
        // Language
        for (const language of ["fiFI", "enEN", "lat"])
        {
            if (url.match(new RegExp(`\/${language}\/?`))) {
                startupOptions.language = language;
            }
        }

        // 100 Lajia mode.
        if (url.match(/\/100\/?/)) startupOptions.is100LajiaMode = true;
    }

    const listKey = url.match(keyRegexp)[1];
    start_app(listKey, container, startupOptions);

    return;
}

function route_404(url)
{
    console.log("oops")
    return;
}
