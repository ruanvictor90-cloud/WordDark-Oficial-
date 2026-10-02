import { id } from './id.js';

export class AccountOperationsManager{
  constructor({accountManager}={}){
    if(!accountManager)throw new Error('ACCOUNT_MANAGER_REQUIRED');
    this.accountManager=accountManager;
    this.id='ACCOUNT-OPERATIONS-MANAGER';
    this.name='Gestor Central da Conta';
    this.status='ACTIVE';
  }

  createBroadcastOperation({type='CONTENT',content={},profileIds=null,requirements=[]}={}){
    const profiles=this.accountManager.listProfiles();
    const targets=profileIds
      ? profiles.filter(profile=>profileIds.includes(profile.id))
      : profiles.filter(profile=>profile.status!=='ARCHIVED');

    if(!targets.length)throw new Error('NO_TARGET_PROFILES');

    const operationId=id('BROADCAST-OP');
    const operation={
      id:operationId,
      type,
      mode:'BROADCAST',
      accountId:this.accountManager.id,
      accountName:this.accountManager.name,
      sourceManagerId:this.id,
      content:structuredClone(content),
      requirements:structuredClone(requirements),
      status:'REQUESTED',
      targets:targets.map(profile=>({
        profileId:profile.id,
        network:profile.network,
        profileName:profile.displayName,
        managerId:profile.managerId,
        status:'REQUESTED'
      })),
      createdAt:new Date().toISOString()
    };

    this.accountManager.record('BROADCAST_OPERATION_CREATED',operation);
    return operation;
  }

  dispatch(operation){
    if(!operation?.id)throw new Error('BROADCAST_OPERATION_REQUIRED');
    const dispatched=structuredClone(operation);
    dispatched.status='DISPATCHED';
    dispatched.targets=dispatched.targets.map(target=>({
      ...target,
      status:'QUEUED'
    }));
    this.accountManager.record('BROADCAST_OPERATION_DISPATCHED',dispatched);
    return dispatched;
  }

  status(){
    return {
      id:this.id,
      name:this.name,
      role:'ACCOUNT_OPERATIONS_MANAGER',
      status:this.status,
      managedProfiles:this.accountManager.listProfiles().length
    };
  }
}
