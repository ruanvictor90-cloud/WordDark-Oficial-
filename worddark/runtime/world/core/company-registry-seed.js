(function(global){
  "use strict";

  function registerCoreCompanies(registry){
    if(!registry||typeof registry.register!=="function"){
      return{success:false,status:"COMPANY_REGISTRY_REQUIRED"};
    }

    const companies=[
      {
        id:"WD-COMP-MARKETING",
        name:"Empresa de Marketing",
        area:"SKY",
        type:"MARKETING_COMPANY",
        endpoint:"world/sky/marketing",
        capabilities:[
          "MARKETING_MANAGEMENT",
          "MARKET_ANALYSIS",
          "TREND_ANALYSIS",
          "OPPORTUNITY_DETECTION",
          "BRAND_IDENTITY",
          "NAMING",
          "POSITIONING",
          "AUDIENCE_STRATEGY",
          "CAMPAIGN_STRATEGY",
          "CHANNEL_MARKETING",
          "CONTENT_MARKETING",
          "GROWTH_STRATEGY"
        ],
        inputs:["MARKETING_REQUEST","MARKETING_OPPORTUNITY","COMPANY_INTENT","TREND_SIGNAL"],
        outputs:["MARKETING_STRATEGY","MARKETING_OPPORTUNITY","CAMPAIGN_BRIEF","CONTENT_DEMAND"]
      },
      {
        id:"WD-COMP-DIGITAL-OPS",
        name:"Empresa de Gestão de Conteúdos e Canais",
        area:"EARTH",
        type:"CONTENT_CHANNEL_MANAGEMENT_COMPANY",
        endpoint:"world/earth/content-channels",
        capabilities:[
          "CLIENT_ONBOARDING",
          "ACCOUNT_MANAGEMENT",
          "CHANNEL_MANAGEMENT","CONTENT_MANAGEMENT","CONTENT_STRATEGY","AUDIENCE_MANAGEMENT",
          "AUTONOMOUS_CHANNEL_OPERATION",
          "CONTENT_BRIEF_RECEIVING",
          "CONTENT_IDEA_REQUEST",
          "PROMOTION_CONTENT_REQUEST",
          "CONTENT_OPERATIONS",
          "CONTENT_PUBLICATION"
        ],
        inputs:["COMPANY_INTENT","COMPANY_CONTENT_REQUEST","CONTENT_IDEA_REQUEST","PROMOTION_REQUEST"],
        outputs:["DIGITAL_CHANNEL_OPERATION","CONTENT_REQUEST","PUBLICATION_REQUEST"]
      },
      {
        id:"WD-COMP-BUSINESS-MGMT",
        name:"Empresa de Gestão de Negócios",
        area:"EARTH",
        type:"BUSINESS_MANAGEMENT_COMPANY",
        endpoint:"world/earth/business-management",
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
        endpoint:"world/sky/darkfactory",
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
