(() => {
  const root=document.documentElement;
  let saved="dark";
  try{saved=localStorage.getItem("worddark-theme")||"dark"}catch(e){}
  root.dataset.theme=saved==="light"?"light":"dark";
  const button=document.querySelector("[data-wd-theme]");
  if(button){
    const sync=()=>{button.textContent=root.dataset.theme==="light"?"☾ Modo escuro":"☀ Modo claro"};
    button.addEventListener("click",()=>{
      root.dataset.theme=root.dataset.theme==="light"?"dark":"light";
      try{localStorage.setItem("worddark-theme",root.dataset.theme)}catch(e){}
      sync();
    });
    sync();
  }
})();
  const entries=document.querySelectorAll("[data-wd-entry]");
  entries.forEach((entry)=>{
    const image=entry.dataset.wdEntry;
    if(image){
      const media=document.createElement("div");
      media.className="wd-entry-media";
      media.style.backgroundImage="url(" + JSON.stringify(image) + ")";
      entry.prepend(media);
    }
  });
