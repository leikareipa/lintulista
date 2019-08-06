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
// Lazy loading of the thumbnail image can get enabled/disabled via props.useLazyLoading.
//
export function BirdThumbnail(props = {})
{
    BirdThumbnail.validate_props(props);

    // For lazy image loading.
    const thumbnailRef = React.createRef();
    const [thumbnailSrc, setThumbnailSrc] = React.useState(props.useLazyLoading? "./client/assets/images/placeholder-bird-thumbnail.png"
                                                                               : props.bird.thumbnailUrl);

    const intersectionObserver = !props.useLazyLoading? null
                                                      : new IntersectionObserver(([element])=>
                                                        {
                                                            if (element.isIntersecting)
                                                            {
                                                                setThumbnailSrc(props.bird.thumbnailUrl);
                                                                intersectionObserver.disconnect();
                                                            }
                                                        });

    React.useEffect(()=>
    {
        if (props.useLazyLoading)
        {
            const isInView = (()=>
            {
                const viewHeight = window.innerHeight;
                const containerRect = thumbnailRef.current.getBoundingClientRect();

                return Boolean((containerRect.top > -containerRect.height) &&
                            (containerRect.top < viewHeight));
            })();

            if (isInView)
            {
                thumbnailRef.current.setAttribute("src", props.bird.thumbnailUrl);
            }
            else if (intersectionObserver)
            {
                intersectionObserver.observe(thumbnailRef.current);
                
                return ()=>{intersectionObserver.disconnect()}
            }
        }
    }, []);

    return <img className="BirdThumbnail"
                referrerPolicy="no-referrer"
                src={thumbnailSrc}
                ref={thumbnailRef}/>
}

BirdThumbnail.defaultProps =
{
    useLazyLoading: true,
}

BirdThumbnail.validate_props = function(props)
{
    panic_if_undefined(props.bird);

    return;
}
