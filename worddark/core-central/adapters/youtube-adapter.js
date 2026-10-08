export class YouTubeAdapter {
  constructor({fetchImpl=fetch}={}){this.fetch=fetchImpl;}
  async execute(request,{credential}={}){
    if(!credential)return{success:false,status:"RUNTIME_CREDENTIAL_REQUIRED"};
    const headers={Authorization:"Bearer "+credential};
    if(request.action==="CHANNEL_READ"){
      const response=await this.fetch("https://www.googleapis.com/youtube/v3/channels?part=id,snippet,statistics&mine=true",{headers});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error?.message||"YOUTUBE_CHANNEL_READ_FAILED");
      const item=data.items?.[0];
      if(!item)return{success:false,status:"YOUTUBE_CHANNEL_NOT_FOUND"};
      return{success:true,status:"CHANNEL_RECEIVED",channel:{id:item.id,title:item.snippet?.title||null,description:item.snippet?.description||null,customUrl:item.snippet?.customUrl||null,thumbnail:item.snippet?.thumbnails?.default?.url||null,statistics:item.statistics||{}}};
    }
    return{success:false,status:"ACTION_NOT_IMPLEMENTED"};
  }
}
