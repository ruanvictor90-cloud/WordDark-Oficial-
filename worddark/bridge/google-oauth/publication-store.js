import {createHash} from "node:crypto";

/*
 * Durable publication state for the trusted WordDark backend.
 * This store deliberately does not authenticate callers or expose an HTTP route.
 * Firestore transactions provide atomic idempotency claims and quota reservations.
 */
const SAFE_ID=/^[a-zA-Z0-9._:-]{1,200}$/;

function stableId(value){
  return createHash("sha256").update(String(value)).digest("hex");
}
function requireId(value,name){
  if(typeof value!=="string"||!SAFE_ID.test(value))throw new Error(name+"_INVALID");
  return value;
}

export function createPublicationStore({
  firestore,
  FieldValue,
  collectionName="worddarkPublicationOperations",
  quotaCollectionName="worddarkPublicationQuotas",
  auditCollectionName="worddarkPublicationAudit",
  clock=()=>new Date()
}={}){
  if(!firestore||typeof firestore.collection!=="function")throw new Error("PUBLICATION_FIRESTORE_REQUIRED");
  const operations=firestore.collection(collectionName);
  const quotas=firestore.collection(quotaCollectionName);
  const auditCollection=firestore.collection(auditCollectionName);
  const serverTimestamp=()=>typeof FieldValue?.serverTimestamp==="function"?FieldValue.serverTimestamp():clock().toISOString();

  async function claim(idempotencyKey,{requestFingerprint,operationId}={}){
    requireId(idempotencyKey,"IDEMPOTENCY_KEY");
    requireId(operationId,"OPERATION_ID");
    if(typeof requestFingerprint!=="string"||!/^[a-f0-9]{64}$/.test(requestFingerprint))throw new Error("REQUEST_FINGERPRINT_INVALID");
    const ref=operations.doc(stableId(idempotencyKey));
    return firestore.runTransaction(async tx=>{
      const snapshot=await tx.get(ref);
      if(snapshot.exists){
        const prior=snapshot.data()||{};
        return{claimed:false,status:prior.requestFingerprint===requestFingerprint?"DUPLICATE_PUBLICATION_REQUEST":"IDEMPOTENCY_KEY_REUSED"};
      }
      tx.create(ref,{
        requestIdempotencyHash:stableId(idempotencyKey),
        requestFingerprint,operationId,
        status:"IN_PROGRESS",
        createdAt:serverTimestamp(),
        updatedAt:serverTimestamp()
      });
      return{claimed:true};
    });
  }

  async function complete(idempotencyKey,{requestFingerprint,status,externalId=null}={}){
    requireId(idempotencyKey,"IDEMPOTENCY_KEY");
    if(typeof requestFingerprint!=="string"||!/^[a-f0-9]{64}$/.test(requestFingerprint))throw new Error("REQUEST_FINGERPRINT_INVALID");
    if(typeof status!=="string"||!status.trim())throw new Error("PUBLICATION_STATUS_REQUIRED");
    const ref=operations.doc(stableId(idempotencyKey));
    return firestore.runTransaction(async tx=>{
      const snapshot=await tx.get(ref);
      if(!snapshot.exists)throw new Error("IDEMPOTENCY_CLAIM_NOT_FOUND");
      const prior=snapshot.data()||{};
      if(prior.requestFingerprint!==requestFingerprint)throw new Error("IDEMPOTENCY_FINGERPRINT_MISMATCH");
      if(prior.status!=="IN_PROGRESS"){
        if(prior.status===status&&prior.externalId===(externalId||null))return{updated:false,status:"ALREADY_RECORDED"};
        throw new Error("PUBLICATION_RESULT_ALREADY_FINAL");
      }
      tx.update(ref,{status:status.slice(0,80),externalId:externalId?String(externalId).slice(0,300):null,updatedAt:serverTimestamp()});
      return{updated:true,status:"RECORDED"};
    });
  }

  async function consumeQuota({principal,request,limit=20,windowMs=86400000}={}){
    if(!principal?.operatorId||!request?.providerId||!request?.accountId)throw new Error("QUOTA_CONTEXT_REQUIRED");
    if(!Number.isSafeInteger(limit)||limit<1||limit>100000||!Number.isSafeInteger(windowMs)||windowMs<1000)throw new Error("QUOTA_CONFIGURATION_INVALID");
    const now=clock();
    const bucket=Math.floor(now.getTime()/windowMs);
    const ref=quotas.doc(stableId([principal.operatorId,String(request.providerId).toUpperCase(),request.accountId,bucket].join(":")));
    return firestore.runTransaction(async tx=>{
      const snapshot=await tx.get(ref);
      const prior=snapshot.exists?(snapshot.data()||{}):{};
      const count=Number(prior.count||0);
      if(count>=limit)return{allowed:false,status:"PUBLICATION_QUOTA_EXCEEDED",limit,windowMs};
      tx.set(ref,{operatorId:principal.operatorId,providerId:String(request.providerId).toUpperCase(),accountId:String(request.accountId),bucket,count:count+1,limit,windowMs,updatedAt:serverTimestamp()});
      return{allowed:true,remaining:limit-count-1,limit,windowMs};
    });
  }

  async function audit(event={}){
    const record={
      at:typeof event.at==="string"?event.at:clock().toISOString(),
      type:String(event.type||"UNKNOWN").slice(0,80),
      status:String(event.status||"UNKNOWN").slice(0,80),
      requestId:event.requestId?String(event.requestId).slice(0,200):null,
      operationId:event.operationId?String(event.operationId).slice(0,200):null,
      providerId:event.providerId?String(event.providerId).slice(0,80):null,
      accountId:event.accountId?String(event.accountId).slice(0,200):null,
      operatorId:event.operatorId?String(event.operatorId).slice(0,200):null,
      approvalId:event.approvalId?String(event.approvalId).slice(0,200):null,
      idempotencyKeyHash:event.idempotencyKeyHash?String(event.idempotencyKeyHash).slice(0,64):null,
      createdAt:serverTimestamp()
    };
    // Firestore audit is append-only by this module; no payload or credential fields are accepted.
    const ref=auditCollection.doc();
    await ref.create(record);
    return{recorded:true,auditId:ref.id};
  }

  return Object.freeze({claim,complete,consumeQuota,audit});
}

export async function createCloudPublicationStore({
  projectId=process.env.GOOGLE_CLOUD_PROJECT,
  collectionName=process.env.WORDDARK_PUBLICATION_COLLECTION||"worddarkPublicationOperations",
  quotaCollectionName=process.env.WORDDARK_PUBLICATION_QUOTA_COLLECTION||"worddarkPublicationQuotas",
  auditCollectionName=process.env.WORDDARK_PUBLICATION_AUDIT_COLLECTION||"worddarkPublicationAudit"
}={}){
  if(!projectId)throw new Error("PUBLICATION_PROJECT_REQUIRED");
  const {Firestore,FieldValue}=await import("@google-cloud/firestore");
  const firestore=new Firestore({projectId});
  return createPublicationStore({firestore,FieldValue,collectionName,quotaCollectionName,auditCollectionName});
}
