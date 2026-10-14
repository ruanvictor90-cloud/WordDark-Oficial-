import {createHash} from "node:crypto";

export function createConnectionStore({firestore,kms,keyName,collectionName="worddarkExternalConnections",clock=()=>new Date()}={}){
  if(!firestore||!kms||!keyName)throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const collection=firestore.collection(collectionName);
  async function encryptTokens(tokens){
    const plaintext=Buffer.from(JSON.stringify({
      access_token:tokens.access_token,
      refresh_token:tokens.refresh_token,
      token_type:tokens.token_type||"Bearer",
      scope:tokens.scope||"",
      expiry_date:tokens.expires_in?clock().getTime()+Number(tokens.expires_in)*1000:null
    }));
    const [result]=await kms.encrypt({name:keyName,plaintext});
    if(!result?.ciphertext)throw new Error("TOKEN_ENCRYPTION_FAILED");
    return Buffer.from(result.ciphertext).toString("base64");
  }
  async function decryptTokens(ciphertext){
    const [result]=await kms.decrypt({name:keyName,ciphertext:Buffer.from(ciphertext,"base64")});
    if(!result?.plaintext)throw new Error("TOKEN_DECRYPTION_FAILED");
    return JSON.parse(Buffer.from(result.plaintext).toString("utf8"));
  }
  function documentIdFor(providerId,accountId){
    return createHash("sha256").update(String(providerId||"YOUTUBE").toUpperCase()+":"+String(accountId||"")).digest("hex");
  }
  async function load({providerId="YOUTUBE",accountId}={}){
    if(!accountId)throw new Error("ACCOUNT_ID_REQUIRED");
    const snapshot=await collection.doc(documentIdFor(providerId,accountId)).get();
    if(!snapshot?.exists)return null;
    const record=snapshot.data()||{};
    if(record.providerId!==String(providerId).toUpperCase()||record.accountId!==String(accountId))return null;
    // Runtime consumers receive metadata only; ciphertext is deliberately excluded.
    const {encryptedTokenBundle,encryptionKey,...metadata}=record;
    return metadata;
  }
  async function loadTokens({providerId="YOUTUBE",accountId}={}){
    if(!accountId)throw new Error("ACCOUNT_ID_REQUIRED");
    const snapshot=await collection.doc(documentIdFor(providerId,accountId)).get();
    if(!snapshot?.exists)return null;
    const record=snapshot.data()||{};
    if(record.providerId!==String(providerId).toUpperCase()||record.accountId!==String(accountId)||!record.encryptedTokenBundle)return null;
    return decryptTokens(record.encryptedTokenBundle);
  }
  async function setCapability({providerId="YOUTUBE",accountId,capability,granted}={}){
    if(!accountId)throw new Error("ACCOUNT_ID_REQUIRED");
    if(typeof capability!=="string"||!/^[A-Z][A-Z0-9_]{1,79}$/.test(capability))throw new Error("CAPABILITY_INVALID");
    if(typeof granted!=="boolean")throw new Error("CAPABILITY_GRANT_STATE_REQUIRED");
    if(typeof firestore.runTransaction!=="function")throw new Error("CAPABILITY_TRANSACTION_REQUIRED");
    const provider=String(providerId).toUpperCase();
    const id=String(accountId);
    const ref=collection.doc(documentIdFor(provider,id));
    return firestore.runTransaction(async tx=>{
      const snapshot=await tx.get(ref);
      if(!snapshot?.exists)throw new Error("PERSISTED_CONNECTION_REQUIRED");
      const record=snapshot.data()||{};
      if(record.providerId!==provider||String(record.accountId)!==id)throw new Error("CONNECTION_IDENTITY_MISMATCH");
      if(record.status!=="PERSISTED")throw new Error("CONNECTION_NOT_PERSISTED");
      const capabilities=new Set(Array.isArray(record.capabilities)?record.capabilities.filter(value=>typeof value==="string"):[]);
      if(granted)capabilities.add(capability);else capabilities.delete(capability);
      const next=[...capabilities].sort();
      tx.update(ref,{capabilities:next,updatedAt:clock().toISOString()});
      return{providerId:provider,accountId:id,capabilities:next};
    });
  }

  async function save({providerId="YOUTUBE",account,tokens,scope}={}){
    if(!account?.id||!tokens?.refresh_token||!tokens?.access_token)throw new Error("REFRESH_TOKEN_REQUIRED");
    const provider=String(providerId).toUpperCase();
    const accountId=String(account.id);
    const documentId=documentIdFor(provider,accountId);
    const encryptedTokenBundle=await encryptTokens(tokens);
    const now=clock().toISOString();
    const record={
      providerId:provider,accountId,title:account.title||null,customUrl:account.customUrl||null,
      thumbnail:account.thumbnail||null,statistics:account.statistics||{},scope:scope||tokens.scope||null,
      status:"PERSISTED",capabilities:[],
      encryptedTokenBundle,encryptionKey:keyName,createdAt:now,updatedAt:now
    };
    await collection.doc(documentId).set(record,{merge:true});
    return {providerId:provider,accountId,title:record.title,status:record.status,updatedAt:now};
  }
  return Object.freeze({save,load,loadTokens,decryptTokens,setCapability});
}

export async function createCloudConnectionStore({projectId=process.env.GOOGLE_CLOUD_PROJECT,keyName=process.env.GOOGLE_KMS_KEY_NAME,collectionName=process.env.WORDDARK_CONNECTION_COLLECTION||"worddarkExternalConnections"}={}){
  if(!projectId||!keyName)throw new Error("SECURE_STORE_NOT_CONFIGURED");
  const [{Firestore},{KeyManagementServiceClient}]=await Promise.all([
    import("@google-cloud/firestore"),import("@google-cloud/kms")
  ]);
  const firestore=new Firestore({projectId});
  const kms=new KeyManagementServiceClient();
  return createConnectionStore({firestore,kms,keyName,collectionName});
}
