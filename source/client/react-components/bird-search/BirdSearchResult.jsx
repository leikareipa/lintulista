"use strict";

import {ll_assert_native_type, throw_if_not_true} from "../../assert.js"
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
            if (props.userHasEditRights)
            {
                return <span className="edit-date"
                             onClick={()=>props.cbChangeObservationDate(props.bird)}>
                           
                    {LL_Observation.date_string(props.observation)}
                
                </span>
            }
            else
            {
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

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
BirdSearchResult.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    // Search result of a bird of whom there is a previous observation but without us having
    // edit rights to that observation.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const bird = Bird({species:"Alli", family:"", order:""});
            const observation = Observation({bird:Bird({species:"Alli", family:"", order:""}), date:new Date(0)});

            const unitElement = React.createElement(BirdSearchResult,
            {
                bird,
                observation,
                userHasEditRights: false,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const searchResult = container.querySelector(".BirdSearchResult");
        const birdThumbnail = container.querySelector(".BirdThumbnail");
        const infoCard = container.querySelector(".card");
        const infoCardBirdName = infoCard.querySelector(".bird-name");
        const infoCardObservationDate = infoCard.querySelector(".date-observed");
        const addRemoveButton = container.querySelector(".AsyncIconButton");
        const changeDate = infoCardObservationDate.querySelector(".edit-date");

        throw_if_not_true([()=>(searchResult !== null),
                           ()=>(birdThumbnail !== null),
                           ()=>(addRemoveButton === null),// We have no edit rights, so we shouldn't have a means to edit.
                           ()=>(changeDate === null),// We have no edit rights, so we shouldn't have a means to edit.
                           ()=>(infoCard !== null),
                           ()=>(infoCardBirdName !== null),
                           ()=>(infoCardObservationDate !== null),
                           ()=>(infoCardBirdName.textContent === "Alli"),
                           ()=>(infoCardObservationDate.textContent === "1. tammikuuta 1970")]);
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

    // Search result of a bird of whom there is a previous observation and with the user having
    // edit rights to that observation.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const bird = Bird({species:"Alli", family:"", order:""});
            const observation = Observation({bird:Bird({species:"Alli", family:"", order:""}), date:new Date(0)});

            const unitElement = React.createElement(BirdSearchResult,
            {
                bird,
                observation,
                userHasEditRights: true,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const searchResult = container.querySelector(".BirdSearchResult");
        const birdThumbnail = container.querySelector(".BirdThumbnail");
        const infoCard = container.querySelector(".card");
        const infoCardBirdName = infoCard.querySelector(".bird-name");
        const infoCardObservationDate = infoCard.querySelector(".date-observed");
        const addRemoveButton = container.querySelector(".AsyncIconButton");
        const changeDate = infoCardObservationDate.querySelector(".edit-date");

        throw_if_not_true([()=>(searchResult !== null),
                           ()=>(birdThumbnail !== null),
                           ()=>(addRemoveButton !== null),
                           ()=>(infoCard !== null),
                           ()=>(changeDate !== null),
                           ()=>(infoCardBirdName !== null),
                           ()=>(infoCardObservationDate !== null),
                           ()=>(infoCardBirdName.textContent === "Alli"),
                           ()=>(infoCardObservationDate.textContent === "1. tammikuuta 1970"),
                           ()=>(addRemoveButton.getAttribute("title").startsWith("Poista"))]);
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

    // Search result of a bird of whom there is not a previous observation and with the user having
    // edit rights to add the bird as a new observation.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const bird = Bird({species:"Alli", family:"", order:""});

            const unitElement = React.createElement(BirdSearchResult,
            {
                bird,
                userHasEditRights: true,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const searchResult = container.querySelector(".BirdSearchResult");
        const birdThumbnail = container.querySelector(".BirdThumbnail");
        const infoCard = container.querySelector(".card");
        const infoCardBirdName = infoCard.querySelector(".bird-name");
        const infoCardObservationDate = infoCard.querySelector(".date-observed");
        const addRemoveButton = container.querySelector(".AsyncIconButton");
        const changeDate = infoCardObservationDate.querySelector(".edit-date");

        throw_if_not_true([()=>(searchResult !== null),
                           ()=>(birdThumbnail !== null),
                           ()=>(addRemoveButton !== null),
                           ()=>(infoCard !== null),
                           ()=>(changeDate === null),// There is no observation, so we shouldn't have means to edit it.
                           ()=>(infoCardBirdName !== null),
                           ()=>(infoCardObservationDate !== null),
                           ()=>(infoCardBirdName.textContent === "Alli"),
                           ()=>(infoCardObservationDate.textContent === "Ei havaintoa"),
                           ()=>(addRemoveButton.getAttribute("title").startsWith("Lisää"))]);
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

    // Search result of a bird of whom there is not a previous observation.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const bird = Bird({species:"Alli", family:"", order:""});

            const unitElement = React.createElement(BirdSearchResult,
            {
                bird,
                userHasEditRights: false,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        const searchResult = container.querySelector(".BirdSearchResult");
        const birdThumbnail = container.querySelector(".BirdThumbnail");
        const infoCard = container.querySelector(".card");
        const infoCardBirdName = infoCard.querySelector(".bird-name");
        const infoCardObservationDate = infoCard.querySelector(".date-observed");
        const addRemoveButton = container.querySelector(".AsyncIconButton");
        const changeDate = infoCardObservationDate.querySelector(".edit-date");

        throw_if_not_true([()=>(searchResult !== null),
                           ()=>(birdThumbnail !== null),
                           ()=>(infoCard !== null),
                           ()=>(addRemoveButton === null),// There's no observation, so we shouldn't have a means to edit it.
                           ()=>(changeDate === null),// There's no observation, so we shouldn't have a means to edit it.
                           ()=>(infoCardBirdName !== null),
                           ()=>(infoCardObservationDate !== null),
                           ()=>(infoCardBirdName.textContent === "Alli"),
                           ()=>(infoCardObservationDate.textContent === "Ei havaintoa")]);
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

    return true;
}
