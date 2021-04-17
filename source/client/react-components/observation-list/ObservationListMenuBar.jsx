/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {ll_assert_native_type} from "../../assert.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";
import {CheckBoxButton} from "../buttons/CheckBoxButton.js";
import {ObservationList_MenuBar_LoginButton} from "../buttons/ObservationList_MenuBar_LoginButton.js";
import {tr} from "../../translator.js";
import {ll_hash_navigate} from "../../hash-router.js";

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

    return <div className={`ObservationListMenuBar ${isBarSticky? "sticky" : "non-sticky"}`}>

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
                id="list-info"
                title={tr("Information")}
                menuTitle={"Lintulista"}
                items={[
                    {text:tr("Image info"), callbackOnSelect:()=>window.open("./guide/images.html")},
                    {text:tr("User's guide"), callbackOnSelect:()=>window.open("./guide/")},
                    {text:"GitHub", callbackOnSelect:()=>window.open("https://github.com/leikareipa/lintulista/")},
                ]}
                showTooltip={false}
            />

            <ObservationList_MenuBar_LoginButton
                backend={props.backend}
            />

            <MenuButton
                icon="fas fa-language fa-fw"
                id="list-language"
                title={tr("Language")}
                menuTitle={tr("Language")}
                items={[
                    {text:"English", callbackOnSelect:()=>ll_hash_navigate("language", "enEN")},
                    {text:"Latine", callbackOnSelect:()=>ll_hash_navigate("language", "lat")},
                    {text:"Suomi", callbackOnSelect:()=>ll_hash_navigate("language", "fiFI")},
                ]}
                showTooltip={false}
            />

        </div>
                           
    </div>
}

ObservationListMenuBar.validate_props = function(props)
{
    ll_assert_native_type("object", props, props.backend);

    return;
}
