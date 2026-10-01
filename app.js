const channels=[...document.querySelectorAll(".wd-channel")];
const activeChannel=document.querySelector("#active-channel");
channels.forEach(button=>button.addEventListener("click",()=>{
  channels.forEach(x=>x.classList.remove("active"));
  button.classList.add("active");
  if(activeChannel) activeChannel.textContent=button.dataset.channel||"Canal";
}));
const themeButton=document.querySelector("[data-wd-theme]");
function syncTheme(){
  const light=document.documentElement.dataset.theme==="light";
  if(themeButton) themeButton.textContent=light?"☾ Tema escuro":"☼ Tema claro";
}
themeButton?.addEventListener("click",()=>{
  document.documentElement.dataset.theme=document.documentElement.dataset.theme==="light"?"":"light";
  syncTheme();
});
syncTheme();
document.querySelectorAll(".wd-nav a").forEach(link=>link.addEventListener("click",()=>{
  document.querySelectorAll(".wd-nav a").forEach(x=>x.classList.remove("active"));
  link.classList.add("active");
}));