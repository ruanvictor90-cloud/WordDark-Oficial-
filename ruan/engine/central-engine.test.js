import assert from 'node:assert/strict';
import { createRuanEngine, RUAN_STORAGE_KEYS } from './central-engine.js';
class MemoryStorage { data=new Map(); getItem(key){return this.data.has(key)?this.data.get(key):null} setItem(key,value){this.data.set(key,String(value))} }
let n=0;const storage=new MemoryStorage();const engine=createRuanEngine({storage,now:()=> '2026-10-11T12:00:00.000Z',idFactory:()=> 'id-'+(++n),eventTarget:null});
const task=engine.addTask({title:'Concluir motor',dueDate:'2026-10-12',details:'Validar o núcleo'});
assert.equal(engine.getSnapshot().openTasks.length,1);engine.updateTask(task.id,{done:true});assert.equal(engine.getSnapshot().openTasks.length,0);assert.equal(engine.deleteTask(task.id),true);
engine.addFinanceEntry({title:'Pagamento recebido',type:'income',amount:1000});engine.addFinanceEntry({title:'Mercado',type:'expense',amount:125.50});const bill=engine.addFinanceEntry({title:'Internet',type:'bill',amount:99.90,dueDate:'2026-10-15'});
assert.equal(engine.getSnapshot().balance,874.5);assert.equal(engine.getSnapshot().pendingBills.length,1);engine.markBillPaid(bill.id);assert.equal(engine.getSnapshot().pendingBills.length,0);
assert.throws(()=>engine.addFinanceEntry({title:'Inválido',type:'expense',amount:-2}),/maior que zero/);assert.throws(()=>engine.addFinanceEntry({title:'Conta sem vencimento',type:'bill',amount:5}),/vencimento/);assert.ok(storage.getItem(RUAN_STORAGE_KEYS.finance));console.log('Ruan central engine tests passed.');
