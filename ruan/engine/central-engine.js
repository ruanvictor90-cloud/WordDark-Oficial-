export const RUAN_STORAGE_KEYS = Object.freeze({
  tasks: 'ruan.pessoal.tasks.v1',
  finance: 'ruan.pessoal.finance.v1'
});

const safeArray = (value) => Array.isArray(value) ? value : [];
const positiveAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) throw new TypeError('O valor precisa ser maior que zero.');
  return Math.round(amount * 100) / 100;
};
const cleanText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(field + ' é obrigatório.');
  return value.trim();
};
const defaultId = () => globalThis.crypto?.randomUUID?.() ?? ('r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));

export function createRuanEngine({
  storage = globalThis.localStorage,
  now = () => new Date().toISOString(),
  idFactory = defaultId,
  eventTarget = globalThis.window
} = {}) {
  if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
    throw new TypeError('O motor Ruan precisa de um armazenamento compatível.');
  }

  function read(key) {
    try { return safeArray(JSON.parse(storage.getItem(key) || '[]')); }
    catch { return []; }
  }
  function write(key, value) {
    storage.setItem(key, JSON.stringify(value));
    try { eventTarget?.dispatchEvent?.(new CustomEvent('ruan:data-changed', { detail: { key } })); } catch {}
    return value;
  }
  function allTasks() { return read(RUAN_STORAGE_KEYS.tasks); }
  function allFinance() { return read(RUAN_STORAGE_KEYS.finance); }

  function addTask(input) {
    const task = {
      id: idFactory(), title: cleanText(input?.title, 'Título da tarefa'),
      details: typeof input?.details === 'string' ? input.details.trim() : '',
      dueDate: input?.dueDate || '',
      done: false, createdAt: now(), updatedAt: now()
    };
    if (task.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) throw new TypeError('Data da tarefa inválida.');
    write(RUAN_STORAGE_KEYS.tasks, [task, ...allTasks()]);
    return task;
  }
  function updateTask(id, patch = {}) {
    let found = false;
    const tasks = allTasks().map(task => {
      if (task.id !== id) return task;
      found = true;
      const next = { ...task, updatedAt: now() };
      if (patch.done !== undefined) next.done = Boolean(patch.done);
      if (patch.title !== undefined) next.title = cleanText(patch.title, 'Título da tarefa');
      if (patch.details !== undefined) next.details = String(patch.details).trim();
      if (patch.dueDate !== undefined) {
        if (patch.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(patch.dueDate)) throw new TypeError('Data da tarefa inválida.');
        next.dueDate = patch.dueDate;
      }
      return next;
    });
    if (!found) throw new Error('Tarefa não encontrada.');
    write(RUAN_STORAGE_KEYS.tasks, tasks);
    return tasks.find(task => task.id === id);
  }
  function deleteTask(id) {
    const tasks = allTasks();
    const next = tasks.filter(task => task.id !== id);
    if (next.length === tasks.length) return false;
    write(RUAN_STORAGE_KEYS.tasks, next);
    return true;
  }
  function addFinanceEntry(input) {
    const type = input?.type;
    if (!['income', 'expense', 'bill'].includes(type)) throw new TypeError('Tipo financeiro inválido.');
    const entry = {
      id: idFactory(), title: cleanText(input?.title, 'Descrição'),
      type, amount: positiveAmount(input?.amount),
      date: input?.date || now().slice(0, 10),
      dueDate: input?.dueDate || '',
      status: type === 'bill' ? 'pending' : 'recorded',
      notes: typeof input?.notes === 'string' ? input.notes.trim() : '',
      createdAt: now(), updatedAt: now()
    };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) throw new TypeError('Data do lançamento inválida.');
    if (entry.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(entry.dueDate)) throw new TypeError('Vencimento inválido.');
    if (type === 'bill' && !entry.dueDate) throw new TypeError('Conta a pagar precisa de vencimento.');
    write(RUAN_STORAGE_KEYS.finance, [entry, ...allFinance()]);
    return entry;
  }
  function markBillPaid(id, paid = true) {
    let found = false;
    const entries = allFinance().map(entry => {
      if (entry.id !== id) return entry;
      if (entry.type !== 'bill') throw new Error('Somente contas a pagar podem ser marcadas como pagas.');
      found = true;
      return { ...entry, status: paid ? 'paid' : 'pending', paidAt: paid ? now() : null, updatedAt: now() };
    });
    if (!found) throw new Error('Conta não encontrada.');
    write(RUAN_STORAGE_KEYS.finance, entries);
    return entries.find(entry => entry.id === id);
  }
  function deleteFinanceEntry(id) {
    const entries = allFinance();
    const next = entries.filter(entry => entry.id !== id);
    if (next.length === entries.length) return false;
    write(RUAN_STORAGE_KEYS.finance, next);
    return true;
  }
  function getSnapshot() {
    const tasks = allTasks();
    const finance = allFinance();
    const entries = finance.filter(item => item.type === 'income' || item.type === 'expense');
    const income = entries.filter(item => item.type === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expenses = entries.filter(item => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      tasks, finance,
      openTasks: tasks.filter(task => !task.done),
      overdueTasks: tasks.filter(task => !task.done && task.dueDate && task.dueDate < now().slice(0, 10)),
      balance: Math.round((income - expenses) * 100) / 100,
      pendingBills: finance.filter(item => item.type === 'bill' && item.status !== 'paid'),
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100
    };
  }

  return Object.freeze({ addTask, updateTask, deleteTask, addFinanceEntry, markBillPaid, deleteFinanceEntry, getSnapshot });
}
