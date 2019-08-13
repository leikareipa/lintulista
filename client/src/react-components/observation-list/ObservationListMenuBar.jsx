/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "../../assert.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";

// Renders a set of 'action elements' i.e. buttons and the like with which the user can
// control certain aspects of the observation list; like to select the order in which to
// sort the list's items, to search for entries in the list via a search bar, etc.
//
// This component needs access to Lintulista's backend, so a relevant backend() object
// should be provided via props.backend.
//
// A callback for when the user requests a new observation to be added to the list is to
// be provided via props.callbackOnAddObservation. It will be passed one parameter: a bird()
// object describing the species of which the user wants an observation added.
//
// A callback for when the user requests an existing observation to be removed from the
// list is to be provided via props.callbackOnAddObservation. It will be passed one parameter:
// a bird() object describing the species of which the user wants an observation added.
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

    const responsive =
    {
        compact: ()=>window.matchMedia("(max-width: 1200px)"),
    }

    const [isBarSticky, setIsBarSticky] = React.useState(false);

    const [showAboutButton, setShowLinkListButton] = React.useState(responsive.compact().matches);

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

    responsive.compact().addListener((mediaMatch)=>
    {
        setShowLinkListButton(mediaMatch.matches);
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
                                   {text:"100 Lajia -haaste", callbackOnSelect:()=>props.callbackSetListSorting("sata-lajia")},
                               ]}
                               initialItemIdx={props.backend.observations().length? 1/*Päivä*/ : 2/*100 Lajia*/}
                               showTooltip={!isBarSticky && !responsive.compact().matches}/>

                    {showAboutButton? <MenuButton icon="fas fa-question fa-fw"
                                                  title="Tietoja"
                                                  id="list-info"
                                                  showTooltip={false}
                                                  customMenu={
                                                      <div>
                                                          <div style={{textAlign:"center"}}>Tietoja Lintulistasta</div>

                                                          <i className="fas fa-info fa-fw" style={{marginRight:"8px", color:"#63bde0"}}/>
                                                          <a href="./guide/" target="_blank" rel="noopener noreferrer">
                                                              Käyttöohje
                                                          </a><br/>
                                                          
                                                          <i className="fas fa-envelope-open fa-fw" style={{marginRight:"8px", color:"#63bde0"}}/>
                                                          <a href="mailto:sw@tarpeeksihyvaesoft.com">
                                                              Yhteydenotto
                                                          </a><br/>
                                                          
                                                          <i className="fas fa-crow fa-fw" style={{marginRight:"8px", color:"#63bde0"}}/>
                                                          Kuvat:&nbsp;
                                                          <a href="http://www.luontoportti.com/" target="_blank" rel="noopener noreferrer">
                                                              LuontoPortti
                                                          </a>
                                                      </div>
                                                  }/>
                                       : <></>}

                   {/* A link that displays either a locked or unlocked lock icon, depending on whether the user
                     * is accessing the list with a view key or an edit key. Clicking the unlocked icon (shown when
                     * accessing with an edit key) will direct the browser to a version of the list using the view
                     * key (with which modifications to the list are not possible; i.e. the list is locked).*/}
                   <a className={`lock ${props.backend.hasEditRights? "unlocked" : "locked"}`.trim()}
                      title={props.backend.hasEditRights? "Avaa listan julkinen versio" : "Julkista listaa ei voi muokata"}
                      href={props.backend.hasEditRights? `./${props.backend.viewKey}` : null}
                      rel="noopener noreferrer"
                      target="_blank">
                           <i className={props.backend.hasEditRights? "fas fa-unlock-alt fa-fw" : "fas fa-lock fa-fw"}/>
                   </a>
               </div>

           </div>

    function open_asset(assetName)
    {
        panic_if_not_type("string", assetName);

        switch (assetName)
        {
            case "user-guide":
            {
                break;
            }
            case "luontoportti":
            {
                break;
            }
            case "yhteydenotto":
            {
                break;
            }

            default: panic("Unknown asset name."); break;
        }
    }
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
