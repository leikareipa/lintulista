"use strict";

import {ll_assert_native_type} from "../../assert.js"
import {AsyncIconButton} from "../buttons/AsyncIconButton.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {LL_Observation} from "../../observation.js";
import {tr} from "../../translator.js";

// An element displaying information about an individual bird search result.
//
// The bird of which this is a search result of is to be provided via props.bird as an
// LL_Bird() object.
//
// If the user's list of observations already includes this bird, that observation is
// to be provided via props.observation as an LL_Observation() object; otherwise, this
// prop can be set to null.
//
//     If the user has previously observed this bird, the search result display will be
//     modified to include options to alter the observation - like it's date and so on.
//
// A callback for when the user asks to add the bird to their list of observations is to
// be provided via props.cbAddObservation. The function will be called with one parameter:
// props.bird.
//
// A callback for when the user asks to remove the bird from their list of observations
// is to be provided via props.cbRemoveObservation. The function will be called with one
// parameter: props.bird.
//
// A callback for when the user asks to change the date of the observation of which this
// is a search result of is to be provided via props.cbChangeObservationDate. The function
// §will be called with one parameter: props.bird.
//
export function BirdSearchResult(props = {})
{
    BirdSearchResult.validate_props(props);

    // A button element the user can press to add or remove the search result to/from the
    // list, depending on whether they already have an observation of this bird on their
    // list.
    const addAndRemoveButton = (()=>{
        if (!props.userHasEditRights) {
            return <></>
        }
        else if (!props.observation) {
            return <AsyncIconButton
                       icon="fas fa-plus"
                       title={tr("Add %1 to the list", props.bird.species)}
                       titleWhenClicked={tr("Adding...")}
                       task={()=>props.cbAddObservation(props.bird)}
                   />
        }
        else {
            return <AsyncIconButton
                       icon="fas fa-eraser"
                       title={tr("Remove %1 from the list", props.bird.species)}
                       titleWhenClicked={tr("Removing...")}
                       task={()=>props.cbRemoveObservation(props.bird)}
                   />
        }
    })();

    // If the bird of the search result has been observed, this element displays the date
    // of that observation and a button that lets the user change that date.    
    const dateElement = (()=>
    {
        if (props.observation)
        {
            if (props.userHasEditRights) {
                return <span className="edit-date"
                             onClick={()=>props.cbChangeObservationDate(props.bird)}>
                           
                    {LL_Observation.date_string(props.observation)}
                
                </span>
            }
            else {
                return <>
                    {LL_Observation.date_string(props.observation)}
                </>
            }
        }
        else
        {
            return <>
                {tr("No observation")}
            </>
        }
    })();

    return <div className={`BirdSearchResult ${!props.observation? "not-previously-observed" : ""}`.trim()}>

        <BirdThumbnail
            species={props.bird.species}
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
    ll_assert_native_type("object", props);
    ll_assert_native_type("boolean", props.userHasEditRights);
    ll_assert_native_type("function", props.cbAddObservation,
                                      props.cbRemoveObservation,
                                      props.cbChangeObservationDate);

    return;
}
