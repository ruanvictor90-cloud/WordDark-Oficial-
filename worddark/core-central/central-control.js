export class CentralControl {
  constructor({council,school,postingLine,automation=null,audit=null}={}) {
    if(!council||!school||!postingLine) throw new Error("CENTRAL_CONTROL_COMPONENTS_REQUIRED");
    this.id="CENTRAL-CONTROL";this.council=council;this.school=school;this.postingLine=postingLine;this.automation=automation;this.audit=audit;
  }
  reviewKnowledge({sectorId=null,records=null,worldSignals=[]}={}) {
    return this.school.analyzeLocalKnowledge(sectorId,{records,worldSignals});
  }
  councilReview(input={}) { return this.council.reviewWorld(input); }
  prepareForHumanPosting(content,options={}) { return this.school.prepareContent(content,options); }
  sendToPostingLine(content,options={}) { return this.postingLine.submit(content,options); }
  confirmWorldAction(postId,options={}) { return this.postingLine.confirmWorldRelease(postId,options); }
  status() {
    return {id:this.id,council:this.council.status(),school:this.school.status(),postingLine:this.postingLine.status(),automation:this.automation?.status?.()||null};
  }
}
