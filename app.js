import { AccountManager } from './worddark/core-central/account-manager.js';
import { YouTubeConnector } from './worddark/core-central/social-networks.js';
import { AccountOperationsManager } from './worddark/core-central/account-operations-manager.js';
import { AccountLoginManager, CONNECTION_SOURCES } from './worddark/core-central/account-login-manager.js';
import { NetworkSectorManager } from './worddark/core-central/network-sector-manager.js';

const loginManager=new AccountLoginManager();
const identity=loginManager.restore();
const manager=new AccountManager({accountId:'ACCOUNT-LOCAL',accountName:identity?.name||localStorage.getItem('wd.account.name')||'Conta local'});
const stored=JSON.parse(localStorage.getItem('wd.account.profiles')||'[]');
const defaultManager=manager.addManager({id:'GESTOR-01',name:'Gestor Principal',role:'PROFILE_MANAGER'});
const centralOperations=new AccountOperationsManager({accountManager:manager});
try{centralOperations.schedules=JSON.parse(localStorage.getItem('wd.central.schedules')||'[]');}catch{centralOperations.schedules=[];}
const networkSectors=new NetworkSectorManager({accountManager:manager});
for(const profile of stored){try{const p=manager.connectProfile(profile);if(!p.managerId)manager.assignManager(p.id,defaultManager.id);}catch{}}
const $=s=>document.querySelector(s);
const safe=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function persist(){localStorage.setItem('wd.account.name',manager.name);localStorage.setItem('wd.account.profiles',JSON.stringify(manager.listProfiles()));localStorage.setItem('wd.central.schedules',JSON.stringify(centralOperations.listSchedules()));}
function renderScheduleTargets(){
  const root=$('#schedule-targets');
  if(!root)return;
  const profiles=manager.listProfiles();
  root.innerHTML=profiles.length?profiles.map(p=>'<label class="wd-profile" style="display:block;cursor:pointer"><div class="wd-profile-top"><span class="network">'+safe(p.networkName)+'</span><span class="wd-chip active">'+safe(p.status)+'</span></div><h3><input type="checkbox" class="wd-schedule-target" value="'+safe(p.id)+'" checked> '+safe(p.displayName)+'</h3><p>'+safe(p.handle||p.id)+'</p></label>').join(''):'<div class="wd-empty">Conecte pelo menos um perfil antes de criar um calendário.</div>';
}
function renderSchedules(){
  const root=$('#schedule-list');
  if(!root)return;
  const schedules=centralOperations.listSchedules();
  root.innerHTML=schedules.length?schedules.map(s=>'<article class="wd-manager"><span>CALENDÁRIO CENTRAL</span><h3>'+safe(s.id)+'</h3><p>'+s.scheduledContents+' conteúdo(s) · '+s.postsPerDay+' por dia · '+safe(s.dates.join(', '))+'</p><strong>'+s.targets.length+' destino(s) · '+safe(s.status)+'</strong><small>'+s.slots.map(slot=>safe(slot.date)+' '+safe(slot.time||'horário aberto')+' · '+safe(slot.content.text||slot.content.title||('Conteúdo '+slot.contentIndex))).join('<br>')+'</small></article>').join(''):'<div class="wd-empty">Nenhum calendário criado.</div>';
}

