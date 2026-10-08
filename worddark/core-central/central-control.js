import {createConnectionSystem} from "./connection-system.js";
import {worldAlignment} from "./world-alignment.js";

export class CentralControl {
  constructor({council,school,postingLine,automation=null,audit=null,connectionSystem=null}={}) {
    if(!council||!school||!postingLine) throw new Error("CENTRAL_CONTROL_COMPONENTS_REQUIRED");
    this.id="CENTRAL-CONTROL";
    this.council=council;this.school=school;this.postingLine=postingLine;this.automation=automation;this.audit=audit;
    this.connectionSystem=connectionSystem||createConnectionSystem({audit});
  }
  searchKnowledge(query,options={}) { return this.school.search(query,options); }
  reviewKnowledge({sectorId=null,records=null,worldSignals=[]}={}) { return this.school.analyzeLocalKnowledge(sectorId,{records,worldSignals}); }
  ingestExternalKnowledge(sourceId,options={}) { return this.school.ingestExternalKnowledge(sourceId,options); }
  ingestConnectionInformation(input={}) { return this.connectionSystem.bridge.ingest(input); }
  routeConnectionInformation(event,options={}) { return this.connectionSystem.bridge.route(event,options); }
  requestConnectionCapability(input={}) { return this.connectionSystem.door.requestCapability(input); }
  connectionWorldView() { return this.connectionSystem.door.worldView(); }
  worldAlignment() { return worldAlignment(); }
  listConnections() { return this.connectionSystem.registry.list(); }
  listConnectionProviders() { return this.connectionSystem.registry.listProviders(); }
  connectionStatus() { return this.connectionSystem.status(); }
  councilReview(input={}) { return this.council.reviewWorld(input); }
  councilJudge(input={}) { return this.council.judge(input); }
  prepareForHumanPosting(content,options={}) { return this.school.prepareContent(content,options); }
  sendToPostingLine(content,options={}) { return this.postingLine.submit(content,options); }
  confirmWorldAction(postId,options={}) { return this.postingLine.confirmWorldRelease(postId,options); }
  status() {
    return {
      id:this.id,
      council:this.council.status(),
      school:this.school.status(),
      postingLine:this.postingLine.status(),
      automation:this.automation?.status?.()||null,
      connections:this.connectionSystem.status()
    };
  }
}
