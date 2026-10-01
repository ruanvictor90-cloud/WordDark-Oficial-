import { AccountManager } from './worddark/core-central/account-manager.js';
import { YouTubeConnector } from './worddark/core-central/social-networks.js';

const manager=new AccountManager({accountId:'ACCOUNT-LOCAL',accountName:localStorage.getItem('wd.account.name')||'Minha Conta'});
const stored=JSON.parse(localStorage.getItem('wd.account.profiles')||'[]');
const defaultManager=manager.addManager({id:'GESTOR-01',name:'Gestor Principal',role:'ACCOUNT_MANAGER'});
for(const profile of stored){try{const p=manager.connectProfile(profile);if(!p.managerId)manager.assignManager(p.id,defaultManager.id);}catch{}}
const $=s=>document.querySelector(s);
const safe=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function persist(){localStorage.setItem('wd.account.name',manager.name);localStorage.setItem('wd.account.profiles',JSON.stringify(manager.listProfiles()));}
function render(){
  const profiles=manager.listProfiles();
  $('#account-name').textContent=manager.name;
  $('#account-id').textContent=manager.id;
  $('#profile-count').textContent=profiles.length+' PERFIS';
  $('#profiles').innerHTML=profiles.length?profiles.map(p=>{
    const g=manager.listManagers().find(m=>m.id===p.managerId);
    const real=p.config?.youtube?.channelId;
    return '<article class="wd-profile"><div class="wd-profile-top"><span class="network">'+safe(p.networkName)+'</span><span class="wd-chip active">'+safe(p.status)+'</span></div><h3>'+safe(p.displayName)+'</h3><p>'+safe(p.handle||p.id)+'</p><div class="wd-profile-meta"><span>SETOR: <b>'+safe(p.displayName)+'</b></span><span>GESTOR: <b>'+safe(g?.name||'Sem gestor')+'</b></span></div><small>'+ (real?'CANAL REAL · '+safe(real):'CADASTRO LOCAL') +'</small><button class="wd-profile-action" data-auth="'+p.id+'">Conectar conta real</button></article>'
  }).join(''):'<div class="wd-empty">Nenhum perfil conectado ainda.<br><strong>O primeiro passo é conectar uma rede.</strong></div>';
  $('#managers').innerHTML=manager.listManagers().map(m=>'<article class="wd-manager"><span>GESTOR</span><h3>'+safe(m.name)+'</h3><p>'+safe(m.role)+'</p><strong>'+profiles.filter(p=>p.managerId===m.id).length+' perfil(is) gerenciado(s)</strong></article>').join('');
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>prepareRealConnection(b.dataset.auth));
}
$('#rename-account').onclick=()=>{const name=prompt('Nome da conta:',manager.name);if(name?.trim()){manager.rename(name);persist();render();}};
$('#connect-form').onsubmit=e=>{
  e.preventDefault();
  if($('#network').value==='YOUTUBE'){connectYouTubeReal();return;}
  const p=manager.connectProfile({network:$('#network').value,displayName:$('#displayName').value,handle:$('#handle').value});
  manager.assignManager(p.id,defaultManager.id);
  persist();e.target.reset();render();location.hash='perfis';
};
$('#network').onchange=()=>{
  const youtube=$('#network').value==='YOUTUBE';
  $('#youtube-config').hidden=!youtube;
  $('#displayName').placeholder=youtube?'Será preenchido pelo canal real':'Ex.: Meu perfil';
  $('#handle').placeholder=youtube?'Será preenchido pelo canal real':'@seuperfil';
};
$('#open-connect').onclick=()=>location.hash='conectar';

async function connectYouTubeReal(){
  const clientId=$('#youtube-client-id').value.trim();
  if(!clientId){$('#connect-note').textContent='Informe o OAuth Client ID do Google Cloud primeiro.';return;}
  localStorage.setItem('wd.youtube.clientId',clientId);
  $('#connect-note').textContent='Abrindo autorização do Google…';
  try{
    const result=await new YouTubeConnector({clientId}).authorize();
    const c=result.channel;
    const existing=manager.listProfiles().find(p=>p.network==='YOUTUBE'&&p.config?.youtube?.channelId===c.channelId);
    if(!existing){
      const p=manager.connectProfile({network:'YOUTUBE',displayName:c.displayName,handle:c.customUrl||c.channelId,status:'ACTIVE',config:{youtube:c}});
      manager.assignManager(p.id,defaultManager.id);
    }
    persist();render();
    $('#connect-note').textContent='YouTube conectado: '+c.displayName+' · canal '+c.channelId;
    location.hash='perfis';
  }catch(error){
    console.error(error);
    $('#connect-note').textContent='Falha na conexão: '+(error?.message||error);
  }
}
function prepareRealConnection(profileId){
  const p=manager.listProfiles().find(x=>x.id===profileId);
  if(!p)return;
  if(p.network==='YOUTUBE'){
    $('#network').value='YOUTUBE';
    $('#youtube-config').hidden=false;
    $('#youtube-client-id').value=localStorage.getItem('wd.youtube.clientId')||'';
    $('#connect-note').textContent='Use o OAuth Client ID e autorize o canal real.';
    location.hash='conectar';
  }
}
$('#youtube-client-id').value=localStorage.getItem('wd.youtube.clientId')||'';
$('#youtube-config').hidden=$('#network').value!=='YOUTUBE';
const themeButton=$('[data-wd-theme]');
function syncTheme(){themeButton.textContent=document.documentElement.dataset.theme==='light'?'☾ Tema escuro':'☼ Tema claro'}
themeButton.onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='light'?'':'light';syncTheme()};
syncTheme();render();