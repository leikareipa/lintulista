"use strict";import{panic_if_not_type,throw_if_not_true}from"../../assert.js";import{Observation}from"../../observation.js";import{BirdSearch}from"../bird-search/BirdSearch.js";import{MenuButton}from"../buttons/MenuButton.js";import{Bird}from"../../bird.js";export function ObservationListMenuBar(a={}){ObservationListMenuBar.validate_props(a);const b={largeEnoughForTooltips:window.matchMedia("(min-width: 500px)")},[c,d]=React.useState(!1),[e,f]=React.useState(b.largeEnoughForTooltips.matches);return b.largeEnoughForTooltips.addListener(a=>f(a.matches)),React.useEffect(()=>{function a(){!c&&220<window.scrollY?d(!0):c&&220>=window.scrollY&&d(!1)}return a(),window.addEventListener("scroll",a),()=>{window.removeEventListener("scroll",a)}}),React.createElement("div",{className:`ObservationListMenuBar ${a.enabled?"enabled":"disabled"} ${c?"sticky":""}`.trim()},React.createElement(BirdSearch,{backend:a.backend,callbackAddObservation:a.callbackAddObservation,callbackRemoveObservation:a.callbackRemoveObservation,callbackChangeObservationDate:a.callbackChangeObservationDate}),React.createElement("div",{className:"buttons"},React.createElement(MenuButton,{icon:"fas fa-list-ul fa-fw",title:"Listan j\xE4rjestys",id:"list-sorting",items:[{text:"Laji",callbackOnSelect:()=>a.callbackSetListSorting("species")},{text:"P\xE4iv\xE4",callbackOnSelect:()=>a.callbackSetListSorting("date")},{text:"100 Lajia",callbackOnSelect:()=>a.callbackSetListSorting("sata-lajia")}],initialItemIdx:a.backend.observations().length?1:2,showTooltip:!c&&e}),React.createElement(MenuButton,{icon:"fas fa-question fa-fw",title:"Tietoja",id:"list-info",showTooltip:!1,customMenu:React.createElement("div",null,React.createElement("div",{style:{textAlign:"center"}},"Tietoja Lintulistasta"),React.createElement("a",{href:"./guide/",target:"_blank",rel:"noopener noreferrer"},"K\xE4ytt\xF6ohje"),React.createElement("br",null),React.createElement("a",{href:"mailto:sw@tarpeeksihyvaesoft.com"},"Yhteydenotto"),React.createElement("br",null),React.createElement("a",{href:"./guide/images.html",target:"_blank",rel:"noopener noreferrer"},"Kuvien tiedot"),React.createElement("br",null))}),React.createElement("a",{className:`lock ${a.backend.hasEditRights?"unlocked":"locked"}`.trim(),title:a.backend.hasEditRights?"Avaa listan julkinen versio":"Julkista listaa ei voi muokata",href:a.backend.hasEditRights?`./katsele/${a.backend.viewKey}`:null,rel:"noopener noreferrer",target:"_blank"},React.createElement("i",{className:a.backend.hasEditRights?"fas fa-unlock-alt fa-fw":"fas fa-lock fa-fw"}))))}ObservationListMenuBar.defaultProps={enabled:!0},ObservationListMenuBar.validate_props=function(a){return panic_if_not_type("object",a,a.backend),void panic_if_not_type("function",a.callbackAddObservation,a.callbackSetListSorting)},ObservationListMenuBar.test=()=>{let a={remove:()=>{}};try{a=document.createElement("div"),document.body.appendChild(a);const b={hasEditRights:!0,viewKey:"abcdefg",known_birds:()=>[Bird({species:"Alli",family:"",order:""}),Bird({species:"Naakka",family:"",order:""})],observations:()=>[Observation({bird:Bird({species:"Naakka",family:"",order:""}),date:new Date(1e3)})]};ReactTestUtils.act(()=>{const c=React.createElement(ObservationListMenuBar,{backend:b,enabled:!0,callbackAddObservation:()=>{},callbackRemoveObservation:()=>{},callbackChangeObservationDate:()=>{},callbackSetListSorting:()=>{}});ReactDOM.unmountComponentAtNode(a),ReactDOM.render(c,a)}),throw_if_not_true([()=>null!==a.querySelector(".ObservationListMenuBar"),()=>null!==a.querySelector(".BirdSearch"),()=>null!==a.querySelector(".buttons"),()=>null!==a.querySelector(".lock"),()=>"a"===a.querySelector(".lock").tagName.toLowerCase(),()=>a.querySelector(".lock").classList.contains("unlocked"),()=>`./katsele/${b.viewKey}`===a.querySelector(".lock").getAttribute("href")])}catch(a){if("assertion failure"===a)return!1;throw a}finally{a.remove()}try{a=document.createElement("div"),document.body.appendChild(a);const b={hasEditRights:!1,viewKey:"abcdefg",known_birds:()=>[Bird({species:"Alli",family:"",order:""}),Bird({species:"Naakka",family:"",order:""})],observations:()=>[Observation({bird:Bird({species:"Naakka",family:"",order:""}),date:new Date(1e3)})]};ReactTestUtils.act(()=>{const c=React.createElement(ObservationListMenuBar,{backend:b,enabled:!0,callbackAddObservation:()=>{},callbackRemoveObservation:()=>{},callbackChangeObservationDate:()=>{},callbackSetListSorting:()=>{}});ReactDOM.unmountComponentAtNode(a),ReactDOM.render(c,a)}),throw_if_not_true([()=>null!==a.querySelector(".ObservationListMenuBar"),()=>null!==a.querySelector(".BirdSearch"),()=>null!==a.querySelector(".buttons"),()=>null!==a.querySelector(".lock"),()=>"a"===a.querySelector(".lock").tagName.toLowerCase(),()=>a.querySelector(".lock").classList.contains("locked"),()=>!a.querySelector(".lock").getAttribute("href")])}catch(a){if("assertion failure"===a)return!1;throw a}finally{a.remove()}return!0};