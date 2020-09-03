"use strict";import{error,panic_if_not_type}from"./assert.js";export function darken_viewport(a={}){panic_if_not_type("object",a),a={...darken_viewport.defaultArgs,...a};const b=function(){var a=Math.min,b=Math.floor;let c=0,d=[..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._"],e=null;do{if(100<++c)return null;for(let c=0;c<2*d.length;c++){const c=a(d.length-1,b(Math.random()*d.length)),e=a(d.length-1,b(Math.random()*d.length));[d[c],d[e]]=[d[e],d[c]]}d[0].match(/[0-9]/)&&(d[0]="b"),e=`shades-generated-kpAOerCd4-${d.join("")}`}while(document.getElementById(e));return e}();b||error("Failed to generate a valid DOM id for a shade element.");const c=(()=>{const c=document.createElement("div");return c.id=b,c.onclick=a.onClick,c.style.cssText=`background-color: black;
                                 position: fixed;
                                 top: 0;
                                 left: 0;
                                 width: 100%;
                                 height: 100%;
                                 opacity: 0;
                                 transition: opacity ${.2}s linear;
                                 z-index: ${a.z};`,document.body.appendChild(c),c})(),d=Object.freeze({id:b,remove:()=>new Promise(a=>b?void(c.style.opacity="0",setTimeout(()=>{c.remove(),a()},200)):void a())});return new Promise(e=>b?void(c.style.zIndex=a.z,c.onclick=a.onClick,c.style.opacity=`${window.getComputedStyle(c).opacity+a.opacity}`,setTimeout(()=>{e(d)},200)):void e(d))}darken_viewport.defaultArgs={z:100,opacity:.4,onClick:()=>{}};