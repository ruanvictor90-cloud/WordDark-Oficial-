/* WordDark — Publication record contract */
class SucoCastPublication {
  constructor(data) {
    const source = data || {};
    this.publicationId = source.publicationId || ("SC-PUB-" + Date.now().toString(36).toUpperCase());
    this.contentId = source.contentId || null;
    this.platform = source.platform || null;
    this.account = source.account || null;
    this.operation = source.operation || null;
    this.status = source.status || "REQUESTED";
    this.externalId = source.externalId || null;
    this.externalUrl = source.externalUrl || null;
    this.createdAt = source.createdAt || new Date().toISOString();
    this.updatedAt = source.updatedAt || this.createdAt;
  }

  toJSON() {
    return {
      publicationId:this.publicationId,
      contentId:this.contentId,
      platform:this.platform,
      account:this.account,
      operation:this.operation,
      status:this.status,
      externalId:this.externalId,
      externalUrl:this.externalUrl,
      createdAt:this.createdAt,
      updatedAt:this.updatedAt
    };
  }
}

if (typeof window !== "undefined") window.SucoCastPublication = SucoCastPublication;
if (typeof module !== "undefined" && module.exports) module.exports = SucoCastPublication;
