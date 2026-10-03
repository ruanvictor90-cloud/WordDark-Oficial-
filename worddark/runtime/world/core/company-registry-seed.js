(function(global){
  "use strict";

  function registerCoreCompanies(registry){
    if(!registry||typeof registry.register!=="function"){
      return{success:false,status:"COMPANY_REGISTRY_REQUIRED"};
    }

    const companies=[
      {
        id:"WD-COMP-DIGITAL-OPS",
        name:"Empresa de Operação Digital",
        area:"EARTH",
        type:"DIGITAL_OPERATIONS_COMPANY",
        capabilities:[
          "CLIENT_ONBOARDING",
          "ACCOUNT_MANAGEMENT",
          "CHANNEL_MANAGEMENT",
          "AUTONOMOUS_CHANNEL_OPERATION",
          "CONTENT_BRIEF_RECEIVING",
          "CONTENT_IDEA_REQUEST",
          "PROMOTION_CONTENT_REQUEST",
          "CONTENT_OPERATIONS",
          "CONTENT_PUBLICATION"
        ],
        inputs:["COMPANY_CONTENT_REQUEST","CONTENT_IDEA_REQUEST","PROMOTION_REQUEST"],
        outputs:["DIGITAL_CHANNEL_OPERATION","CONTENT_REQUEST","PUBLICATION_REQUEST"]
      },
      {
        id:"WD-COMP-BUSINESS-MGMT",
        name:"Empresa de Gestão de Negócios",
        area:"EARTH",
        type:"BUSINESS_MANAGEMENT_COMPANY",
        capabilities:[
          "BUSINESS_MANAGEMENT",
          "BUSINESS_OPERATIONS",
          "PROCESS_MANAGEMENT",
          "RESOURCE_MANAGEMENT",
          "CONTENT_DEMAND_CREATION"
        ],
        outputs:["BUSINESS_OPERATION","COMPANY_REQUEST"]
      },
      {
        id:"WD-COMP-DARK-FACTORY",
        name:"Dark Factory",
        area:"SKY",
        type:"CONTENT_PRODUCTION_COMPANY",
        capabilities:[
          "CONTENT_CREATE",
          "CONTENT_EDIT",
          "CONTENT_ASSEMBLE",
          "CONTENT_RENDER",
          "CONTENT_TRANSFORM",
          "CONTENT_VALIDATE",
          "ASSET_PREPARE",
          "CONTENT_PACKAGE"
        ],
        inputs:["CONTENT_REQUEST","CONTENT_IDEA","PROMOTION_CONTENT"],
        outputs:["PRODUCED_CONTENT","VALIDATED_CONTENT"]
      }
    ];

    return{
      success:true,
      status:"CORE_COMPANIES_REGISTERED",
      companies:companies.map(company=>registry.register(company))
    };
  }

  if(typeof global!=="undefined")global.registerWordDarkCoreCompanies=registerCoreCompanies;
  if(typeof module!=="undefined"&&module.exports)module.exports={registerCoreCompanies};
})(typeof globalThis!=="undefined"?globalThis:window);
