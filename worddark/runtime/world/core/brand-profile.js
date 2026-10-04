/**
 * WordDark Brand Profile Contract
 * Reusable identity model consumed by Marketing and official profiles.
 */
(function(global){
  class WordDarkBrandProfile {
    constructor(input={}){
      this.brandId=input.brandId||"";
      this.profileId=input.profileId||"";
      this.name=input.name||"";
      this.positioning=input.positioning||"";
      this.promise=input.promise||"";
      this.mission=input.mission||"";
      this.personality=input.personality||[];
      this.voice=input.voice||{};
      this.audience=input.audience||[];
      this.visual=input.visual||{};
      this.bio=input.bio||{};
      this.contentPillars=input.contentPillars||[];
      this.platforms=input.platforms||{};
      this.rules=input.rules||[];
      this.version=input.version||"1.0.0";
      this.status=input.status||"DRAFT";
    }
    toJSON(){ return JSON.parse(JSON.stringify(this)); }
  }
  global.WordDarkBrandProfile=WordDarkBrandProfile;
})(typeof window!=="undefined"?window:globalThis);
