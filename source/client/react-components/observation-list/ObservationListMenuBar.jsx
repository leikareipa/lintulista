/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type, throw_if_not_true} from "../../assert.js";
import {Observation} from "../../observation.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";
import {Bird} from "../../bird.js";

// Renders a set of 'action elements' i.e. buttons and the like with which the user can
// control certain aspects of the observation list; like to select the order in which to
// sort the list's items, to search for entries in the list via a search bar, etc.
//
// This component needs access to Lintulista's backend, so a relevant backend() object
// should be provided via props.backend.
//
// A callback for when the user requests a new observation to be added to the list is to
// be provided via props.callbackOnAddObservation. It will be passed one parameter: a Bird()
// object describing the species of which the user wants an observation added.
//
// A callback for when the user requests an existing observation to be removed from the
// list is to be provided via props.callbackOnAddObservation. It will be passed one parameter:
// a Bird() object describing the species of which the user wants an observation added.
//
// A callback for when the user requests to change the list's sorting order is to be
// provided via props.callbackSetListSorting. It will be passed one parameter: a string
// describing the new sorting order.
//
// Whether the action bar is enabled (true) or disabled (false) can be given as a boolean
// via props.enabled. The only effect of this is that the component's class list will be
// appended with "enabled" or "disabled", accordingly.
//
export function ObservationListMenuBar(props = {})
{
    ObservationListMenuBar.validate_props(props);

    // Various media queries for in-code handling of responsive styling.
    const responsive =
    {
        // When the menu bar (and the page's layout in general) is large enough to
        // accommodate us showing tooltips on menu buttons.
        largeEnoughForTooltips: window.matchMedia("(min-width: 500px)"),
    }

    // A sticky bar will be displayed somewhere on the page (e.g. top corner) regardless
    // of the window's scroll position.
    const [isBarSticky, setIsBarSticky] = React.useState(false);

    const [allowMenuButtonTooltips, setAllowMenuButtonTooltips] = React.useState(responsive.largeEnoughForTooltips.matches);
    responsive.largeEnoughForTooltips.addListener((e)=>setAllowMenuButtonTooltips(e.matches));

    // Make the action bar sticky if the user has scrolled far enough down the page.
    React.useEffect(()=>
    {
        update_sticky_scroll();
        
        window.addEventListener("scroll", update_sticky_scroll);
        return ()=>{window.removeEventListener("scroll", update_sticky_scroll)};

        function update_sticky_scroll()
        {
            const stickThresholdY = 220;

            if (!isBarSticky && (window.scrollY > stickThresholdY))
            {
                setIsBarSticky(true);
            }
            else if (isBarSticky && (window.scrollY <= stickThresholdY))
            {
                setIsBarSticky(false);
            }
        }
    });

    return <div className={`ObservationListMenuBar ${props.enabled? "enabled" : "disabled"} ${isBarSticky? "sticky" : ""}`.trim()}>

               {/* A search field that allows the user to search for specific bird species to be added or
                 * removed as observations.*/}
               <BirdSearch backend={props.backend}
                           callbackAddObservation={props.callbackAddObservation}
                           callbackRemoveObservation={props.callbackRemoveObservation}
                           callbackChangeObservationDate={props.callbackChangeObservationDate}/>
                           
               <div className="buttons">
                   {/* A button with which the user can change the sorting order of the observation list.*/}
                   <MenuButton icon="fas fa-list-ul fa-fw"
                               title="Listan järjestys"
                               id="list-sorting"
                               items={
                               [
                                   {text:"Laji", callbackOnSelect:()=>props.callbackSetListSorting("species")},
                                   {text:"Päivä", callbackOnSelect:()=>props.callbackSetListSorting("date")},
                                   {text:"100 Lajia", callbackOnSelect:()=>props.callbackSetListSorting("sata-lajia")},
                               ]}
                               initialItemIdx={props.backend.observations().length? 1/*Päivä*/ : 2/*100 Lajia*/}
                               showTooltip={!isBarSticky && allowMenuButtonTooltips}/>

                   <MenuButton icon="fas fa-question fa-fw"
                               title="Tietoja"
                               id="list-info"
                               showTooltip={false}
                               customMenu={
                                   <div>
                                       <div style={{textAlign:"center"}}>Tietoja Lintulistasta</div>

                                       <a href="./guide/" target="_blank" rel="noopener noreferrer">
                                           Käyttöohje
                                       </a><br/>

                                       <a href="mailto:sw@tarpeeksihyvaesoft.com">
                                           Yhteydenotto
                                       </a><br/>

                                       <a href="./guide/images.html" target="_blank" rel="noopener noreferrer">
                                           Kuvien tiedot
                                       </a><br/>
                                   </div>
                               }/>

                   {/* A link that displays either a locked or unlocked lock icon, depending on whether the user
                     * is accessing the list with a view key or an edit key. Clicking the unlocked icon (shown when
                     * accessing with an edit key) will direct the browser to a version of the list using the view
                     * key (with which modifications to the list are not possible; i.e. the list is locked).*/}
                   <a className={`lock ${props.backend.hasEditRights? "unlocked" : "locked"}`.trim()}
                      title={props.backend.hasEditRights? "Avaa listan julkinen versio" : "Julkista listaa ei voi muokata"}
                      href={props.backend.hasEditRights? `./katsele/${props.backend.viewKey}` : null}
                      rel="noopener noreferrer"
                      target="_blank">
                           <i className={props.backend.hasEditRights? "fas fa-unlock-alt fa-fw" : "fas fa-lock fa-fw"}/>
                   </a>
               </div>

           </div>
}

