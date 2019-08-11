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
    const editButton = (()=>
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
            return <AsyncIconButton icon="fas fa-times"
                                    title={`Poista ${props.bird.species} listasta`}
                                    titleClicked="Poistetaan listasta..."
                                    task={()=>props.callbackRemoveObservation(props.bird)}/>
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
                        {props.observation? props.observation.dateString : <>Ei havaintoa listassa</> }
                    </div>
                </div>

                {/* A button the user can press to e.g. add or remove this observation to/from
                  * their list.*/}
                {editButton}
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
