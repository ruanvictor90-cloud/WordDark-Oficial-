/* WordDark — Content contract */
class SucoCastContent {
  constructor(data) {
    const source = data || {};
    this.contentId = source.contentId || ("SC-CONT-" + Date.now().toString(36).toUpperCase());
    this.type = source.type || "VIDEO";
    this.title = source.title || "";
    this.body = source.body || "";
    this.asset = source.asset || null;
    this.metadata = source.metadata || {};
    this.version = source.version || 1;
    this.status = source.status || "READY";
  }

  validate() {
    return !!this.contentId && !!this.title && !!this.type && !!this.asset;
  }

  toJSON() {
    return {
      contentId:this.contentId,
      type:this.type,
      title:this.title,
      body:this.body,
      asset:this.asset,
      metadata:this.metadata,
      version:this.version,
      status:this.status
    };
  }
}

if (typeof window !== "undefined") window.SucoCastContent = SucoCastContent;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastContent;
