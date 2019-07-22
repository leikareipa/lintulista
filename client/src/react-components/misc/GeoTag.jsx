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

    /// TODO: Support place strings provided as a latitude/longitude pair.
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${props.place.replace(" ", "+")}`;

    return <div className="GeoTag" title={props.place}>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-map-marker-alt"></i>
                </a>
           </div>
}

GeoTag.validate_props = function(props)
{
    panic_if_undefined(props.place);

    return;
}
