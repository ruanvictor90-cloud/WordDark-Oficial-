/* WordDark — YouTube Publisher v0.1
 * Public-browser publisher for the pilot. Access token must come from the
 * authenticated YouTube connector; no client secret is ever stored here.
 */
(function(global){
  async function publish({accessToken,title,description="",blob,privacyStatus="private",channelId=null,tags=[]}={}){
    if(!accessToken)throw new Error("YOUTUBE_ACCESS_TOKEN_REQUIRED");
    if(!(blob instanceof Blob))throw new Error("YOUTUBE_MEDIA_BLOB_REQUIRED");
    const metadata={snippet:{title,description,tags},status:{privacyStatus}};
    const body=new FormData();
    body.append("metadata",new Blob([JSON.stringify(metadata)],{type:"application/json"}));
    body.append("video",blob,blob.name||"worddark-pilot.webm");
    const response=await fetch("https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=multipart",{
      method:"POST",
      headers:{Authorization:"Bearer "+accessToken},
      body
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data?.error?.message||"YOUTUBE_UPLOAD_FAILED");
    return {success:true,status:"PUBLISHED",provider:"YOUTUBE",videoId:data.id,channelId,privacyStatus,url:data.id?"https://www.youtube.com/watch?v="+data.id:null,response:data};
  }
  global.WordDarkYouTubePublisher={publish};
})(typeof globalThis!=="undefined"?globalThis:window);
