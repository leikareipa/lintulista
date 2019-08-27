/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, throw_if_not_true} from "../../assert.js";
import {Bird} from "../../bird.js";

// For lazy image loading. The placeholder image we'll display when the real image is yet
// to be lazily loaded in.
const placeholderThumbnailUrl = "./client/assets/images/placeholder-bird-thumbnail.png";

// For lazy image loading. When we set as an image element's src the URL of a bird thumbnail,
// we'll append the URL to this set also; that way, we'll known which images have been loaded
// in the browser and thus which images don't need lazy loading enabled on subsequent renders.
const observedImages = new Set([placeholderThumbnailUrl]);

// Displays the given bird's thumbnail image. Uses lazy image loading, such that a placeholder
// image is used until the thumbnail element comes at least partly into the viewport, at which
// point the actual image is substituted.
//
// The bird whose thumbnail image is to be displayed should be provided via props.bird as a
// Bird() object.
//
// Lazy loading of the thumbnail image can be enabled/disabled via props.useLazyLoading.
//
export function BirdThumbnail(props = {})
{
    BirdThumbnail.validate_props(props);

    observedImages.add(props.bird.nullThumbnailUrl);

    const thumbnailRef = React.createRef();

    // For lazy image loading. We'll start the thumbnail URL with a placeholder image. Later,
    // once its DOM element becomes visible in the viewport, we'll switch the placeholder URL
    // for the actual image source.
    const [thumbnailSrc, setThumbnailSrc] = React.useState(()=>
    {
        if (props.useLazyLoading &&
            !observedImages.has(props.bird.thumbnailUrl))
        {
            return placeholderThumbnailUrl;
        }
        else
        {
            return props.bird.thumbnailUrl;
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
                    setThumbnailSrc(props.bird.thumbnailUrl);
                    intersectionObserver.disconnect();
                }
            });
        }
    });

    React.useEffect(()=>
    {
        if (thumbnailSrc === props.bird.thumbnailUrl)
        {
            mark_thumbnail_observed();
        }
    }, [thumbnailSrc]);

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
                thumbnailRef.current.setAttribute("src", props.bird.thumbnailUrl);
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
                src={thumbnailSrc}
                ref={thumbnailRef}/>

    function mark_thumbnail_observed()
    {
        observedImages.add(props.bird.thumbnailUrl);
    }
}

BirdThumbnail.defaultProps =
{
    useLazyLoading: true,
}

BirdThumbnail.validate_props = function(props)
{
    panic_if_not_type("object", props, props.bird);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
BirdThumbnail.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        const bird = Bird({species:"Test1", family:"", order:"", thumbnailUrl:"test-image.png"})

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(BirdThumbnail,
            {
                bird,
                useLazyLoading: false,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.childNodes.length === 1)]);

        const thumbnailElement = container.childNodes[0];

        throw_if_not_true([()=>(thumbnailElement.tagName.toLowerCase() === "img"),
                           ()=>(thumbnailElement.getAttribute("src") === "test-image.png"),
                           ()=>(thumbnailElement.getAttribute("referrerpolicy") === "no-referrer")]);
    }
    catch (error)
    {
        if (error === "assertion failure") return false;

        throw error;
    }
    finally
    {
        container.remove();
    }

    /// TODO: Test lazy loading of the thumbnail image.

    return true;
}
