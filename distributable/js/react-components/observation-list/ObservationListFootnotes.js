"use strict";import{panic_if_not_type}from"../../assert.js";export function ObservationListFootnotes(a={}){ObservationListFootnotes.validate_props(a);const b=a.numObservationsInList?React.createElement(React.Fragment,null,"Listassa on\xA0",React.createElement("span",{style:{fontWeight:"bold"}},a.numObservationsInList)," laji",1===a.numObservationsInList?"":"a","."):React.createElement(React.Fragment,null,"Listassa ei viel\xE4 ole lajihavaintoja."),c=a.numObservationsInList?React.createElement("span",{onClick:a.callbackDownloadList,style:{textDecoration:"underline",cursor:"pointer",fontVariant:"normal"}},"Lataa tiedot CSV:n\xE4"):React.createElement(React.Fragment,null);return React.createElement("div",{className:"ObservationListFootnotes"},React.createElement("div",{className:"observation-count"},b,"\xA0",c))}ObservationListFootnotes.validate_props=function(a){return panic_if_not_type("object",a),panic_if_not_type("number",a.numObservationsInList),void panic_if_not_type("function",a.callbackDownloadList)};