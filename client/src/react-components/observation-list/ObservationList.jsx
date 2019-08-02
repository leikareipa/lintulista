/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_undefined, panic, panic_if_not_type} from "../../assert.js";
import {ObservationListElementGhost} from "./ObservationListElementGhost.js";
import {ObservationListElement} from "./ObservationListElement.js";
import {QueryAddNewObservation} from "../dialogs/QueryAddNewObservation.js";
import {open_modal_dialog} from "../../open-modal-dialog.js";
import {darken_viewport} from "../../darken_viewport.js";
import {observation} from "../../observation.js";
import {BirdSearch} from "../bird-search/BirdSearch.js";
import {MenuButton} from "../buttons/MenuButton.js";
import {PlainTag} from "../tags/PlainTag.js";

// A list of the birds in BirdLife's 100 Lajia challenge (www.birdlife.fi/lintuharrastus/100lintulajia/).
// In the future, this array might be located in some other file, but for now it's made its home here.
const sataLajia = Object.freeze(
[
    "Alli",
    "Fasaani",
    "Haahka",
    "Haapana",
    "Haarapääsky",
    "Harakka",
    "Härkälintu",
    "Harmaahaikara",
    "Harmaalokki",
    "Harmaapäätikka",
    "Harmaasieppo",
    "Helmipöllö",
    "Hemppo",
    "Hernekerttu",
    "Hiirihaukka",
    "Hiiripöllö",
    "Hippiäinen",
    "Hömötiainen",
    "Huuhkaja",
    "Isokoskelo",
    "Isolepinkäinen",
    "Järripeippo",
    "Jouhisorsa",
    "Käenpiika",
    "Käki",
    "Kalalokki",
    "Kalatiira",
    "Kanadanhanhi",
    "Kanahaukka",
    "Kapustarinta",
    "Käpytikka",
    "Kaulushaikara",
    "Kehrääjä",
    "Keltasirkku",
    "Keltavästäräkki",
    "Kesykyyhky",
    "Kirjosieppo",
    "Kiuru",
    "Kivitasku",
    "Korppi",
    "Koskikara",
    "Kottarainen",
    "Kuikka",
    "Kultarinta",
    "Kuovi",
    "Kurki",
    "Kuukkeli",
    "Kuusitiainen",
    "Kyhmyjoutsen",
    "Lapasorsa",
    "Lapintiainen",
    "Lapintiira",
    "Laulujoutsen",
    "Laulurastas",
    "Lehtokerttu",
    "Lehtokurppa",
    "Lehtopöllö",
    "Leppälintu",
    "Liro",
    "Luhtakerttunen",
    "Merihanhi",
    "Merikotka",
    "Merilokki",
    "Merimetso",
    "Metsähanhi",
    "Metsäkirvinen",
    "Metso",
    "Mustalintu",
    "Mustapääkerttu",
    "Mustarastas",
    "Naakka",
    "Närhi",
    "Naurulokki",
    "Niittykirvinen",
    "Nokikana",
    "Nuolihaukka",
    "Pajulintu",
    "Pajusirkku",
    "Palokärki",
    "Peippo",
    "Peltosirkku",
    "Pensaskerttu",
    "Pensassirkkalintu",
    "Pensastasku",
    "Peukaloinen",
    "Piekana",
    "Pikkukäpylintu",
    "Pikkulepinkäinen",
    "Pikkulokki",
    "Pikkutikka",
    "Pikkuvarpunen",
    "Pilkkasiipi",
    "Pulmunen",
    "Punakylkirastas",
    "Punarinta",
    "Punatulkku",
    "Punavarpunen",
    "Puukiipijä",
    "Pyrstötiainen",
    "Pyy",
    "Räkättirastas",
    "Rantasipi",
    "Rautiainen",
    "Räyskä",
    "Räystäspääsky",
    "Riekko",
    "Ruisrääkkä",
    "Ruokokerttunen",
    "Ruskosuohaukka",
    "Rytikerttunen",
    "Sääksi",
    "Sarvipöllö",
    "Satakieli",
    "Selkälokki",
    "Sepelkyyhky",
    "Silkkiuikku",
    "Sinirinta",
    "Sinisorsa",
    "Sinisuohaukka",
    "Sinitiainen",
    "Sirittäjä",
    "Suokukko",
    "Taivaanvuohi",
    "Talitiainen",
    "Tavi",
    "Teeri",
    "Telkkä",
    "Tervapääsky",
    "Tikli",
    "Tilhi",
    "Tiltaltti",
    "Törmäpääsky",
    "Töyhtöhyyppä",
    "Töyhtötiainen",
    "Tukkakoskelo",
    "Tukkasotka",
    "Tundrahanhi",
    "Tuulihaukka",
    "Urpiainen",
    "Uuttukyyhky",
    "Valkoposkihanhi",
    "Varis",
    "Varpunen",
    "Varpushaukka",
    "Varpuspöllö",
    "Västäräkki",
    "Viherpeippo",
    "Vihervarpunen",
    "Viirupöllö",
    "Viitakerttunen",
]);
    
