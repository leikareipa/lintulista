"use strict";

export function ObservationListElement(props = {})
{
    // For lazy image loading.
    const thumbnailRef = React.createRef();
    const [thumbnailSrc, setThumbnailSrc] = React.useState("./client/assets/images/placeholder-bird-thumbnail.png");
    const intersectionObserver = new IntersectionObserver(([element])=>
    {
        if (element.isIntersecting)
        {
            setThumbnailSrc(props.observation.bird.thumbnailUrl);
            intersectionObserver.disconnect();
        }
    });

    React.useEffect(()=>
    {
        intersectionObserver.observe(thumbnailRef.current);
    });

    return <div className="ObservationListElement">
               <img className="image" title={props.observation.bird.name}
                                      src={thumbnailSrc}
                                      ref={thumbnailRef} />
               <span className="name">
                   {props.observation.bird.name}<br />
                   <span className="observation-details">{props.observation.dateString}</span>
               </span>
           </div>
}
