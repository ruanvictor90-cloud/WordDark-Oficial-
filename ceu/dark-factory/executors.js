export class FactoryExecutors {
 constructor(){this.items=new Map();}
 register({id,name,handler}){if(!id||typeof handler!=="function")throw new Error("EXECUTOR_INVALID");this.items.set(id,{id,name:name||id,handler});}
 execute(id,operation){const e=this.items.get(id);if(!e)return {success:false,reason:"EXECUTOR_NOT_FOUND",executorId:id};return e.handler(operation);}
 list(){return [...this.items.values()].map(({handler,...x})=>x);}
}

export function registerDefaultContentExecutors(factory){
 for(const id of ["IDENTITY","IMAGE","INTELLIGENCE","SCRIPT"]){factory.registerExecutor({id,handler:op=>({success:true,result:{executor:id,operationId:op.id,payload:op.payload}})});}
 return factory;
}
