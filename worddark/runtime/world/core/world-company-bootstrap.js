/* WordDark — World Company Bootstrap
 * Inicializa o registro das empresas e o resolvedor de capacidades.
 */
(function(global){
  "use strict";

  function bootstrapWordDarkCompanies({registry=null}={}){
    const companyRegistry=registry||(
      typeof global.WordDarkCompanyRegistry==="function"
        ? new global.WordDarkCompanyRegistry()
        : null
    );
    if(!companyRegistry)return{success:false,status:"COMPANY_REGISTRY_REQUIRED"};

    if(typeof global.registerWordDarkCoreCompanies==="function"){
      global.registerWordDarkCoreCompanies(companyRegistry);
    }

    const router=typeof global.WordDarkCompanyIntentRouter==="function"
      ? new global.WordDarkCompanyIntentRouter({companyRegistry})
      : null;

    global.WordDarkWorldCompanies={
      registry:companyRegistry,
      router
    };

    return{
      success:true,
      status:"WORLD_COMPANIES_READY",
      registry:companyRegistry.getStatus(),
      router:!!router
    };
  }

  if(typeof global!=="undefined")global.bootstrapWordDarkCompanies=bootstrapWordDarkCompanies;
  if(typeof module!=="undefined"&&module.exports)module.exports={bootstrapWordDarkCompanies};
})(typeof globalThis!=="undefined"?globalThis:window);
