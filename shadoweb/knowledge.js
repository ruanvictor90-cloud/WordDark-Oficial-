const KEY = "shadoweb.knowledge.v1";
export class Knowledge {
  constructor({ storage = localStorage, audit }) { this.storage = storage; this.audit = audit; }
  list() { try { const rows = JSON.parse(this.storage.getItem(KEY) || "[]"); return Array.isArray(rows) ? rows : []; } catch { return []; } }
  save({ id, title, body }) {
    title = String(title || "").trim(); body = String(body || "").trim();
    if (!title || title.length > 120 || !body || body.length > 5000) throw new Error("Título obrigatório (até 120 caracteres) e conteúdo de até 5.000 caracteres.");
    const current = this.list(); const record = { id: id || crypto.randomUUID(), title, body, updatedAt: new Date().toISOString() };
    const next = [record, ...current.filter(item => item.id !== record.id)].slice(0, 200);
    this.storage.setItem(KEY, JSON.stringify(next)); this.audit.record("knowledge.saved", { noteId:record.id }); return record;
  }
  remove(id) { this.storage.setItem(KEY, JSON.stringify(this.list().filter(item => item.id !== id))); this.audit.record("knowledge.deleted", { noteId:id }); }
  export() { return { format:"shadoweb-knowledge", version:1, exportedAt:new Date().toISOString(), notes:this.list() }; }
  import(data) {
    if (!data || data.format !== "shadoweb-knowledge" || data.version !== 1 || !Array.isArray(data.notes) || data.notes.length > 200) throw new Error("Arquivo de biblioteca inválido.");
    const clean = data.notes.map(note => ({ id:String(note.id || crypto.randomUUID()).slice(0,80), title:String(note.title || "").trim().slice(0,120), body:String(note.body || "").trim().slice(0,5000), updatedAt:new Date(note.updatedAt || Date.now()).toISOString() })).filter(note => note.title && note.body);
    this.storage.setItem(KEY, JSON.stringify(clean)); return clean.length;
  }
}
