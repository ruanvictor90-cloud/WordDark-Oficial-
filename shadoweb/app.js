(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const KEYS = { prefs: "shadoweb.preferences.v1", favorites: "shadoweb.favorites.v1", history: "shadoweb.history.v1" };
  const ENGINES = { duckduckgo: "https://duckduckgo.com/?q=", google: "https://www.google.com/search?q=", bing: "https://www.bing.com/search?q=" };
  const PROFILES = { personal: "Pessoal", study: "Estudos", work: "Trabalho", creator: "Criador", general: "Geral" };
  const state = { view: "home", prefs: { engine: "duckduckgo", profile: "personal" }, favorites: [], history: [] };
  let toastTimer;

  function read(key, fallback) {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { notify("O armazenamento local não está disponível neste navegador."); return false; }
  }
  function notify(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function normalizeHttps(value) {
    const raw = String(value || "").trim();
    if (!raw) throw new Error("Digite uma pesquisa ou endereço.");
    if (/^javascript:|^data:|^file:|^intent:/i.test(raw)) throw new Error("Esse tipo de endereço não é permitido.");
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new Error("Por segurança, use um endereço HTTPS sem credenciais.");
      return url.href;
    }
    if (/^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i.test(raw)) throw new Error("Endereços locais não são aceitos nesta versão.");
    if (/^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/.test(raw)) {
      const url = new URL("https://" + raw);
      if (!url.hostname.includes(".")) throw new Error("Endereço inválido.");
      return url.href;
    }
    return (ENGINES[state.prefs.engine] || ENGINES.duckduckgo) + encodeURIComponent(raw);
  }
  function safeLabel(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
  }
  function openAddress(raw) {
    let url;
    try { url = normalizeHttps(raw); }
    catch (error) { notify(error.message || "Endereço inválido."); return; }
    const item = { url, title: safeLabel(url), at: new Date().toISOString() };
    state.history = [item, ...state.history.filter(entry => entry.url !== url)].slice(0, 30);
    write(KEYS.history, state.history);
    renderHistory();
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) notify("O navegador bloqueou a nova aba. Permita a abertura de links e tente novamente.");
    else notify("Endereço enviado para abertura.");
  }
  function setView(view) {
    state.view = view;
    document.querySelectorAll(".tab").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    ["home", "favorites", "history", "connections"].forEach(name => {
      const section = $("view-" + name);
      if (section) section.hidden = name !== view;
    });
    renderFavorites();
    renderHistory();
  }
  function addFavorite(raw) {
    let url;
    try {
      url = normalizeHttps(raw);
      if (!/^https:\/\//i.test(url)) throw new Error("Salve um endereço HTTPS, não uma pesquisa.");
    } catch (error) { notify(error.message || "Endereço inválido."); return; }
    if (state.favorites.some(item => item.url === url)) { notify("Esse endereço já está nos favoritos."); return; }
    state.favorites = [{ url, title: safeLabel(url), at: new Date().toISOString() }, ...state.favorites].slice(0, 50);
    write(KEYS.favorites, state.favorites);
    renderFavorites();
    notify("Favorito salvo neste dispositivo.");
  }
  function makeSavedRow(item, removeKind) {
    const row = document.createElement("div");
    row.className = "saved-row";
    const main = document.createElement("button");
    main.type = "button";
    main.className = "saved-main";
    const strong = document.createElement("strong");
    strong.textContent = item.title || safeLabel(item.url);
    const small = document.createElement("small");
    small.textContent = item.url;
    main.append(strong, small);
    main.addEventListener("click", () => openAddress(item.url));
    row.append(main);
    if (removeKind) {
      const action = document.createElement("button");
      action.type = "button";
      action.className = "row-action";
      action.textContent = removeKind === "favorite" ? "Remover" : "Abrir";
      if (removeKind === "favorite") action.addEventListener("click", () => {
        state.favorites = state.favorites.filter(entry => entry.url !== item.url);
        write(KEYS.favorites, state.favorites); renderFavorites(); notify("Favorito removido.");
      });
      else action.addEventListener("click", () => openAddress(item.url));
      row.append(action);
    }
    return row;
  }
  function renderFavorites() {
    const list = $("favorites-list");
    list.replaceChildren();
    state.favorites.forEach(item => list.append(makeSavedRow(item, "favorite")));
    $("favorites-empty").hidden = state.favorites.length > 0;
    $("favorite-count").textContent = String(state.favorites.length);
  }
  function renderHistory() {
    const list = $("history-list");
    list.replaceChildren();
    state.history.forEach(item => list.append(makeSavedRow(item, "history")));
    $("history-empty").hidden = state.history.length > 0;
  }
  function setEye(open) {
    $("eye-panel").hidden = !open;
    if (open) $("close-eye").focus();
    else $("open-eye").focus();
  }
  function applyPrefs() {
    $("search-engine").value = state.prefs.engine;
    $("profile-select").value = state.prefs.profile;
    $("profile-name").textContent = PROFILES[state.prefs.profile] || "Pessoal";
  }
  $("search-form").addEventListener("submit", event => {
    event.preventDefault();
    openAddress($("address-input").value);
  });
  $("search-engine").addEventListener("change", event => {
    state.prefs.engine = ENGINES[event.target.value] ? event.target.value : "duckduckgo";
    write(KEYS.prefs, state.prefs);
    notify("Mecanismo de pesquisa atualizado.");
  });
  document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  document.querySelectorAll(".shortcut[data-url]").forEach(button => button.addEventListener("click", () => openAddress(button.dataset.url)));
  $("open-eye").addEventListener("click", () => setEye(true));
  $("eye-card").addEventListener("click", () => setEye(true));
  $("close-eye").addEventListener("click", () => setEye(false));
  $("profile-button").addEventListener("click", () => {
    if (typeof $("profile-dialog").showModal === "function") $("profile-dialog").showModal();
    else notify("A configuração de perfil não é suportada neste navegador.");
  });
  $("profile-form").addEventListener("submit", event => {
    event.preventDefault();
    state.prefs.profile = PROFILES[$("profile-select").value] ? $("profile-select").value : "personal";
    write(KEYS.prefs, state.prefs);
    applyPrefs();
    $("profile-dialog").close();
    notify("Perfil salvo neste dispositivo.");
  });
  $("add-favorite").addEventListener("click", () => {
    const value = $("address-input").value.trim();
    if (value) addFavorite(value);
    else {
      const input = window.prompt("Cole o endereço HTTPS que deseja salvar:");
      if (input) addFavorite(input);
    }
  });
  $("add-shortcut").addEventListener("click", () => {
    const input = window.prompt("Cole o endereço HTTPS do atalho:");
    if (input) addFavorite(input);
  });
  $("clear-history").addEventListener("click", () => {
    state.history = [];
    write(KEYS.history, state.history);
    renderHistory();
    notify("Histórico local limpo.");
  });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("eye-panel").hidden) setEye(false); });

  const prefs = read(KEYS.prefs, {});
  state.prefs.engine = ENGINES[prefs.engine] ? prefs.engine : "duckduckgo";
  state.prefs.profile = PROFILES[prefs.profile] ? prefs.profile : "personal";
  state.favorites = Array.isArray(read(KEYS.favorites, [])) ? read(KEYS.favorites, []).filter(item => item && typeof item.url === "string" && item.url.startsWith("https://")).slice(0, 50) : [];
  state.history = Array.isArray(read(KEYS.history, [])) ? read(KEYS.history, []).filter(item => item && typeof item.url === "string" && item.url.startsWith("https://")).slice(0, 30) : [];
  applyPrefs();
  renderFavorites();
  renderHistory();
})();