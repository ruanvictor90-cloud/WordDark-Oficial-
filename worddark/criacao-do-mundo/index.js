export function createWorldCreation({runtime,library,security}={}){
  const proposals=new Map();
  return {
    propose(operation,reason="CAPABILITY_NOT_FOUND"){
      const proposal={id:"PROP-"+Date.now().toString(36).toUpperCase(),sourceOperation:operation.id,service:operation.service,reason,status:"PENDING_AUTHORIZATION",structure:{gate:true,road:true,registry:true,permissions:true,audit:true},createdAt:new Date().toISOString()};
      proposals.set(proposal.id,proposal);
      library?.save({id:proposal.id,type:"WORLD_CREATION_PROPOSAL",data:proposal});
      return proposal;
    },
    authorize(proposalId){
      const proposal=proposals.get(proposalId);
      if(!proposal) throw new Error("PROPOSAL_NOT_FOUND");
      proposal.status="AUTHORIZED";
      return proposal;
    },
    get(proposalId){return proposals.get(proposalId)||null;},
    list(){return [...proposals.values()];},
    status(){return {proposals:proposals.size,pending:[...proposals.values()].filter(x=>x.status==="PENDING_AUTHORIZATION").length};}
  };
}