function render(){
  const profiles=manager.listProfiles();
  const session=loginManager.restore();
  $('#login-state').textContent=session?'AUTENTICADO':'NÃO AUTENTICADO';
  $('#identity-name').textContent=session?session.name:'Entre para iniciar o gestor.';
  $('#identity-note').textContent=session?('Identidade: '+session.provider+(session.email?' · '+session.email:'')+'. Agora selecione as conexões que devem entrar no WordDark.'):'O login identifica quem está usando o WordDark. Depois dele, você escolhe quais contas deseja entregar ao gestor.';
  $('#google-login').textContent=session?'Trocar identidade Google':'Entrar com Google';
  $('#account-name').textContent=manager.name;
  $('#account-id').textContent=manager.id;
  $('#profile-count').textContent=profiles.length+' PERFIS';
  $('#profiles').innerHTML=profiles.length?profiles.map(p=>{
    const g=manager.listManagers().find(m=>m.id===p.managerId);
    const real=p.config?.youtube?.channelId;
    return '<article class="wd-profile"><div class="wd-profile-top"><span class="network">'+safe(p.networkName)+'</span><span class="wd-chip active">'+safe(p.status)+'</span></div><h3>'+safe(p.displayName)+'</h3><p>'+safe(p.handle||p.id)+'</p><div class="wd-profile-meta"><span>SETOR: <b>'+safe(p.displayName)+'</b></span><span>GESTOR: <b>'+safe(g?.name||'Sem gestor')+'</b></span></div><small>'+ (real?'CANAL REAL · '+safe(real):'CADASTRO LOCAL') +'</small><button class="wd-profile-action" data-auth="'+p.id+'">Conectar conta real</button></article>'
  }).join(''):'<div class="wd-empty">Nenhum perfil conectado ainda.<br><strong>O primeiro passo é conectar uma rede.</strong></div>';
  const sectorRoot=$('#network-sectors');
  if(sectorRoot) sectorRoot.innerHTML=networkSectors.listSectors().map(s=>'<article class="wd-manager"><span>SETOR DE REDE</span><h3>'+safe(s.manager)+'</h3><p>'+safe(s.name)+' · '+safe(s.status)+'</p><strong>'+s.profiles+' perfil(is)</strong><button class="wd-profile-action" data-network="'+safe(s.id)+'">Abrir setor</button></article>').join('');
  document.querySelectorAll('[data-network]').forEach(b=>b.onclick=()=>openNetworkSector(b.dataset.network));
  $('#managers').innerHTML='<article class="wd-manager central-manager"><span>GESTOR CENTRAL</span><h3>'+safe(centralOperations.name)+'</h3><p>ACCOUNT_OPERATIONS_MANAGER</p><strong>'+profiles.length+' perfil(is) sob coordenação</strong></article>'+manager.listManagers().map(m=>'<article class="wd-manager"><span>GESTOR DE PERFIL</span><h3>'+safe(m.name)+'</h3><p>'+safe(m.role)+'</p><strong>'+profiles.filter(p=>p.managerId===m.id).length+' perfil(is) gerenciado(s)</strong></article>').join('');
  document.querySelectorAll('[data-auth]').forEach(b=>b.onclick=()=>prepareRealConnection(b.dataset.auth));
  renderScheduleTargets();
  renderSchedules();
}
function openNetworkSector(network){
  const sector=networkSectors.prepareConnection(network);
  $('#network').value=network;
  $('#youtube-config').hidden=network!=='YOUTUBE';
  $('#connect-note').textContent=sector.message;
  location.hash='conectar';
}

