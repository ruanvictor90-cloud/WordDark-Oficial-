import http from "node:http";
import {URL} from "node:url";

const PORT=Number(process.env.PORT||8080);
const CLIENT_ID=process.env.GOOGLE_CLIENT_ID||"";
const CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET||"";
const REDIRECT_URI=process.env.GOOGLE_REDIRECT_URI||"";
const ALLOWED_ORIGIN=process.env.WORDDARK_ALLOWED_ORIGIN||"";

const json=(res,status,body)=>{res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":ALLOWED_ORIGIN||"null","Access-Control-Allow-Headers":"Content-Type, X-Requested-With","Cache-Control":"no-store"});res.end(JSON.stringify(body));};

async function body(req){
  let raw=""; for await(const chunk of req) raw+=chunk;
  return new URLSearchParams(raw);
}

async function exchange(code){
  const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({
    code,client_id:CLIENT_ID,client_secret:CLIENT_SECRET,redirect_uri:REDIRECT_URI,grant_type:"authorization_code"
  })});
  const data=await r.json();
  if(!r.ok) throw new Error(data.error||"GOOGLE_TOKEN_EXCHANGE_FAILED");
  return data;
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url||"/","http://localhost");
  if(req.method==="OPTIONS"){res.writeHead(204,{"Access-Control-Allow-Origin":ALLOWED_ORIGIN||"null","Access-Control-Allow-Headers":"Content-Type, X-Requested-With","Access-Control-Allow-Methods":"POST, GET, OPTIONS"});return res.end();}
  if(req.method==="GET"&&url.pathname==="/health") return json(res,200,{status:"READY",provider:"GOOGLE",service:"YOUTUBE",configured:Boolean(CLIENT_ID&&CLIENT_SECRET&&REDIRECT_URI&&ALLOWED_ORIGIN)});
  if(req.method==="POST"&&url.pathname==="/oauth/google/code"){
    if(!CLIENT_ID||!CLIENT_SECRET||!REDIRECT_URI||!ALLOWED_ORIGIN)return json(res,503,{status:"ENDPOINT_NOT_CONFIGURED",message:"OAuth endpoint ainda não está configurado."});
    const origin=req.headers.origin||"";
    if(origin!==ALLOWED_ORIGIN)return json(res,403,{status:"ORIGIN_REJECTED"});
    try{
      const form=await body(req); const code=form.get("code");
      if(!code)return json(res,400,{status:"CODE_REQUIRED"});
      const tokens=await exchange(code);
      // Tokens are deliberately not returned to the browser.
      return json(res,200,{status:"AUTHORIZATION_RECEIVED",provider:"GOOGLE",service:"YOUTUBE",tokenType:tokens.token_type||"Bearer",scope:tokens.scope||null,expiresIn:tokens.expires_in||null,message:"Autorização recebida. Persistência segura da conexão será executada na próxima camada."});
    }catch(e){return json(res,400,{status:"AUTHORIZATION_FAILED",message:e.message});}
  }
  return json(res,404,{status:"NOT_FOUND"});
});
server.listen(PORT,"0.0.0.0",()=>console.log("WordDark Google OAuth bridge listening on "+PORT));
