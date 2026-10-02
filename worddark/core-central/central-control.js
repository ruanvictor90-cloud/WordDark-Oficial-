export class CentralControl {
  constructor({council,school,postingLine,automation=null,audit=null}={}) {
    if(!council||!school||!postingLine) throw new Error("CENTRAL_CONTROL_COMPONENTS_REQUIRED");
    this.id="CENTRAL-CONTROL";
    this.council=council;
    this.school=school;
    this.postingLine=postingLine;
    this.automation=automation;
    this.audit=audit;
  }
  status() {
    return {
      id:this.id,
      council:this.council.status(),
      school:this.school.status(),
      postingLine:this.postingLine.status(),
      automation:this.automation?.status?.()||null
    };
  }
}