async function loginGoogle(){
  if(!window.google?.accounts?.id){$('#identity-note').textContent='Serviço de login Google ainda não carregado.';return;}
  const clientId=localStorage.getItem('wd.google.clientId')||prompt('Informe o Google OAuth Client ID do projeto WordDark:');
  if(!clientId?.trim()){return;}
  localStorage.setItem('wd.google.clientId',clientId.trim());
  $('#identity-note').textContent='Aguardando identidade Google…';
  const credential=await new Promise((resolve,reject)=>{
    window.google.accounts.id.initialize({client_id:clientId.trim(),callback:resolve});
    window.google.accounts.id.prompt(notification=>{if(notification.isNotDisplayed?.())reject(new Error('GOOGLE_PROMPT_NOT_DISPLAYED'));});
  });
  const payload=JSON.parse(atob(credential.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));
  loginManager.loginGoogle(payload); render();
}
$('#google-login').onclick=()=>loginGoogle().catch(error=>{$('#identity-note').textContent='Falha no login Google: '+(error?.message||error);});
function renderConnectionOptions(){
  const session=loginManager.restore();
  const root=$('#connection-options');
  if(!session){root.innerHTML='<div class="wd-empty">Faça login primeiro para abrir a entrada de conexões.</div>';return;}
  const available=['YOUTUBE','INSTAGRAM','TIKTOK','FACEBOOK'];
  root.innerHTML=available.map(key=>{const s=CONNECTION_SOURCES[key];const connected=manager.listProfiles().some(p=>p.network===key);return '<label class="wd-profile" style="display:block;cursor:pointer"><div class="wd-profile-top"><span class="network">'+safe(s.name)+'</span><span class="wd-chip '+(connected?'active':'')+'">'+(connected?'CONECTADO':'DISPONÍVEL')+'</span></div><h3><input type="checkbox" class="wd-connection-check" value="'+key+'" '+(connected?'checked':'')+'> '+safe(s.name)+'</h3><p>'+safe(s.description)+'</p><small>'+ (key==='YOUTUBE'?'Autoriza pelo Google OAuth.':'Conector do provedor será usado quando habilitado.') +'</small></label>';}).join('');
}
$('#connect-selected').onclick=async()=>{
  const selected=[...document.querySelectorAll('.wd-connection-check:checked')].map(x=>x.value);
  if(!loginManager.restore()){location.hash='login';return;}
  $('#selection-count').textContent=selected.length+' SELECIONADAS';
  $('#batch-note').textContent='Entrada recebida: '+selected.join(', ')+'. Encaminhando aos gestores…';
  for(const network of selected){
    if(network==='YOUTUBE'){
      const clientId=localStorage.getItem('wd.youtube.clientId')||prompt('Informe o YouTube/Google OAuth Client ID:');
      if(!clientId)continue;
      localStorage.setItem('wd.youtube.clientId',clientId.trim());
      try{
        const result=await new YouTubeConnector({clientId}).authorize();
        const c=result.channel;
        if(!manager.listProfiles().some(p=>p.network==='YOUTUBE'&&p.config?.youtube?.channelId===c.channelId)){
          const p=manager.connectProfile({network:'YOUTUBE',displayName:c.displayName,handle:c.customUrl||c.channelId,status:'ACTIVE',config:{youtube:c}});manager.assignManager(p.id,defaultManager.id);
        }
      }catch(error){$('#batch-note').textContent='YouTube aguardando autorização: '+(error?.message||error);}
    }else{
      $('#batch-note').textContent+=' '+network+' ainda requer o conector OAuth específico.';
    }
  }
  persist();render();renderConnectionOptions();
  $('#batch-note').textContent='Entrada concluída. As conexões autorizadas foram entregues aos gestores de perfil.';
};
function updateSelectionCount(){const n=document.querySelectorAll('.wd-connection-check:checked').length;$('#selection-count').textContent=n+' SELECIONADAS';}
document.addEventListener('change',e=>{if(e.target.classList?.contains('wd-connection-check'))updateSelectionCount();});
function renderConnectionOptionsAndSelection(){renderConnectionOptions();updateSelectionCount();}

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
$('#schedule-form').onsubmit=e=>{
  e.preventDefault();
  const contents=$('#schedule-contents').value.split(/\\n+/).map(text=>text.trim()).filter(Boolean).map(text=>({text,format:'CONTENT'}));
  const dates=$('#schedule-dates').value.split(',').map(x=>x.trim()).filter(Boolean);
  const times=$('#schedule-times').value.split(',').map(x=>x.trim()).filter(Boolean);
  const postsPerDay=Number($('#schedule-per-day').value);
  const profileIds=[...document.querySelectorAll('.wd-schedule-target:checked')].map(x=>x.value);
  try{
    const schedule=centralOperations.createContentSchedule({contents,profileIds,postsPerDay,dates,times});
    manager.registerCentralOperation(schedule);
    $('#schedule-note').textContent='Calendário '+schedule.id+' criado: '+schedule.scheduledContents+' conteúdo(s) distribuído(s) em '+schedule.dates.length+' dia(s). '+(schedule.unscheduledContents?'Ficaram '+schedule.unscheduledContents+' conteúdo(s) sem slot.':'Todos os conteúdos receberam slot.');
    renderSchedules();
  }catch(error){$('#schedule-note').textContent='Não foi possível criar o calendário: '+(error?.message||error);}
};
$('#broadcast-form').onsubmit=e=>{
  e.preventDefault();
  const operation=centralOperations.createBroadcastOperation({
    type:'CONTENT',
    content:{text:$('#broadcast-text').value.trim(),mediaUrl:$('#broadcast-media').value.trim(),format:$('#broadcast-format').value},
    requirements:[]
  });
  manager.registerCentralOperation(operation);
  const dispatched=centralOperations.dispatch(operation);
  $('#broadcast-note').textContent='Operação criada e distribuída para '+dispatched.targets.length+' perfil(is). Cada gestor de perfil recebeu sua parte.';
  e.target.reset();
};

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
syncTheme();render();renderConnectionOptionsAndSelection();renderScheduleTargets();renderSchedules();