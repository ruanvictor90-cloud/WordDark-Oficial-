export class DependencyMap{
  constructor({audit=null}={}){this.edges=new Map();this.audit=audit;}
  add({module,dependsOn,reason="RUNTIME_DEPENDENCY",required=true}={}){
    if(!module||!dependsOn)throw new Error("DEPENDENCY_FIELDS_REQUIRED");
    const key=module+"::"+dependsOn;
    const edge={module,dependsOn,reason,required:Boolean(required),createdAt:new Date().toISOString()};
    this.edges.set(key,edge);this.audit?.record?.("DEPENDENCY_REGISTERED",edge);return structuredClone(edge);
  }
  remove(module,dependsOn){return this.edges.delete(module+"::"+dependsOn);}
  dependenciesOf(module){return [...this.edges.values()].filter(x=>x.module===module).map(x=>structuredClone(x));}
  dependentsOf(module){return [...this.edges.values()].filter(x=>x.dependsOn===module).map(x=>structuredClone(x));}
  canDeactivate(module){const blockers=this.dependentsOf(module).filter(x=>x.required);return{allowed:blockers.length===0,blockers};}
  list(){return [...this.edges.values()].map(x=>structuredClone(x));}
  graph(){const graph={};for(const edge of this.edges.values())(graph[edge.module]??=[]).push(edge.dependsOn);return graph;}
}
