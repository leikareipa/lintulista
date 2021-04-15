/*
 * 2021 Tarpeeksi Hyvae Soft
 * 
 * Software: Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "./assert.js";
import {LL_Action} from "./action.js";

export const lla_route_hash_url = LL_Action({
    act: async({lintulistaUrl, routes})=>
    {
        ll_assert_native_type("string", lintulistaUrl);
        ll_assert_native_type("object", routes)

        const route = routes.filter(r=>lintulistaUrl.match(r.url))[0];

        ll_assert_native_type("object", route);
        ll_assert_native_type("function", route.go);

        await route.go(lintulistaUrl);
    },
    on_error: async({lintulistaUrl, routes})=>
    {
        const route_404 = routes[routes.length - 1];

        ll_assert_native_type("object", route_404);
        ll_assert_native_type("function", route_404.go);

        route_404.go(lintulistaUrl);
    }
});
