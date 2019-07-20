/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";

export function BirdThumbnail(props = {})
{
    BirdThumbnail.validate_props(props);

    // For lazy image loading.
    const thumbnailRef = React.createRef();
    const [thumbnailSrc, setThumbnailSrc] = React.useState("./client/assets/images/placeholder-bird-thumbnail.png");
    const intersectionObserver = new IntersectionObserver(([element])=>
    {
        if (element.isIntersecting)
        {
            setThumbnailSrc(props.bird.thumbnailUrl);
            intersectionObserver.disconnect();
        }
    });

    React.useEffect(()=>
    {
        intersectionObserver.observe(thumbnailRef.current);
    });

    return <img className="BirdThumbnail"
                referrerPolicy="no-referrer"
                title={props.bird.name}
                src={thumbnailSrc}
                ref={thumbnailRef}/>
}

BirdThumbnail.validate_props = function(props)
{
    panic_if_undefined(props.bird);

    return;
}
