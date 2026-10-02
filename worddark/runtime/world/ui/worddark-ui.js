(() => {
  const root=document.documentElement;
  let saved="dark";
  try{saved=localStorage.getItem("worddark-theme")||"dark"}catch(e){}
  root.dataset.theme=saved==="light"?"light":"dark";

  const themeButton=document.querySelector("[data-wd-theme]");
  if(themeButton){
    const sync=()=>{themeButton.textContent=root.dataset.theme==="light"?"☾ Modo escuro":"☀ Modo claro"};
    themeButton.addEventListener("click",()=>{
      root.dataset.theme=root.dataset.theme==="light"?"dark":"light";
      try{localStorage.setItem("worddark-theme",root.dataset.theme)}catch(e){}
      sync();
    });
    sync();
  }

  document.querySelectorAll("[data-wd-entry]").forEach((entry)=>{
    const image=entry.dataset.wdEntry;
    if(image){
      const media=document.createElement("div");
      media.className="wd-entry-media";
      media.style.backgroundImage="url(" + JSON.stringify(image) + ")";
      entry.prepend(media);
    }
  });

  const toggle=document.querySelector(".wd-menu-toggle");
  const sidebar=document.querySelector(".wd-sidebar");
  if(toggle && sidebar){
    const backdrop=document.createElement("div");
    backdrop.className="wd-menu-backdrop";
    document.body.appendChild(backdrop);
    const setOpen=(open)=>{
      document.body.classList.toggle("wd-menu-open",open);
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Fechar menu":"Abrir menu");
      toggle.textContent=open?"×":"☰";
    };
    toggle.addEventListener("click",()=>setOpen(!document.body.classList.contains("wd-menu-open")));
    backdrop.addEventListener("click",()=>setOpen(false));
    sidebar.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setOpen(false)));
  }
})();