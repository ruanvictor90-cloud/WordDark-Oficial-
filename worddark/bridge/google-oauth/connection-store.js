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
  async function save({providerId="YOUTUBE",account,tokens,scope}={}){
    if(!account?.id||!tokens?.refresh_token||!tokens?.access_token)throw new Error("REFRESH_TOKEN_REQUIRED");
    const provider=String(providerId).toUpperCase();
    const accountId=String(account.id);
    const documentId=createHash("sha256").update(provider+":"+accountId).digest("hex");
    const encryptedTokenBundle=await encryptTokens(tokens);
    const now=clock().toISOString();
    const record={
      providerId:provider,accountId,title:account.title||null,customUrl:account.customUrl||null,
      thumbnail:account.thumbnail||null,statistics:account.statistics||{},scope:scope||tokens.scope||null,
      status:"CONNECTED",capabilities:["CHANNEL_READ","CONTENT_ROUTE"],
      encryptedTokenBundle,encryptionKey:keyName,createdAt:now,updatedAt:now
    };
    await collection.doc(documentId).set(record,{merge:true});
    return {providerId:provider,accountId,title:record.title,status:record.status,updatedAt:now};
  }
  return Object.freeze({save,decryptTokens});
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
