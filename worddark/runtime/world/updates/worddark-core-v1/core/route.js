/* WordDark Lab — Transport route */
class WordDarkLabRoute {
  constructor(s={}){this.routeId=s.routeId||null;this.origin=s.origin||null;this.destination=s.destination||null;this.serviceId=s.serviceId||"*";this.status=s.status||"ACTIVE";}
  validate(){const e=[];if(!this.routeId)e.push("routeId é obrigatório.");if(!this.origin)e.push("origin é obrigatório.");if(!this.destination)e.push("destination é obrigatório.");return {valid:e.length===0,errors:e};}
  allows(op){return this.status==="ACTIVE"&&this.origin===op.origin&&this.destination===op.destination&&(this.serviceId==="*"||this.serviceId===op.serviceId);}
}
class WordDarkLabRouter {
  constructor(){this.routes=[];}
  add(route){const v=route.validate();if(!v.valid)throw new Error(v.errors.join(" "));this.routes.push(route);return route;}
  resolve(op){return this.routes.find(r=>r.allows(op))||null;}
}
if(typeof module!=="undefined")module.exports={WordDarkLabRoute,WordDarkLabRouter};
if(typeof window!=="undefined"){window.WordDarkLabRoute=WordDarkLabRoute;window.WordDarkLabRouter=WordDarkLabRouter;}
