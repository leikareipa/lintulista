"use strict";

import {ll_assert_native_type,
        ll_assert_type} from "../../assert.js"
import {lla_add_observation} from "../../action-add-observation.js";
import {lla_delete_observation} from "../../action-delete-observation.js";
import {lla_change_observation_date} from "../../action-change-observation-date.js";
import {AsyncIconButton} from "../buttons/AsyncIconButton.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {LL_Observation} from "../../observation.js";
import {LL_Bird} from "../../bird.js";
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
// A callback with which this component can close itself should be provided via
// props.cbCloseSelf.
//
export function BirdSearchResult(props = {})
{
    BirdSearchResult.validate_props(props);

    const observations = ReactRedux.useSelector(state=>state.observations);

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
                       task={add_bird_to_list}
                   />
        }
        else {
            return <AsyncIconButton
                       icon="fas fa-eraser"
                       title={tr("Remove %1 from the list", props.bird.species)}
                       titleWhenClicked={tr("Removing...")}
                       task={remove_bird_from_list}
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
                             onClick={change_observation_date}>
                           
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
                {tr("Not on the list yet")}
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

    // Called when the user selects to add the search result's bird to their list of
    // observations.
    async function add_bird_to_list()
    {
        await lla_add_observation.async({
            bird: props.bird,
            backend: props.backend
        });

        props.cbCloseSelf();
    }

    // Called when the user selects to remove the search result's bird from their list of
    // observations.
    async function remove_bird_from_list()
    {
        props.cbCloseSelf();

        await lla_delete_observation.async({
            bird: props.bird,
            backend: props.backend
        });
    }

    // Called when the user selects to change the date of an observation.
    async function change_observation_date()
    {
        props.cbCloseSelf();
        
        const observation = observations.find(obs=>(obs.species === props.bird.species));

        await lla_change_observation_date.async({
            observation,
            backend: props.backend
        });
    }
}

BirdSearchResult.defaultProps =
{
    userHasEditRights: false,
    observation: null,
}

BirdSearchResult.validate_props = function(props)
{
    ll_assert_native_type("object", props, props.backend);
    ll_assert_native_type("boolean", props.userHasEditRights);
    ll_assert_native_type("function", props.cbCloseSelf);
    ll_assert_type(LL_Bird, props.bird);

    return;
}
