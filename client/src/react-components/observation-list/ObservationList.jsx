/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic, panic_if_not_type} from "../../assert.js";
import {QueryObservationDeletion} from "../dialogs/QueryObservationDeletion.js";
import {ObservationListFootnotes} from "./ObservationListFootnotes.js";
import {ObservationListMenuBar} from "./ObservationListMenuBar.js";
import {QueryObservationDate} from "../dialogs/QueryObservationDate.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {ObservationCard} from "./ObservationCard.js";
import {Observation} from "../../observation.js";
import * as FileSaver from "../../filesaver/FileSaver.js"; /* For saveAs().*/

// A list of the birds singled out in BirdLife's 100 Lajia challenge (www.birdlife.fi/lintuharrastus/100lintulajia/).
// In the future, this array might be located in some other file, but for now it's made its home here.
const sataLajia = Object.freeze(
[
    "Alli","Fasaani","Haahka","Haapana","Haarapääsky","Harakka","Härkälintu","Harmaahaikara","Harmaalokki","Harmaapäätikka",
    "Harmaasieppo","Helmipöllö","Hemppo","Hernekerttu","Hiirihaukka","Hiiripöllö","Hippiäinen","Hömötiainen","Huuhkaja","Isokoskelo",
    "Isolepinkäinen","Järripeippo","Jouhisorsa","Käenpiika","Käki","Kalalokki","Kalatiira","Kanadanhanhi","Kanahaukka","Kapustarinta",
    "Käpytikka","Kaulushaikara","Kehrääjä","Keltasirkku","Keltavästäräkki","Kesykyyhky","Kirjosieppo","Kiuru","Kivitasku","Korppi",
    "Koskikara","Kottarainen","Kuikka","Kultarinta","Kuovi","Kurki","Kuukkeli","Kuusitiainen","Kyhmyjoutsen","Lapasorsa",
    "Lapintiainen","Lapintiira","Laulujoutsen","Laulurastas","Lehtokerttu","Lehtokurppa","Lehtopöllö","Leppälintu","Liro","Luhtakerttunen",
    "Merihanhi","Merikotka","Merilokki","Merimetso","Metsähanhi","Metsäkirvinen","Metso","Mustalintu","Mustapääkerttu","Mustarastas",
    "Naakka","Närhi","Naurulokki","Niittykirvinen","Nokikana","Nuolihaukka","Pajulintu","Pajusirkku","Palokärki","Peippo",
    "Peltosirkku","Pensaskerttu","Pensassirkkalintu","Pensastasku","Peukaloinen","Piekana","Pikkukäpylintu","Pikkulepinkäinen","Pikkulokki","Pikkutikka",
    "Pikkuvarpunen","Pilkkasiipi","Pulmunen","Punakylkirastas","Punarinta","Punatulkku","Punavarpunen","Puukiipijä","Pyrstötiainen","Pyy",
    "Räkättirastas","Rantasipi","Rautiainen","Räyskä","Räystäspääsky","Riekko","Ruisrääkkä","Ruokokerttunen","Ruskosuohaukka","Rytikerttunen",
    "Sääksi","Sarvipöllö","Satakieli","Selkälokki","Sepelkyyhky","Silkkiuikku","Sinirinta","Sinisorsa","Sinisuohaukka","Sinitiainen",
    "Sirittäjä","Suokukko","Taivaanvuohi","Talitiainen","Tavi","Teeri","Telkkä","Tervapääsky","Tikli","Tilhi",
    "Tiltaltti","Törmäpääsky","Töyhtöhyyppä","Töyhtötiainen","Tukkakoskelo","Tukkasotka","Tundrahanhi","Tuulihaukka","Urpiainen","Uuttukyyhky",
    "Valkoposkihanhi","Varis","Varpunen","Varpushaukka","Varpuspöllö","Västäräkki","Viherpeippo","Vihervarpunen","Viirupöllö","Viitakerttunen",
]);