ObservationListMenuBar.defaultProps =
{
    enabled: true,
}

ObservationListMenuBar.validate_props = function(props)
{
    panic_if_not_type("object", props, props.backend);
    panic_if_not_type("function", props.callbackAddObservation, props.callbackSetListSorting);

    return;
}

// Runs basic tests on this component. Returns true if all tests passed; false otherwise.
ObservationListMenuBar.test = ()=>
{
    // The container we'll render instances of the component into for testing.
    let container = {remove:()=>{}};

    // Test a menu bar with edit rights.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // A mock of BackendAccess().
        const backend =
        {
            hasEditRights: true,
            viewKey: "abcdefg",
            known_birds: ()=>([Bird({species:"Alli", family:"", order:""}), Bird({species:"Naakka", family:"", order:""})]),
            observations: ()=>([Observation({bird:Bird({species:"Naakka", family:"", order:""}), date:new Date(1000)})]),
        };

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ObservationListMenuBar,
            {
                backend,
                enabled: true,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
                callbackSetListSorting: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.querySelector(".ObservationListMenuBar") !== null),
                           ()=>(container.querySelector(".BirdSearch") !== null),
                           ()=>(container.querySelector(".buttons") !== null),
                           ()=>(container.querySelector(".lock") !== null),
                           ()=>(container.querySelector(".lock").tagName.toLowerCase() === "a"),
                           ()=>(container.querySelector(".lock").classList.contains("unlocked")),
                           ()=>(container.querySelector(".lock").getAttribute("href") === `./katsele/${backend.viewKey}`)]);
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

    // Test a menu bar without edit rights.
    try
    {
        container = document.createElement("div");
        document.body.appendChild(container);

        // A mock of BackendAccess().
        const backend =
        {
            hasEditRights: false,
            viewKey: "abcdefg",
            known_birds: ()=>([Bird({species:"Alli", family:"", order:""}), Bird({species:"Naakka", family:"", order:""})]),
            observations: ()=>([Observation({bird:Bird({species:"Naakka", family:"", order:""}), date:new Date(1000)})]),
        };

        // Render the component.
        ReactTestUtils.act(()=>
        {
            const unitElement = React.createElement(ObservationListMenuBar,
            {
                backend,
                enabled: true,
                callbackAddObservation: ()=>{},
                callbackRemoveObservation: ()=>{},
                callbackChangeObservationDate: ()=>{},
                callbackSetListSorting: ()=>{},
            });

            ReactDOM.unmountComponentAtNode(container);
            ReactDOM.render(unitElement, container);
        });

        throw_if_not_true([()=>(container.querySelector(".ObservationListMenuBar") !== null),
                           ()=>(container.querySelector(".BirdSearch") !== null),
                           ()=>(container.querySelector(".buttons") !== null),
                           ()=>(container.querySelector(".lock") !== null),
                           ()=>(container.querySelector(".lock").tagName.toLowerCase() === "a"),
                           ()=>(container.querySelector(".lock").classList.contains("locked")),
                           ()=>(!container.querySelector(".lock").getAttribute("href"))]);
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
