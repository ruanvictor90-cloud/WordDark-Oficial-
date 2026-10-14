import { DARKNET_PROFILES, loadPreferences, savePreferences, buildSearchUrl } from "./browser-core.js";
const $=id=>document.getElementById(id);
let prefs=loadPreferences(globalThis.localStorage);
let activeView="home";
function profile(){return DARKNET_PROFILES.find(item=>item.id===prefs.profile)||DARKNET_PROFILES[0]}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(message){const node=$("toast");node.textContent=message;node.classList.add("show");setTimeout(()=>node.classList.remove("show"),2200)}
function persist(){prefs=savePreferences(globalThis.localStorage,prefs);render()}
function render(){const p=profile();$("profile-label").textContent=p.label;$("profile").value=p.id;$("engine").value=prefs.engine;$("profile-description").textContent=p.description+" — pesquisa e atalhos organizados para você.";$("greeting").textContent=prefs.profile==="personal"?"A internet, do seu jeito.": "Sua internet para "+p.label.toLowerCase()+".";
document.querySelectorAll("[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===activeView));
$("home-view").hidden=activeView!=="home";$("favorites-view").hidden=activeView!=="favorites";$("connections-view").hidden=activeView!=="connections";
$("favorites-list").innerHTML=prefs.favorites.length?prefs.favorites.map(url=>'<a class="shortcut" href="'+esc(url)+'" target="_blank" rel="noopener"><span class="shortcut-icon">↗</span><strong>'+esc(new URL(url).hostname)+'</strong><small>Abrir favorito</small></a>').join(""):'<p class="footnote">Você ainda não salvou favoritos. Use “+ Adicionar” para guardar um endereço HTTPS.</p>'}
$("search-form").addEventListener("submit",event=>{event.preventDefault();try{const url=buildSearchUrl($("address").value,prefs.engine);window.location.href=url}catch(error){toast(error.message)}});
$("engine").addEventListener("change",event=>{prefs.engine=event.target.value;persist()});
$("profile-open").addEventListener("click",()=>{if(typeof $("profile-dialog").showModal==="function")$("profile-dialog").showModal();else toast("Abra as preferências pelo navegador compatível.")});
$("save-profile").addEventListener("click",()=>{prefs.profile=$("profile").value;persist();toast("Perfil salvo neste dispositivo.")});
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",()=>{activeView=button.dataset.view;render()}));
document.querySelectorAll("[data-url]").forEach(button=>button.addEventListener("click",()=>{window.location.href=button.dataset.url}));
$("add-favorite").addEventListener("click",()=>{const value=prompt("Cole um endereço HTTPS para salvar nos favoritos:");if(!value)return;try{const url=new URL(value.trim());if(url.protocol!=="https:")throw new Error("Use um endereço HTTPS.");prefs.favorites.push(url.href);persist();toast("Favorito salvo.")}catch(error){toast(error.message||"Endereço inválido.")}});
render();
