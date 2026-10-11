export const CONNECTION_PROVIDERS=Object.freeze([
  {id:"GOOGLE",name:"Google",services:["YOUTUBE","DRIVE","GMAIL"],auth:"OAUTH2",phase:"READY"},
  {id:"META",name:"Meta",services:["INSTAGRAM","FACEBOOK"],auth:"OAUTH2",phase:"READY"},
  {id:"TIKTOK",name:"TikTok",services:["TIKTOK"],auth:"OAUTH2",phase:"READY"},
  {id:"GITHUB",name:"GitHub",services:["GITHUB"],auth:"OAUTH2",phase:"READY"},
  {id:"OPENAI",name:"OpenAI",services:["OPENAI"],auth:"API_KEY",phase:"READY"},
  {id:"EMAIL",name:"Email",services:["GMAIL","OUTLOOK"],auth:"OAUTH2",phase:"READY"},
  {id:"STORAGE",name:"Storage",services:["GOOGLE_DRIVE"],auth:"OAUTH2",phase:"READY"},
  {id:"ANALYTICS",name:"Analytics",services:["GOOGLE_ANALYTICS","META_INSIGHTS","TIKTOK_ANALYTICS"],auth:"OAUTH2",phase:"READY"}
]);
