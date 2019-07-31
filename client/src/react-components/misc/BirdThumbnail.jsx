/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined} from "../../assert.js";

// Displays the given bird's thumbnail image. Uses lazy image loading, such that a placeholder
// image is used until the thumbnail element comes at least partly into the viewport, at which
// point the actual image is substituted.
//
// The bird whose thumbnail image is to be displayed should be provided via props.bird as a
// bird() object.
//
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
        
        return ()=>{intersectionObserver.disconnect()}
    }, []);

    return <img className="BirdThumbnail"
                referrerPolicy="no-referrer"
                src={thumbnailSrc}
                ref={thumbnailRef}/>
}

BirdThumbnail.validate_props = function(props)
{
    panic_if_undefined(props.bird);

    return;
}
