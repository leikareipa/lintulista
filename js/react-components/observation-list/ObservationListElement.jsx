"use strict";

export function ObservationListElement(props = {})
{
    return <div className="ObservationListElement">
               <img className="image" src={props.observation.bird.thumbnailUrl} />
               <span className="name">
                   {props.observation.bird.name}<br />
                   <span className="observation-details">
                       <i className="far fa-calendar-check" style={{color:"#c0c0c0"}}></i> {props.observation.dateString}
                   </span>
               </span>
           </div>
}
