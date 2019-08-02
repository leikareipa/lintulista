/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";

// Displays a map marker with a link to a map asset.
//
// A place name should be provided via props.place; e.g. props.place = "Lauttasaari, Helsinki".
// When the GeoTag is hovered, a title string matching that in props.place will be shown. When
// the GeoTag is clicked, a relevant map resource is loaded to display that location on a map.
export function GeoTag(props = {})
{
    GeoTag.validate_props(props);

    if (!props.place ||
        (typeof props.place !== "string") ||
        !props.place.trim().length)
    {
        return <></>
    }

    return <div className="GeoTag" title={props.place}>
                <a href={GeoTag.map_link_from_string(props.place)} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-map-marker-alt"/>
                </a>
           </div>
}

GeoTag.map_link_from_string = function(string = "")
{
    if ((typeof string !== "string") ||
        !string.trim().length)
    {
        return null;
    }

    /// TODO: Support place strings provided as a latitude/longitude pair.
    return `https://www.google.com/maps/search/?api=1&query=${string.trim().replace(/\s/g, "+")}`;
}

GeoTag.validate_props = function(props)
{
    panic_if_undefined(props.place);

    return;
}
