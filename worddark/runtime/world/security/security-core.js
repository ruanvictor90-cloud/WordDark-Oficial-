const WordDarkAuthorityPolicy=require("./authority-policy");
const WordDarkAuditLedger=require("./audit-ledger");
const WordDarkIncidentResponse=require("./incident-response");
const WordDarkRecoveryManifest=require("./recovery-manifest");
const WordDarkSecretPolicy=require("./secret-policy");

class WordDarkSecurityCore {
  constructor(options={}) {
    this.authority=new WordDarkAuthorityPolicy(options.authority||{});
    this.audit=new WordDarkAuditLedger(options.audit||{});
    this.incidents=new WordDarkIncidentResponse({...options.incidents,auditLedger:this.audit});
    this.recovery=new WordDarkRecoveryManifest(options.recovery||{});
    this.secrets=new WordDarkSecretPolicy();
    this.status="ONLINE";
  }

  authorize(request={}) {
    const result=this.authority.authorize(request);
    this.audit.append({
      actorId:request.actorId||"UNKNOWN",
      action:"AUTHORIZATION_CHECK",
      resourceId:request.targetId||null,
      result:result.allowed?"ALLOWED":result.reason,
      severity:result.allowed?"INFO":"HIGH"
    });
    return result;
  }

  record(action,metadata={}) {
    return this.audit.append({actorId:metadata.actorId||"SECURITY",action,resourceId:metadata.resourceId||null,result:metadata.result||"RECORDED",severity:metadata.severity||"INFO",metadata});
  }

  getHealth() {
    const recovery=this.recovery.status();
    const audit=this.audit.verify();
    return {
      status:audit.valid?"HEALTHY":"CRITICAL",
      audit,
      recovery,
      incidents:this.incidents.list().filter(i=>i.state!=="CLOSED").length
    };
  }
}
if(typeof module!=="undefined") module.exports=WordDarkSecurityCore;
if(typeof window!=="undefined") window.WordDarkSecurityCore=WordDarkSecurityCore;