export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    // Used for rerendering the list of observation cards.
    const [observationCardsKey, setObservationCardsKey] = React.useState(0);

    const [isMenuBarEnabled, setIsMenuBarEnabled] = React.useState(true);

    // Specifies by which sorting mode the list is currently to be sorted. Must be one of
    // the modes in 'observationSorter'. The initial value should match the mode by which
    // the server pre-sorts the observations list before sending it to the client.
    //
    // The string will also be used as a CSS class name, so its form should follow the
    // corresponding syntactical rules for that.
    //
    // Note that if you change the initial value, you should change the initial value of
    // the sorting menu index in the ObservationListMenuBar element of this component also.
    //
    const [sortListBy, setSortListBy] = React.useState(props.backend.observations().length? "date" : "sata-lajia");

    const [renderCount,] = React.useState(()=>({total:0, elements:0, isInitialRender:true}));
    renderCount.total++;

    // An array providing for each observation in the list its corresponding React element.
    const [observationCards,] = React.useState(()=>create_observation_cards());

    // Functions for sorting the list of observation cards.
    const observationSorter =
    {
        species: (a, b)=>(a.observation.bird.species < b.observation.bird.species? -1 : a.observation.bird.species > b.observation.bird.species? 1 : 0),
        family: (a, b)=>(a.observation.bird.family < b.observation.bird.family? -1 : a.observation.bird.family > b.observation.bird.family? 1 : 0),
        order: (a, b)=>(a.observation.bird.order < b.observation.bird.order? -1 : a.observation.bird.order > b.observation.bird.order? 1 : 0),
        date: (a, b)=>(a.observation.unixTimestamp < b.observation.unixTimestamp? 1 : a.observation.unixTimestamp > b.observation.unixTimestamp? -1 : 0),
    };

    // Regenerate the list every time the sorting mode changes.
    React.useEffect(()=>
    {
        // We'll assume that the server pre-sorts the observation list by our initial sorting
        // mode, so we'll skip re-sorting the list on initial render.
        if (renderCount.total > 1)
        {
            observationCards.splice(0, observationCards.length, ...create_observation_cards());
            sort_observation_cards();
            redraw_observation_cards();
        }

        renderCount.isInitialRender = false;
    }, [sortListBy]);

     // Functions that can modify the underlying observation data.
     const observationDataMutator = Object.freeze(
    {
        // Called when the user requests us to add a new observation into the list.
        add_observation: async function(bird)
        {
            const obs = Observation({bird, date:new Date(), place:""});

            if (await props.backend.put_observation(obs))
            {
                const elementIdx = observationCards.map(c=>c.observation.bird.species).findIndex(species=>(species === obs.bird.species));

                // If the observation didn't already exist in the list, add it; otherwise
                // update it. Even though this function is add_observation(), if the user
                // has the list in the 100 Lajia sorting mode, there may be a ghost element
                // for a bird of this species already in the list - in which case, we want
                // to replace the ghost element rather than adding a new, duplicate observation.
                if (elementIdx === -1)
                {
                    observationCards.unshift(observation_card(obs));
                }
                else
                {
                    observationCards.splice(elementIdx, 1, observation_card(obs));
                }
                
                sort_observation_cards();
                redraw_observation_cards();
            }
            else
            {
                error(`Could not add an observation for ${bird.species}.`);
            }
        },

        delete_observation: async function(bird)
        {
            const obs = observationCards.map(o=>o.observation).find(obs=>(obs.bird.species === bird.species));

            if (!obs)
            {
                panic("Was asked to delete an observation of a species of which no observation exists.");
                return;
            }

            setIsMenuBarEnabled(false);

            // Ask the user to confirm the deletion of the observation; and if they do so,
            // remove it.
            await open_modal_dialog(QueryObservationDeletion,
            {
                observation: obs,
                onAccept: async()=>
                {
                    const elementIdx = observationCards.map(c=>c.observation.bird.species).findIndex(species=>(species === obs.bird.species));
    
                    if ((elementIdx !== -1) && await props.backend.delete_observation(obs))
                    {
                        const speciesName = observationCards[elementIdx].observation.bird.species;
            
                        if ((sortListBy === "sata-lajia") && sataLajia.includes(speciesName))
                        {
                            observationCards.splice(elementIdx, 1, ghost_observation_card(speciesName));
                        }
                        else
                        {
                            observationCards.splice(elementIdx, 1);
                        }
                        
                        sort_observation_cards();
                        redraw_observation_cards();
                    }
                    else
                    {
                        error(`Could not delete the observation of ${bird.species}.`);
                    }
                },
                onClose: ()=>{setIsMenuBarEnabled(true)},
            });
        },

        set_observation_date: async function(bird)
        {
            panic_if_not_type("object", bird);

            const existingObservation = observationCards.map(o=>o.observation).find(obs=>(obs.bird.species === bird.species));

            if (!existingObservation)
            {
                panic("Was asked to set the date of an observation of a species of which no observation exists.");
                return;
            }

            setIsMenuBarEnabled(false);

            // Ask the user to confirm the deletion of the observation; and if they do so,
            // remove it.
            await open_modal_dialog(QueryObservationDate,
            {
                observation: existingObservation,
                onAccept: async({year, month, day})=>
                {
                    const newDate = new Date();

                    newDate.setFullYear(year);
                    newDate.setMonth(month-1);
                    newDate.setDate(day);

                    const modifiedObservation = Observation(
                    {
                        ...existingObservation,
                        date: newDate,
                    });

                    if (!(await props.backend.put_observation(modifiedObservation)))
                    {
                        return null;
                    }

                    const cardIdx = observationCards.map(o=>o.observation).findIndex(obs=>(obs.bird.species === bird.species));

                    if (cardIdx === -1)
                    {
                        panic("Unable to find the observation card whose date was modified.");
                    }

                    observationCards.splice(cardIdx, 1, observation_card(modifiedObservation))

                    if (sortListBy === "date")
                    {
                        sort_observation_cards();
                        redraw_observation_cards();
                    }
                },
                onClose: ()=>{setIsMenuBarEnabled(true)},
            });
        },

        // Alters an existing observation's place. Returns the updated observation; or null
        // on error.
        set_observation_place: async function(existingObservation, newPlace)
        {
            panic_if_undefined(existingObservation, newPlace);

            const modifiedObservation = Observation(
            {
                ...existingObservation,
                place: newPlace,
            });
            
            if (!(await props.backend.put_observation(modifiedObservation)))
            {
                return null;
            }

            if (sortListBy === "place")
            {
                sort_observation_cards();
                redraw_observation_cards();
            }

            return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
        },
    });

    return <div className="ObservationList">

               {/* A collection of controls with which the user can alter aspects of the list; for instance,
                 * the sorting order of its cards.*/}
               <ObservationListMenuBar enabled={isMenuBarEnabled}
                                       backend={props.backend}
                                       callbackAddObservation={observationDataMutator.add_observation}
                                       callbackRemoveObservation={observationDataMutator.delete_observation}
                                       callbackChangeObservationDate={observationDataMutator.set_observation_date}
                                       callbackSetListSorting={setSortListBy}/>

               {/* A list of ObservationCard components, one for each observation the user has made.*/}
               <div className={`observation-cards ${sortListBy}`.trim()}
                    key={observationCardsKey}>
                        {observationCards.map(card=>card.element)}
               </div>

               {/* Displays general information about the list's state - like the number of observations.*/}
               <ObservationListFootnotes numObservationsInList={props.backend.observations().length}
                                         callbackDownloadList={save_observations_to_csv_file}/>
                                      
           </div>

    function redraw_observation_cards()
    {
        renderCount.cards++;
        setObservationCardsKey(observationCardsKey+1);
    }

    // Map all of the user's observations into React elements to be displayed.
    //
    function create_observation_cards()
    {
        // For the 100 Lajia challenge, we want to insert three kinds of elements: (1) ghost
        // elements for species that are included in the challenge but which the user hasn't
        // yet observed; (2) regular elements for species that the user has observed and which
        // are included in the challenge; and (3) additional observations that the user has
        // made but which aren't included in the challenge.
        if (sortListBy === "sata-lajia")
        {
            // Add elements for species included in the challenge.
            const sata = sataLajia.reduce((array, species)=>
            {
                const existingObservation = props.backend.observations().find(obs=>(obs.bird.species === species));

                array.push(existingObservation? observation_card(existingObservation)
                                              : ghost_observation_card(species));

                return array;
            }, []);

            // Add elements for observations of species not included in the challenge.
            const normal = props.backend.observations().filter(obs=>!sataLajia.includes(obs.bird.species))
                                                       .map(obs=>observation_card(obs));

            return [...sata, ...normal];
        }
        // Otherwise, we just return elements for the observations the user has made.
        else
        {
            return props.backend.observations().map(obs=>observation_card(obs));
        }
    }

    function ghost_observation_card(speciesName)
    {
        panic_if_not_type("string", speciesName);

        const bird = props.backend.known_birds().find(bird=>(bird.species === speciesName));

        if (!bird)
        {
            panic(`Unknown species '${speciesName}'.`);
            return {};
        }

        const obs = Observation({bird, date:new Date()});

        return {
            observation: obs,
            element: <ObservationCard observation={obs}
                                      isGhost={true}
                                      key={obs.bird.species}/>
        };
    }

    function observation_card(obs)
    {
        panic_if_not_type("object", obs);

        return {
            observation: obs,
            element: <ObservationCard observation={obs}
                                      key={obs.bird.species}/>
        };
    }

    function sort_observation_cards()
    {
        const sorter = (()=>
        {
            switch (sortListBy)
            {
                case "sata-lajia": return observationSorter["species"];

                case "date":
                case "species": return observationSorter[sortListBy];
                
                default: panic("Unknown sorter."); return ()=>{};
            }
        })();
        
        observationCards.sort(sorter);
    }

    function save_observations_to_csv_file()
    {
        let csvString = "Ensihavainto, Laji, Heimo, Lahko\n";

        props.backend.observations().forEach(obs=>
        {
            const dateString = new Intl.DateTimeFormat("fi-FI").format(obs.date);

            csvString += `${dateString||""}, ${obs.bird.species||""}, ${obs.bird.family||""}, ${obs.bird.order||""},\n`;
        });

        saveAs(new Blob([csvString], {type: "text/plain;charset=utf-8"}), "lintulista.csv");
    }
}

ObservationList.validate_props = function(props)
{
    panic_if_undefined(props.backend);

    return;
}
