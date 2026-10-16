(()=> {
  "use strict";

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  function read(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function localDateKey(date = new Date()) {
    return date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
  }

  function safeInternalHref(raw) {
    const fallback = "./index.html";
    try {
      const base = new URL("./", location.href);
      const target = new URL(String(raw || fallback), base);
      if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return fallback;
      return target.pathname + target.search + target.hash;
    } catch {
      return fallback;
    }
  }

  const phrases = [
    "Seu espaço. Seu ritmo.",
    "Um passo de cada vez já é progresso.",
    "Organize o presente e prepare o próximo passo.",
    "Suas ideias, sua rotina e seus projetos em um só lugar."
  ];
  let phraseIndex = 0;

  function renderGreeting() {
    const hour = new Date().getHours();
    const greeting = $("greeting");
    if (greeting) greeting.textContent = hour < 12 ? "Bom dia." : hour < 18 ? "Boa tarde." : "Boa noite.";
  }

  function rotatePhrase() {
    const target = $("greeting-phrase");
    if (!target) return;
    target.style.opacity = "0";
    window.setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      target.textContent = phrases[phraseIndex];
      target.style.opacity = "1";
    }, 180);
  }

  function getNotifications() {
    const today = localDateKey();
    const items = [];
    const tasks = read("ruan.pessoal.tasks.v1");
    const finance = read("ruan.pessoal.finance.v1");
    const appAlerts = read("ruan.important.notifications.v1");

    tasks.filter(task => task && !task.done && task.dueDate && task.dueDate <= today).forEach(task => {
      items.push({
        title: task.title || "Tarefa",
        detail: task.dueDate < today ? "Tarefa atrasada" : "Tarefa para hoje",
        urgent: task.dueDate < today,
        href: "./apps/pessoal/tarefas.html",
        date: task.dueDate
      });
    });

    finance.filter(item => item && item.type === "bill" && item.status !== "paid" &&
      item.status !== "cancelled" && item.dueDate && item.dueDate <= today).forEach(item => {
      items.push({
        title: item.title || "Conta a pagar",
        detail: "Pagamento pendente",
        urgent: true,
        href: "./apps/pessoal/financeiro.html",
        date: item.dueDate
      });
    });

    appAlerts.filter(item => item && typeof item.title === "string").slice(0, 20).forEach(item => {
      items.push({
        title: item.title,
        detail: item.detail || "Aviso importante de um aplicativo",
        urgent: item.urgent !== false,
        href: safeInternalHref(item.href),
        date: item.createdAt || today
      });
    });

    return items.sort((a, b) => String(b.date || "").localeCompare(String(a.date || ""))).slice(0, 30);
  }

  function renderNotifications() {
    const items = getNotifications();
    const badge = $("notification-badge");
    const list = $("notification-list");
    if (!badge || !list) return;
    badge.textContent = String(items.length);
    badge.hidden = !items.length;
    list.innerHTML = items.length
      ? items.map(item => '<a class="notification-item" href="' + esc(item.href) + '">' +
          '<span class="notification-dot ' + (item.urgent ? "urgent" : "") + '"></span>' +
          '<span><strong>' + esc(item.title) + '</strong><small>' + esc(item.detail) + '</small></span></a>').join("")
      : '<p class="notification-empty">Nenhuma notificação por enquanto.</p>';
  }

  function renderWidgets() {
    const finance = read("ruan.pessoal.finance.v1");
    const tasks = read("ruan.pessoal.tasks.v1");
    const balance = finance.reduce((sum, item) => {
      if (!item) return sum;
      if (item.type === "income") return sum + (Number(item.amount) || 0);
      if (item.type === "expense") return sum - (Number(item.amount) || 0);
      return sum;
    }, 0);
    const openTasks = tasks.filter(task => task && !task.done).length;
    const value = $("finance-widget-value");
    const count = $("tasks-widget-value");
    if (value) value.textContent = balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (count) count.textContent = String(openTasks);
  }

  const noticeBtn = $("notification-toggle");
  const noticePanel = $("notification-panel");
  const appsToggle = $("apps-toggle");
  const appsDrawer = $("apps-drawer");
  const backBtn = $("back-button");

  function closeNotifications() {
    if (noticePanel) noticePanel.hidden = true;
    if (noticeBtn) noticeBtn.setAttribute("aria-expanded", "false");
  }

  function closeApps() {
    if (appsDrawer) appsDrawer.hidden = true;
    if (appsToggle) appsToggle.setAttribute("aria-expanded", "false");
  }

  function toggleApps() {
    if (!appsDrawer || !appsToggle) return;
    const opening = appsDrawer.hidden;
    closeNotifications();
    appsDrawer.hidden = !opening;
    appsToggle.setAttribute("aria-expanded", String(opening));
  }

  if (backBtn) backBtn.addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
  });

  if (noticeBtn && noticePanel) {
    noticeBtn.addEventListener("click", () => {
      const opening = noticePanel.hidden;
      closeApps();
      noticePanel.hidden = !opening;
      noticeBtn.setAttribute("aria-expanded", String(opening));
      if (opening) renderNotifications();
    });
  }

  const noticeClose = $("notification-close");
  if (noticeClose) noticeClose.addEventListener("click", closeNotifications);
  if (appsToggle) appsToggle.addEventListener("click", toggleApps);
  const appsClose = $("apps-close");
  if (appsClose) appsClose.addEventListener("click", closeApps);

  document.addEventListener("click", event => {
    if (appsDrawer && appsToggle && !appsDrawer.hidden &&
      !appsDrawer.contains(event.target) && !appsToggle.contains(event.target)) closeApps();
    if (noticePanel && noticeBtn && !noticePanel.hidden &&
      !noticePanel.contains(event.target) && !noticeBtn.contains(event.target)) closeNotifications();
  });

  window.addEventListener("storage", () => { renderNotifications(); renderWidgets(); });
  window.addEventListener("ruan:data-changed", () => { renderNotifications(); renderWidgets(); });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderGreeting();
      renderNotifications();
      renderWidgets();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeNotifications();
      closeApps();
    }
  });

  renderGreeting();
  renderNotifications();
  renderWidgets();

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.setInterval(rotatePhrase, 6500);
  }

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
})();