export function ObservationList(props = {})
{
    ObservationList.validate_props(props);

    const [sortObservationsBy, setSortObservationsBy] = React.useState("date");
    const sorters =
    {
        species: (a, b)=>(a.bird.species < b.bird.species? -1 : a.bird.species > b.bird.species? 1 : 0),
        family: (a, b)=>(a.bird.family < b.bird.family? -1 : a.bird.family > b.bird.family? 1 : 0),
        order: (a, b)=>(a.bird.order < b.bird.order? -1 : a.bird.order > b.bird.order? 1 : 0),
        date: (a, b)=>(a.unixTimestamp < b.unixTimestamp? 1 : a.unixTimestamp > b.unixTimestamp? -1 : 0),
    };

    const [observationElements, setObservationElements] = React.useState(generate_observation_elements());

    React.useEffect(()=>
    {
        setObservationElements(generate_observation_elements());
    }, [sortObservationsBy]);

    const lockElement = props.backend.hasEditRights? <a className="lock" href={`./${props.backend.viewKey}`}
                                                        target="_blank" rel="noopener noreferrer"
                                                        title="Avaa listan julkinen versio">
                                                            <i className="fas fa-unlock-alt"/>
                                                     </a>
                                                   : <a className="lock" href={null}
                                                        target="_blank" rel="noopener noreferrer"
                                                        title="Julkisen listan havaintoja ei voi muokata">
                                                            <i className="fas fa-lock"/>
                                                     </a>

    return <div className="ObservationList">
               <div className="action-bar">
                   <BirdSearch backend={props.backend}
                               callbackSelectedBird={(bird)=>add_observation(bird)}/>
                   <MenuButton icon="fas fa-ellipsis-v"
                               title="Listan järjestys"
                               items={
                               [
                                   {text:"Laji", callbackOnSelect:()=>setSortObservationsBy("species")},
                                   {text:"Heimo", callbackOnSelect:()=>setSortObservationsBy("order")},
                                   {text:"Havaintopäivä", callbackOnSelect:()=>setSortObservationsBy("date")},
                                   {text:"100 Lajia -haaste", callbackOnSelect:()=>setSortObservationsBy("100-lajia")},
                               ]}
                               initialItemIdx={2}
                               showTooltip={true}/>
                   {lockElement}
               </div>
               <div className="elements">
                   {observationElements}
               </div>
           </div>

    // Called when the user requests us to add a new observation into the list.
    async function add_observation(bird)
    {
        const shades = await darken_viewport();

        await open_modal_dialog(QueryAddNewObservation,
        {
            bird,
            onAccept: async({year, month, day})=>
            {
                panic_if_undefined(year, month, day);

                await props.backend.post_observation(observation({bird, date:new Date(year, month-1, day)}));

                setObservationElements(generate_observation_elements());
            }
        });

        await shades.remove();
    }

    function generate_observation_elements()
    {
        const observationElements = [];

        // For the 100 Lajia challenge, we want to insert three kinds of elements: (1) ghost
        // elements for species that are included in the challenge but which the user hasn't
        // yet observed; (2) observed elements for species that the user has observed and which
        // are included in the challenge; and (3) additional observations that the user has
        // made but which aren't included in the challenge.
        //
        // Additionally, we want to sort those elements so that the species included in the
        // challenge appear first - in alphabetical order - followed by - in alphabetical
        // order - observations of species not included in the challenge.
        if (sortObservationsBy === "100-lajia")
        {
            // Add elements for species included in the challenge.
            sataLajia.forEach(species=>
            {
                const existingObservation = props.backend.observations().find(obs=>(obs.bird.species === species));

                observationElements.push(existingObservation? make_element_for_observation(existingObservation)
                                                            : make_element_for_challenge(species));
            });

            // Add elements for observations of species not included in the challenge.
            observationElements.push(sort_observation_list(props.backend.observations().slice())
                                     .filter(obs=>!sataLajia.includes(obs.bird.species))
                                     .map(obs=>make_element_for_observation(obs, <PlainTag text="Lisälaji"/>)));
        }
        // Otherwise, we just add observed elements for the observations the user has made, and
        // sort them according to whatever sorting option is currently selected.
        else
        {
            observationElements.push(sort_observation_list(props.backend.observations().slice()).map(obs=>make_element_for_observation(obs)));
        }

        return observationElements;

        function make_element_for_challenge(speciesName)
        {
            panic_if_not_type("string", speciesName);

            return <ObservationListElementGhost key={`ghost-of-${speciesName}`}
                                                speciesName={speciesName}
                                                visible={true}/>
        }

        function make_element_for_observation(obs, tag = <></>)
        {
            panic_if_not_type("object", obs);

            return <ObservationListElement observation={obs}
                                           key={obs.bird.species}
                                           tag={tag}
                                           visible={true}
                                           showOrderTags={sortObservationsBy === "order"}
                                           maxPlaceNameLength={props.backend.backend_limits().maxPlaceNameLength}
                                           requestDeleteObservation={async(self)=>await delete_observation(self)}
                                           requestChangeObservationDate={async(self, newDate)=>await set_observation_date(self, newDate)}
                                           requestChangeObservationPlace={async(self, newPlace)=>await set_observation_place(self, newPlace)}/>
        }
    }

    function sort_observation_list(list)
    {
        switch (sortObservationsBy)
        {
            case "order": return list.sort(sorters.family).sort(sorters.order);
            case "100-lajia": return list.sort(sorters["species"]);

            case "date":
            case "species": return list.sort(sorters[sortObservationsBy]);
            
            default: panic("Unknown sorter."); break;
        }
    }

    async function delete_observation(targetObservation)
    {
        await props.backend.delete_observation(targetObservation);
        setObservationElements(generate_observation_elements());
    }

    // Alters an existing observation's date to match the given year, month (1-12), and
    // day (1-31). Returns the updated observation; or null on error.
    async function set_observation_date(existingObservation, {year, month, day})
    {
        panic_if_undefined(existingObservation, year, month, day);

        const modifiedObservation = observation(
        {
            bird: existingObservation.bird,
            date: new Date(year, month-1, day),
        });

        if (!(await props.backend.post_observation(modifiedObservation)))
        {
            return null;
        }

        if (sortObservationsBy === "date")
        {
            setObservationElements(generate_observation_elements());
        }

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
        
        if (!(await props.backend.post_observation(modifiedObservation)))
        {
            return null;
        }

        return (props.backend.observations().find(obs=>obs.bird.species === existingObservation.bird.species) || null);
    }
}

ObservationList.validate_props = function(props)
{
    panic_if_undefined(props.backend);

    return;
}
