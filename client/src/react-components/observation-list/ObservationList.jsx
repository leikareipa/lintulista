/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic, panic_if_not_type} from "../../assert.js";
import {ObservationListElementGhost} from "./ObservationListElementGhost.js";
import {ObservationListActionBar} from "./ObservationListActionBar.js";
import {ObservationListElement} from "./ObservationListElement.js";
import {ObservationListFooter} from "./ObservationListFooter.js";
import {observation} from "../../observation.js";
import {PlainTag} from "../tags/PlainTag.js";
import * as FileSaver from "../../filesaver/FileSaver.js"; /* For saveAs().*/

// A list of the birds in BirdLife's 100 Lajia challenge (www.birdlife.fi/lintuharrastus/100lintulajia/).
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

    // Used for rerendering the list of observation elements.
    const [elementsKey, setElementsKey] = React.useState(0);

    const [actionBarEnabled, setActionBarEnabled] = React.useState(true);

    // Functions for sorting the list of observation elements.
    const observationElementSorters =
    {
        species: (a, b)=>(a.observation.bird.species < b.observation.bird.species? -1 : a.observation.bird.species > b.observation.bird.species? 1 : 0),
        family: (a, b)=>(a.observation.bird.family < b.observation.bird.family? -1 : a.observation.bird.family > b.observation.bird.family? 1 : 0),
        order: (a, b)=>(a.observation.bird.order < b.observation.bird.order? -1 : a.observation.bird.order > b.observation.bird.order? 1 : 0),
        date: (a, b)=>(a.observation.unixTimestamp < b.observation.unixTimestamp? 1 : a.observation.unixTimestamp > b.observation.unixTimestamp? -1 : 0),
    };

    // Specifies by which sorting mode the list is currently to be sorted. Must be one of
    // the modes in 'observationElementSorters'. Note that if you change the initial useState()
    // value of this, you should change the initial value of the sorting menu index in the
    // ObservationListActionBar element of this component also.
    const [sortListBy, setSortListBy] = React.useState("date");

    // An array providing for each observation in the list its corresponding React element.
    // Note that we invoke lazy initial state with useState().
    const [observationElements,] = React.useState(()=>create_observation_elements());

    // Regenerate the list every time the sorting mode changes.
    React.useEffect(()=>
    {
        observationElements.splice(0, observationElements.length, ...create_observation_elements());
        sort_observation_list();
        redraw_elements_list();
    }, [sortListBy]);

    console.log("Redrawing the observation list.");

    // The element displayed in the observation list when the list is empty (i.e. when
    // there are no observations).
    const emptyElement = <div className="intro">
                             <h3><i className="fas fa-feather-alt"/> Tervetuloa Lintulistaan!</h3>
                             <p>Löydät sivun käyttöohjeet <a href="/ohjeet/" target="_blank" rel="noopener noreferred">
                                <i className="fas fa-link fa-sm"/> tästä</a>. Ohjeet sisältävät mm. tärkeää yksityisyystietoa,
                                ja niiden vilkaiseminen onkin suosisteltua ennen sivuston varsinaista käyttöönottoa.</p>
                             {props.backend.hasEditRights
                                 ? <>
                                       <p>Kun haluat ryhtyä merkitsemään havaintojasi, kirjoita ylälaidan hakukenttään
                                          lintulajin nimi. Halutun tuloksen kohdalla paina <i style={{color:"#bd7b72"}} className="fas fa-plus-circle fa-xs"/>-symbolia
                                          lisätäksesi se listaan!</p>
                                   </>
                                 : <></>}
                         </div>

    console.log("-------- Finished redrawing the observation list.");
    return <div className="ObservationList">
               <ObservationListActionBar enabled={actionBarEnabled}
                                         backend={props.backend}
                                         callbackAddObservation={add_observation}
                                         callbackSetListSorting={setSortListBy}/>
               <div className="elements" key={elementsKey}>
                   {observationElements.length? observationElements.map(e=>e.element) : emptyElement}
               </div>
               <ObservationListFooter numObservationsInList={props.backend.observations().length}
                                      callbackDownloadList={save_observation_list_to_csv_file}/>
           </div>

    function redraw_elements_list()
    {
        setElementsKey(elementsKey+1);
    }

    // Map all of the user's observations into React elements to be displayed.
    //
    function create_observation_elements()
    {
        console.log("Regenerating observation elements.");

        // For the 100 Lajia challenge, we want to insert three kinds of elements: (1) ghost
        // elements for species that are included in the challenge but which the user hasn't
        // yet observed; (2) regular elements for species that the user has observed and which
        // are included in the challenge; and (3) additional observations that the user has
        // made but which aren't included in the challenge.
        if (sortListBy === "100-lajia")
        {
            // Add elements for species included in the challenge.
            const sata = sataLajia.reduce((array, species)=>
            {
                const existingObservation = props.backend.observations().find(obs=>(obs.bird.species === species));

                array.push(existingObservation? create_observation_element(existingObservation)
                                              : create_ghost_observation_element(species));

                return array;
            }, []);

            // Add elements for observations of species not included in the challenge.
            const normal = props.backend.observations().filter(obs=>!sataLajia.includes(obs.bird.species))
                                                       .map(obs=>create_observation_element(obs));

            return [...sata, ...normal];
        }
        // Otherwise, we just return elements for the observations the user has made.
        else
        {
            return props.backend.observations().map(obs=>create_observation_element(obs));
        }
    }

    function create_ghost_observation_element(speciesName)
    {
        panic_if_not_type("string", speciesName);

        const bird = props.backend.known_birds().find(bird=>(bird.species === speciesName));

        if (!bird)
        {
            panic(`Unknown species '${speciesName}'.`);
        }

        return {
            observation: observation({bird, date:new Date()}),
            element: <ObservationListElementGhost key={`ghost-of-${speciesName}`}
                                                  speciesName={speciesName}
                                                  visible={true}/>
        };
    }

    function create_observation_element(obs, tag = <></>)
    {
        panic_if_not_type("object", obs, tag);

        /// Temporary implementation; will be replaced.
        if ((sortListBy === "100-lajia") &&
            !sataLajia.includes(obs.bird.species))
        {
            tag = <PlainTag text="Lisälaji"/>;
        }

        return {
            observation: obs,
            element: <ObservationListElement observation={obs}
                                             key={obs.bird.species}
                                             tag={tag}
                                             visible={true}
                                             allowEditing={props.backend.hasEditRights}
                                             maxPlaceNameLength={props.backend.backend_limits().maxPlaceNameLength}
                                             callbackSetActionBarEnabled={(boolState)=>setActionBarEnabled(boolState)}
                                             requestDeleteObservation={async(self)=>await delete_observation(self)}
                                             requestChangeObservationDate={async(self, newDate)=>await set_observation_date(self, newDate)}
                                             requestChangeObservationPlace={async(self, newPlace)=>await set_observation_place(self, newPlace)}/>
        };
    }

    function sort_observation_list()
    {
        console.log("Sorting the observation list.");

        const sorter = (()=>
        {
            switch (sortListBy)
            {
                case "100-lajia": return observationElementSorters["species"];

                case "date":
                case "species": return observationElementSorters[sortListBy];
                
                default: panic("Unknown sorter."); return ()=>{};
            }
        })();
        
        observationElements.sort(sorter);
    }

    async function save_observation_list_to_csv_file()
    {
        let csvString = "Päiväys, Laji, Heimo, Lahko, Havaintopaikka\n";

        props.backend.observations().forEach(obs=>
        {
            const dateString = new Intl.DateTimeFormat("fi-FI").format(obs.date);

            csvString += `${dateString}, ${obs.bird.species}, ${obs.bird.family}, ${obs.bird.order}, ${obs.place},\n`;
        });

        saveAs(new Blob([csvString], {type: "text/plain;charset=utf-8"}), "lintulista.csv");
    }

    // Called when the user requests us to add a new observation into the list.
    async function add_observation(bird)
    {
        const obs = observation({bird, date:new Date(), place:""});

        if (await props.backend.put_observation(obs))
        {
            const elementIdx = observationElements.map(e=>e.observation.bird.species).findIndex(species=>(species === obs.bird.species));

            // If the observation didn't already exist in the list, add it; otherwise
            // update it. Even though this function is add_observation(), if the user
            // has the list in the 100 Lajia sorting mode, there may be a ghost element
            // for a bird of this species already in the list - in which case, we want
            // to replace the ghost element rather than adding a new, duplicate observation.
            if (elementIdx === -1)
            {
                observationElements.unshift(create_observation_element(obs));
            }
            else
            {
                observationElements.splice(elementIdx, 1, create_observation_element(obs));
            }
            
            sort_observation_list();
            redraw_elements_list();
        }
        else
        {
            error(`Could not add an observation for ${bird.species}.`);
        }
    }

    async function delete_observation(targetObservation)
    {
        const elementIdx = observationElements.map(e=>e.observation.bird.species).findIndex(species=>(species === targetObservation.bird.species));

        if ((elementIdx !== -1) && await props.backend.delete_observation(targetObservation))
        {
            const speciesName = observationElements[elementIdx].observation.bird.species;

            if ((sortListBy === "100-lajia") && sataLajia.includes(speciesName))
            {
                observationElements.splice(elementIdx, 1,
                                           create_ghost_observation_element(speciesName));
            }
            else
            {
                observationElements.splice(elementIdx, 1);
            }
            
            sort_observation_list();
            redraw_elements_list();
        }
        else
        {
            error(`Could not deöete the observation of ${bird.species}.`);
        }
    }

    // Alters an existing observation's date to match the given year, month (1-12), and
    // day (1-31). Returns the updated observation; or null on error.
    async function set_observation_date(existingObservation, {year, month, day})
    {
        panic_if_undefined(existingObservation, year, month, day);

        const newDate = new Date();
        newDate.setFullYear(year);
        newDate.setMonth(month-1);
        newDate.setDate(day);

        const modifiedObservation = observation(
        {
            ...existingObservation,
            date: newDate,
        });

        if (!(await props.backend.put_observation(modifiedObservation)))
        {
            return null;
        }

        const elementIdx = observationElements.map(e=>e.observation.bird.species).findIndex(species=>(species === modifiedObservation.bird.species));
        observationElements.splice(elementIdx, 1, create_observation_element(modifiedObservation));

        sort_observation_list();
        redraw_elements_list();

        return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
    }

    // Alters an existing observation's place. Returns the updated observation; or null
    // on error.
    async function set_observation_place(existingObservation, newPlace)
    {
        panic_if_undefined(existingObservation, newPlace);

        const modifiedObservation = observation(
        {
            ...existingObservation,
            place: newPlace,
        });
        
        if (!(await props.backend.put_observation(modifiedObservation)))
        {
            return null;
        }

        const elementIdx = observationElements.map(e=>e.observation.bird.species).findIndex(species=>(species === modifiedObservation.bird.species));
        observationElements.splice(elementIdx, 1, create_observation_element(modifiedObservation));

        sort_observation_list();
        redraw_elements_list();

        return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
    }
}

ObservationList.validate_props = function(props)
{
    panic_if_undefined(props.backend);

    return;
}
