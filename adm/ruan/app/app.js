(() => {
  "use strict";
  const KEY = "ruan.organize.v1";
  const target = document.getElementById("alerts");
  const count = document.getElementById("alert-count");
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function readTasks() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "{}");
      return Array.isArray(data.tasks) ? data.tasks : [];
    } catch { return []; }
  }
  function dayStamp(value) {
    if (!value) return "";
    const date = new Date(value + "T12:00:00");
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
  }
  function render() {
    const now = new Date();
    const today = now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
    const tasks = readTasks().filter(task => task.status !== "done" && (task.priority === "urgent" || (task.dueDate && task.dueDate <= today)));
    tasks.sort((a,b) => {
      const au = a.priority === "urgent" ? 0 : 1, bu = b.priority === "urgent" ? 0 : 1;
      return au-bu || String(a.dueDate || "9999").localeCompare(String(b.dueDate || "9999"));
    });
    count.textContent = String(tasks.length);
    if (!tasks.length) {
      target.innerHTML = '<div class="empty"><span class="empty-mark">✓</span><div><strong>Tudo tranquilo por aqui</strong><p>Sem tarefas urgentes ou com prazo para hoje.</p></div></div>';
      return;
    }
    target.innerHTML = tasks.slice(0,5).map(task => {
      const overdue = task.dueDate && task.dueDate < today;
      const label = task.priority === "urgent" ? "Urgente" : overdue ? "Atrasada" : task.dueDate === today ? "Hoje" : dayStamp(task.dueDate);
      return '<a class="alert-item '+(task.priority === "urgent" || overdue ? "urgent" : "")+'" href="../apps/organize/index.html"><span class="alert-mark"></span><span class="alert-body"><strong>'+escapeHTML(task.title)+'</strong><p>'+escapeHTML(task.sector || "Entrada")+'</p></span><span class="alert-tag">'+escapeHTML(label)+'</span></a>';
    }).join("");
  }
  render();
  window.addEventListener("storage", event => { if (!event.key || event.key === KEY) render(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) render(); });
})();