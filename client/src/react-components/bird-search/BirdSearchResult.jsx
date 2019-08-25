"use strict";

import {panic_if_not_type} from "../../assert.js"
import {AsyncIconButton} from "../buttons/AsyncIconButton.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";

// An element displaying information about an individual bird search result.
//
// The bird of which this is a search result of is to be provided via props.bird as a
// Bird() object.
//
// If the user's list of observations already includes this bird, that observation is
// to be provided via props.observation as an Observation() object; otherwise, this prop
// can be set to null.
//
//     If the user has previously observed this bird, the search result display will be
//     modified to include options to alter the observation - like it's date and so on.
//
// A callback for when the user asks to add the bird to their list of observations is to
// be provided via props.callbackAddObservation. The function will be called with one
// parameter: props.bird.
//
// A callback for when the user asks to remove the bird from their list of observations
// is to be provided via props.callbackRemoveObservation. The function will be called with
// one parameter: props.bird.
//
// A callback for when the user asks to change the date of the observation of which this
// is a search result of is to be provided via props.callbackChangeObservationDate. The
// function will be called with one parameter: props.bird.
//
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
                                    title={`Lisää ${props.bird.species} listaan`}
                                    titleClicked="Lisätään listaan..."
                                    task={()=>props.callbackAddObservation(props.bird)}/>
        }
        else
        {
            return <AsyncIconButton icon="fas fa-eraser"
                                    title={`Poista ${props.bird.species} listasta`}
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
            if (props.userHasEditRights)
            {
                return <span className="edit-date"
                             onClick={()=>props.callbackChangeObservationDate(props.bird)}>
                                 {props.observation.dateString}
                       </span>
            }
            else
            {
                return <>
                           {props.observation.dateString}
                       </>
            }
        }
        else
        {
            return <>Ei havaintoa</>
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
    observation: null,
}

BirdSearchResult.validate_props = function(props)
{
    panic_if_not_type("object", props);
    panic_if_not_type("boolean", props.userHasEditRights);
    panic_if_not_type("function", props.callbackAddObservation, props.callbackRemoveObservation, callbackChangeObservationDate);

    return;
}
