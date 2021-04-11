/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type, throw_if_not_true} from "../../assert.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {QueryLoginCredentials} from "../dialogs/QueryLoginCredentials.js";
import {LL_Observation} from "../../observation.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";
import {CheckBoxButton} from "../buttons/CheckBoxButton.js";
import {Button} from "../buttons/Button.js";
import {LL_Bird} from "../../bird.js";
import { tr } from "../../translator.js";

// Renders a set of 'action elements' i.e. buttons and the like with which the user can
// control certain aspects of the observation list; like to select the order in which to
// sort the list's items, to search for entries in the list via a search bar, etc.
//
// This component needs access to Lintulista's backend, so a relevant backend() object
// should be provided via props.backend.
//
export function ObservationListMenuBar(props = {})
{
    ObservationListMenuBar.validate_props(props);

    const knownBirds = ReactRedux.useSelector(state=>state.knownBirds);
    const isLoggedIn = ReactRedux.useSelector(state=>state.isLoggedIn);
    const is100LajiaMode = ReactRedux.useSelector(state=>state.is100LajiaMode);
    const setIs100LajiaMode = ReactRedux.useDispatch();

    // A sticky bar will be displayed somewhere on the page (e.g. top corner) regardless
    // of the window's scroll position.
    const [isBarSticky, setIsBarSticky] = React.useState(false);

    // Make the action bar sticky if the user has scrolled far enough down the page.
    React.useEffect(()=>
    {
        update_sticky_scroll();
        
        window.addEventListener("scroll", update_sticky_scroll);
        return ()=>{window.removeEventListener("scroll", update_sticky_scroll)};

        function update_sticky_scroll()
        {
            const stickThresholdY = 220;

            if (!isBarSticky && (window.scrollY > stickThresholdY)) {
                setIsBarSticky(true);
            }
            else if (isBarSticky && (window.scrollY <= stickThresholdY)) {
                setIsBarSticky(false);
            }
        }
    });

    return <div className={`ObservationListMenuBar ${isBarSticky? "sticky" : ""}`}>

        <BirdSearch
            backend={props.backend}
        />

        <div className="buttons">

            <CheckBoxButton
                iconChecked="fas fa-check-square fa-fw fa-lg"
                iconUnchecked="fas fa-square fa-fw fa-lg"
                tooltip={tr("100 Species Challenge")}
                showTooltip={!isBarSticky}
                title={tr("See your standing in the 100 Species Challenge")}
                isChecked={is100LajiaMode}
                callbackOnButtonClick={(isChecked)=>setIs100LajiaMode({type: "set-100-lajia-mode", isEnabled: isChecked})}
            />

            <MenuButton
                icon="fas fa-question fa-fw fa-lg"
                title={tr("Information")}
                id="list-info"
                showTooltip={false}
                customMenu={
                    <div>

                        <div style={{textAlign:"center"}}>
                            {tr("About Lintulista")}
                        </div>

                        <a href="./guide/" target="_blank" rel="noopener noreferrer">
                            {tr("User's guide")}
                        </a><br/>

                        <a href="mailto:sw@tarpeeksihyvaesoft.com">
                            {tr("Contact us")}
                        </a><br/>

                        <a href="./guide/images.html" target="_blank" rel="noopener noreferrer">
                            {tr("Image info")}
                        </a><br/>

                    </div>
                }
            />
            
            <Button
                className={`lock ${isLoggedIn? "unlocked" : "locked"}`}
                title={isLoggedIn
                       ? tr("Log out")
                       : tr("Log in to edit the list")}
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
    ll_assert_native_type("object", props, props.backend);

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
