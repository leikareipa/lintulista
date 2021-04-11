/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {LL_Bird} from "../../bird.js";

// For lazy image loading. The placeholder image we'll display when the real image is yet
// to be lazily loaded in.
const placeholderThumbnailUrl = "./img/placeholder-bird-thumbnail.png";

// For lazy image loading. When we set as an image element's src the URL of a bird thumbnail,
// we'll append the URL to this set also; that way, we'll known which images have been loaded
// in the browser and thus which images don't need lazy loading enabled on subsequent renders.
const observedImages = new Set([placeholderThumbnailUrl]);

// Displays the given bird's thumbnail image. Uses lazy image loading, such that a placeholder
// image is used until the thumbnail element comes at least partly into the viewport, at which
// point the actual image is substituted.
//
// The bird species whose thumbnail image is to be displayed should be provided via
// props.species.
//
// Lazy loading of the thumbnail image can be enabled/disabled via props.useLazyLoading.
//
export function BirdThumbnail(props = {})
{
    BirdThumbnail.validate_props(props);

    const bird = LL_Bird(props.species);

    observedImages.add(LL_Bird.nullThumbnailUrl);

    const thumbnailRef = React.createRef();

    // For lazy image loading. We'll start the thumbnail URL with a placeholder image. Later,
    // once its DOM element becomes visible in the viewport, we'll switch the placeholder URL
    // for the actual image source.
    const [thumbnailSrc, setThumbnailSrc] = React.useState(()=>
    {
        if (props.useLazyLoading &&
            !observedImages.has(bird.thumbnailUrl))
        {
            return placeholderThumbnailUrl;
        }
        else
        {
            return bird.thumbnailUrl;
        }
    });

    const [intersectionObserver,] = React.useState(()=>
    {
        if (!props.useLazyLoading)
        {
            return null;
        }
        else
        {
            return new IntersectionObserver(([element])=>
            {
                if (element.isIntersecting)
                {
                    setThumbnailSrc(bird.thumbnailUrl);
                    intersectionObserver.disconnect();
                }
            });
        }
    });

    React.useEffect(()=>
    {
        if (thumbnailSrc === bird.thumbnailUrl)
        {
            mark_thumbnail_observed();
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

            // If the thumbnail element is already in the viewport, we don't need to engage
            // lazy loading.
            if (isInView)
            {
                mark_thumbnail_observed();
                thumbnailRef.current.setAttribute("src", bird.thumbnailUrl);
            }
            else if (intersectionObserver)
            {
                intersectionObserver.observe(thumbnailRef.current);
                return ()=>{intersectionObserver.disconnect()}
            }
        }
    }, [thumbnailRef.current]);

    return <img className="BirdThumbnail"
                referrerPolicy="no-referrer"
                draggable={false}
                src={thumbnailSrc}
                ref={thumbnailRef}/>

    function mark_thumbnail_observed()
    {
        observedImages.add(bird.thumbnailUrl);
    }
}

BirdThumbnail.defaultProps =
{
    useLazyLoading: true,
}

BirdThumbnail.validate_props = function(props)
{
    ll_assert_native_type("object", props);
    ll_assert_native_type("string", props.species);

    return;
}
