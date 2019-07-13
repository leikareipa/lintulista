"use strict";

export function ObservationListElement(props = {})
{
    const timeString = String(props.observation.date.getHours()).padStart(2, "0") + ":" +
                       String(props.observation.date.getMinutes()).padStart(2, "0");

    const dateString = props.observation.date.getDate() + ". " +
                       (new Intl.DateTimeFormat("fi-FI", {month: "long"}).format(props.observation.date) + "ta") + " " +
                       props.observation.date.getFullYear();

    return <div className="ObservationListElement">
               <img className="image" src={props.observation.bird.thumbnailUrl} />
               <span className="name">
                   {props.observation.bird.name}<br />
                   <span className="observation-details">
                       <i className="far fa-calendar-check" style={{color:"#c0c0c0"}}></i> 1/{Math.floor(Math.random()*3)+1}:
                       <i className="far fa-clock" style={{marginLeft:"10px", color:"#c0c0c0"}}></i> {timeString} 
                       <i className="far fa-calendar" style={{marginLeft:"10px", color:"#c0c0c0"}}></i> {dateString} 
                   </span>
               </span>
               
           </div>
}

ObservationListElement.defaultProps =
{
    observation: null
}
