/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, throw_if_not_true} from "../../assert.js";
import {BirdThumbnail} from "../misc/BirdThumbnail.js";
import {LL_Observation} from "../../observation.js";
import {LL_Bird} from "../../bird.js";
import {tr} from "../../translator.js";

// Displays information about an observation - like a thumbnail of the species, the species
// name, and the date of the observation.
//
// The observation that this card represents is to be provided via props.observation as an
// LL_Observation() object.
//
// If props.isGhost is set to true, the card will be displated as a "ghost". A ghost card is
// intended to serve as a placeholder for an actual observation - i.e. it's an observation
// that has not yet been made, but could be in the future.
//
//     For ghost cards, no bird thumbnail or observation date will be shown.
//
export function ObservationCard(props = {})
{
    ObservationCard.validate_props(props);

    const language = "fiFI";

    return <div className={`ObservationCard${props.isGhost? "Ghost" : ""}`}>

        {
            props.isGhost
            ? <div className="BirdThumbnail"/>
            : <BirdThumbnail species={props.observation.species}/>
        }

        {/* Displays facts about the observation; like what was observed and when.*/}
        <div className="observation-info">

            <div className="bird-name">
                {props.observation.species}
            </div>

            <div className="date">
                {
                    props.isGhost
                    ? tr("100 Species Challenge")
                    : LL_Observation.date_string(props.observation)
                }
            </div>
            
        </div>
    
    </div>
}

ObservationCard.defaultProps =
{
    isGhost: false,
}

ObservationCard.validate_props = function(props)
{
    panic_if_not_type("object", props, props.observation);
    panic_if_not_type("boolean", props.isGhost);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
ObservationCard.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    const bird = Bird({species:"Naakka", family:"", order:""});

    // Test a normal ObservationCard.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ObservationCard,
            {
                observation: Observation({bird, date:new Date(0)}),
                isGhost: false,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.querySelector(".ObservationCard") !== null),
                           ()=>(container.querySelector(".BirdThumbnail") !== null),
                           ()=>(container.querySelector(".observation-info") !== null),
                           ()=>(container.querySelector(".observation-info > .bird-name") !== null),
                           ()=>(container.querySelector(".observation-info > .bird-name").textContent === bird.species),
                           ()=>(container.querySelector(".observation-info > .date") !== null),
                           ()=>(container.querySelector(".observation-info > .date").textContent === "1. tammikuuta 1970")]);
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

    // Test a ghost ObservationCard.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ObservationCard,
            {
                observation: Observation({bird, date:new Date(0)}),
                isGhost: true,
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.querySelector(".ObservationCardGhost") !== null),
                           ()=>(container.querySelector(".BirdThumbnail") !== null),
                           ()=>(container.querySelector(".observation-info") !== null),
                           ()=>(container.querySelector(".observation-info > .bird-name") !== null),
                           ()=>(container.querySelector(".observation-info > .bird-name").textContent === bird.species),
                           ()=>(container.querySelector(".observation-info > .date") !== null),
                           ()=>(container.querySelector(".observation-info > .date").textContent === "100 Lajia -haaste")]);
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
