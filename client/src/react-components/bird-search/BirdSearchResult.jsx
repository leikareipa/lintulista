"use strict";

import {panic_if_not_type} from "../../assert.js"
import {AsyncIconButton} from "../buttons/AsyncIconButton.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

// An element displaying information about an individual search result.
export function BirdSearchResult(props = {})
{
    BirdSearchResult.validate_props(props);

    // A button element the user can press to add or remove the search result to/from the
    // list, depending on whether they already have an observation of this bird on their
    // list.
    const addAndRemoveButton = (()=>
    {
        if (!props.userHasEditRights)
        {
            return <></>
        }

        if (!props.observation)
        {
            return <AsyncIconButton icon="fas fa-plus"
                                    title={`Lisää listaan ${props.bird.species}`}
                                    titleClicked="Lisätään listaan..."
                                    task={()=>props.callbackAddObservation(props.bird)}/>
        }
        else
        {
            return <AsyncIconButton icon="fas fa-eraser"
                                    title={`Poista listasta ${props.bird.species}`}
                                    titleClicked="Poistetaan listasta..."
                                    task={()=>props.callbackRemoveObservation(props.bird)}/>
        }
    })();

    // If the bird of the search result has been observed, this element displays the date
    // of that observation and a button that lets the user change that date.    
    const dateElement = (()=>
    {
        if (props.observation)
        {
            return <>
                       <i className="fas fa-pen fa-xs"
                          style={{transform:"translateY(-2px)",marginRight:"5px", cursor:"pointer", color:"rgba(0, 0, 0, 0.6)"}}
                          title="Muuta päivämäärää"
                          onClick={()=>props.callbackChangeObservationDate(props.bird)}/>
                       {props.observation.dateString}
                   </>
        }
        else
        {
            return <>Ei havaintoa listassa</>
        }
    })();

    return <div className={`BirdSearchResult ${!props.observation? "not-previously-observed" : ""}`.trim()}>

                <BirdThumbnail bird={props.bird}
                               useLazyLoading={false}/>

                {/* Displays basic information about the search result; like whether the
                  * user has already observed this species.*/}
                <div className="card">
                    <div className="bird-name">
                        {props.bird.species}
                    </div>
                    <div className="date-observed">
                        {dateElement}
                    </div>
                </div>

                {/* A button the user can press to add or remove this observation to/from
                  * their list.*/}
                {addAndRemoveButton}
           </div>
}

BirdSearchResult.defaultProps =
{
    userHasEditRights: false,
}

BirdSearchResult.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("function", props.callbackAddObservation, props.callbackRemoveObservation);

    return;
}
