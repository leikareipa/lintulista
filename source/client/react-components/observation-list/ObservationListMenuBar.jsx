/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {is_public_ll_error} from "../../throwable.js";
import {panic_if_not_type, throw_if_not_true} from "../../assert.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {QueryLoginCredentials} from "../dialogs/QueryLoginCredentials.js";
import {Observation} from "../../observation.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";
import {CheckBoxButton} from "../buttons/CheckBoxButton.js";
import {Button} from "../buttons/Button.js";
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

    const knownBirds = ReactRedux.useSelector(state=>state.knownBirds);
    const isLoggedIn = ReactRedux.useSelector(state=>state.isLoggedIn);
    const is100LajiaMode = ReactRedux.useSelector(state=>state.is100LajiaMode);
    const setIs100LajiaMode = ReactRedux.useDispatch();

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

    return <div className={`ObservationListMenuBar ${props.enabled? "enabled" : "disabled"}
                                                   ${isBarSticky? "sticky" : ""}
                                                   ${isLoggedIn? "logged-in" : "not-logged-in"}`}>

        {/* A search field that allows the user to search for specific bird species to be added or
        * removed as observations.*/}
        <BirdSearch
            backend={props.backend}
        />

        <div className="buttons">

            <CheckBoxButton
                iconChecked="fas fa-check-square fa-fw fa-lg"
                iconUnchecked="fas fa-square fa-fw fa-lg"
                tooltip="100 Lajia -haaste"
                showTooltip={!isBarSticky}
                title="Katso tilanteesi 100 Lajia -haasteessa"
                isChecked={is100LajiaMode}
                callbackOnButtonClick={(isChecked)=>setIs100LajiaMode({type: "set-100-lajia-mode", isEnabled: isChecked})}
            />

            <MenuButton
                icon="fas fa-question fa-fw fa-lg"
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
                }
            />
            
            {/* A button that allows the user to log in/out.*/}
            <Button
                className={`lock ${isLoggedIn? "unlocked" : "locked"}`}
                title={isLoggedIn
                       ? "Kirjaudu ulos"
                       : "Kirjaudu sisään muokataksesi listaa"}
                icon={isLoggedIn
                      ? "fas fa-user-shield fa-fw fa-lg"
                      : "fas fa-lock fa-fw fa-lg"}
                callbackOnButtonClick={handle_login_button_click}
            />

        </div>
                           
    </div>

    async function handle_login_button_click()
    {
        // Ask the user to confirm the deletion of the observation; and if they do so,
        // remove it.
        await open_modal_dialog(QueryLoginCredentials, {
            randomBird: knownBirds[Math.floor(Math.random() * knownBirds.length)],
            onAccept: async function({username, password})
            {
                await props.backend.login(username, password);
            },
        });

        return;
    }
}

ObservationListMenuBar.defaultProps =
{
    enabled: true,
}

ObservationListMenuBar.validate_props = function(props)
{
    panic_if_not_type("object", props, props.backend);

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
                           ()=>(container.querySelector(".lock").getAttribute("href") === `./katsele/${backend.listKey}`)]);
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
            isLoggedIn: false,
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
