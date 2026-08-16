'use strict';

let paCrewData={unread:0,threads:[]},paCrewReady=false,paCrewDraft={subject:'',body:''};
let paMasterData={unread:0,threads:[]},paMasterReady=false,paOpenThreadData=null;
const paBaseRender=render;

function paDate(v){try{return new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'medium'})}catch{return String(v||'—')}}
function paShort(v,n=180){v=String(v||'');return v.length>n?v.slice(0,n)+'…':v}
function paStatusLabel(s){return s==='answered'?'RESPONDIDO':s==='closed'?'ENCERRADO':'AGUARDANDO PANI'}
function paStatusClass(s){return ['answered','closed'].includes(s)?s:'open'}

render=function(force=false){
  if(view!=='pani')return paBaseRender(force);
  if(!me)return;
  alertRender();
  $('#view').innerHTML=paniAssistancePage();
  navRender();
  paUpdateCrewNav();
  setTimeout(()=>paCrewRefresh(false),0);
};

function paniAssistancePage(){
  let rows=paCrewData.threads||[];
  return `<div class="card pa-page">
    <div class="k">PANI // ASSISTÊNCIA OPERACIONAL PRIVADA</div>
    <h2>CANAL DE SUPORTE</h2>
    <p class="mut">Envie dúvidas, solicitações ou informações diretamente à PANI. Este canal é privado entre sua credencial e o Diretor da Sessão.</p>
    <div class="pa-privacy"><div class="pa-lock">▣</div><div><b>CANAL PARTICULAR // ${esc(me?.display_name||'TRIPULANTE')}</b><span>Outros tripulantes não podem visualizar o conteúdo desta comunicação.</span></div></div>
    <label>ASSUNTO <span class="mut">(opcional)</span><input id="pasubject" maxlength="120" value="${esc(paCrewDraft.subject)}" placeholder="Ex.: Dúvida sobre protocolo médico" oninput="paCrewDraft.subject=this.value"></label>
    <label>MENSAGEM<textarea id="pabody" maxlength="12000" placeholder="Digite sua dúvida, solicitação ou mensagem para a PANI..." oninput="paCrewDraft.body=this.value">${esc(paCrewDraft.body)}</textarea></label>
    <div class="actions"><span class="mut small">A resposta aparecerá somente neste terminal autenticado.</span><button id="pasend" class="btn a" onclick="paCrewSend()">ENVIAR À PANI</button></div>
    <hr class="sep">
    <div class="mrhead"><div><div class="k">HISTÓRICO PRIVADO</div><h3>MINHAS SOLICITAÇÕES</h3></div><button class="btn" onclick="paCrewRefresh(true)">SINCRONIZAR</button></div>
    <div class="pa-list">${rows.length?rows.map(paCrewThreadCard).join(''):'<div class="pa-zero">Nenhuma comunicação privada registrada por esta credencial.</div>'}</div>
  </div>`;
}

function paCrewThreadCard(t){return `<article class="pa-thread ${t.unread?'unread':''}" onclick="paCrewOpen(${t.id})"><div><h4>${esc(t.subject||'SOLICITAÇÃO PANI')}</h4><p>${esc(paShort(t.last_message,230))}</p><small>${paDate(t.updated_at)} // ${t.last_sender==='master'?'ÚLTIMA RESPOSTA: PANI':'ENVIADO POR VOCÊ'}${t.unread?' // NOVA RESPOSTA':''}</small></div><span class="pa-status ${paStatusClass(t.status)}">${paStatusLabel(t.status)}</span></article>`}

async function paCrewRefresh(rerender=false){
  if(MASTER||!tok||!me)return;
  try{
    let prev=paCrewData.unread||0,d=await rpc('pani_crew_assistance',{p_token:tok});paCrewData=d||{unread:0,threads:[]};
    paUpdateCrewNav();
    if(paCrewReady&&paCrewData.unread>prev)toast('PANI // NOVA RESPOSTA PRIVADA RECEBIDA');
    paCrewReady=true;
    if(rerender&&view==='pani')render(true);
  }catch(e){console.error('pani assistance refresh',e)}
}
function paUpdateCrewNav(){if(MASTER)return;let b=document.querySelector('#nav [data-v="pani"]');if(!b)return;let n=Number(paCrewData.unread||0);b.textContent=n?`PANI • ${n}`:'PANI';b.classList.toggle('pa-nav-unread',n>0)}
async function paCrewSend(){
  let subject=$('#pasubject')?.value||'',body=$('#pabody')?.value||'';if(!body.trim())return toast('Digite uma mensagem para a PANI.',true);
  let b=$('#pasend');if(b){b.disabled=true;b.textContent='TRANSMITINDO...'}
  try{await rpc('pani_assistance_submit',{p_token:tok,p_subject:subject,p_body:body});paCrewDraft={subject:'',body:''};await paCrewRefresh(false);toast('PANI // SOLICITAÇÃO PRIVADA ENVIADA');render(true)}catch(e){toast('Falha ao enviar solicitação privada.',true)}finally{if(b){b.disabled=false;b.textContent='ENVIAR À PANI'}}
}

function paInjectModals(){
  if(!$('#pamodal'))document.body.insertAdjacentHTML('beforeend',`<div id="pamodal" class="modalback hidden"><div class="card modal pa-chat"><div class="k">PANI // CANAL PARTICULAR</div><h2 id="patitle"></h2><p id="pameta" class="mut"></p><div id="pachatlog" class="pa-chatlog"></div><div class="pa-reply"><textarea id="pareply" maxlength="12000" placeholder="Responder à PANI..."></textarea><div class="actions"><button class="btn" onclick="paCrewModalClose()">FECHAR</button><button id="pareplysend" class="btn a" onclick="paCrewReply()">ENVIAR RESPOSTA</button></div></div></div></div>`);
  if(!$('#pamastermodal'))document.body.insertAdjacentHTML('beforeend',`<div id="pamastermodal" class="modalback hidden"><div class="card modal pa-chat"><div class="k">MASTER // ASSISTÊNCIA PANI</div><h2 id="pamtname"></h2><p id="pamtmeta" class="mut"></p><div id="pamtchat" class="pa-chatlog"></div><div class="pa-reply"><textarea id="pamtreply" maxlength="12000" placeholder="Responder como PANI..."></textarea><div class="actions"><button id="pamtclosecase" class="btn" onclick="paMasterToggleClosed()">ENCERRAR SOLICITAÇÃO</button><button class="btn" onclick="paMasterModalClose()">FECHAR</button><button id="pamtsend" class="btn a" onclick="paMasterReply()">RESPONDER COMO PANI</button></div></div></div></div>`);
}
function paMessageHtml(m,masterView=false){let crew=m.sender==='crew';return `<div class="pa-msg ${crew?'crew':'master'}"><div class="pa-who">${crew?(masterView?'TRIPULANTE':'VOCÊ'):'PANI'}</div><div class="pa-body">${esc(m.body)}</div><time>${paDate(m.created_at)}</time></div>`}
async function paCrewOpen(id){try{let d=await rpc('pani_assistance_open',{p_token:tok,p_thread:id});paOpenThreadData=d;$('#patitle').textContent=d.subject||'SOLICITAÇÃO PANI';$('#pameta').textContent=`${paStatusLabel(d.status)} // ${paDate(d.updated_at)}`;$('#pachatlog').innerHTML=(d.messages||[]).map(m=>paMessageHtml(m,false)).join('');$('#pareply').value='';$('#pamodal').classList.remove('hidden');$('#pachatlog').scrollTop=$('#pachatlog').scrollHeight;await paCrewRefresh(false);paUpdateCrewNav();if(view==='pani')render(true)}catch(e){toast('Falha ao abrir comunicação privada.',true)}}
function paCrewModalClose(){$('#pamodal').classList.add('hidden')}
async function paCrewReply(){let d=paOpenThreadData,body=$('#pareply')?.value||'';if(!d||!body.trim())return toast('Digite uma resposta.',true);let b=$('#pareplysend');b.disabled=true;try{await rpc('pani_assistance_reply',{p_token:tok,p_thread:d.id,p_body:body});await paCrewOpen(d.id);toast('Resposta enviada à PANI.')}catch{toast('Falha ao enviar resposta.',true)}finally{b.disabled=false}}

/* ================= MASTER ================= */
function paMasterInject(){
  paInjectModals();
  if(!MASTER||!$('#mapp')||$('#pamaster'))return;
  $('#mapp').insertAdjacentHTML('beforeend',`<section id="pamaster" class="card pa-master"><div class="pa-master-head"><div><div class="k">MASTER // PANI ASSISTÊNCIA PRIVADA</div><h2>CAIXA DE SOLICITAÇÕES</h2><p class="mut">Comunicações particulares enviadas pelos terminais da tripulação. Respostas retornam somente ao remetente.</p></div><div class="pa-master-tools"><span id="paunread" class="pa-unreadbadge">SINCRONIZANDO</span><select id="pafiltercrew" onchange="paMasterRender()"><option value="all">TODOS OS TRIPULANTES</option></select><select id="pafilterstatus" onchange="paMasterRender()"><option value="all">TODOS</option><option value="unread">NÃO LIDAS</option><option value="open">AGUARDANDO PANI</option><option value="answered">RESPONDIDAS</option><option value="closed">ENCERRADAS</option></select><button class="btn" onclick="paMasterRefresh(true)">SINCRONIZAR</button></div></div><div id="pamasterlist" class="pa-list"><div class="pa-zero">Aguardando solicitações.</div></div></section>`);
  paMasterRefresh(true);
}
async function paMasterRefresh(renderNow=true){if(!MASTER||!pin)return;try{let d=await rpc('pani_master_assistance',{p_pin:pin});paMasterData=d||{unread:0,threads:[]};paMasterReady=true;paMasterCrewFilter();if(renderNow)paMasterRender();else{let badge=$('#paunread');if(badge)badge.textContent=paMasterData.unread?`${paMasterData.unread} NÃO LIDA${paMasterData.unread===1?'':'S'}`:'SEM PENDÊNCIAS'}}catch(e){console.error('master assistance',e)}}
function paMasterCrewFilter(){let s=$('#pafiltercrew');if(!s)return;let old=s.value,names=[...new Map((paMasterData.threads||[]).map(t=>[t.crew_id,t.crew_name])).entries()];s.innerHTML='<option value="all">TODOS OS TRIPULANTES</option>'+names.map(([id,n])=>`<option value="${esc(id)}">${esc(n)}</option>`).join('');if(names.some(([id])=>id===old))s.value=old}
function paMasterRender(){let box=$('#pamasterlist');if(!box)return;let crew=$('#pafiltercrew')?.value||'all',st=$('#pafilterstatus')?.value||'all',arr=(paMasterData.threads||[]).filter(t=>(crew==='all'||t.crew_id===crew)&&(st==='all'||(st==='unread'?t.unread:t.status===st)));let badge=$('#paunread');if(badge)badge.textContent=paMasterData.unread?`${paMasterData.unread} NÃO LIDA${paMasterData.unread===1?'':'S'}`:'SEM PENDÊNCIAS';box.innerHTML=arr.length?arr.map(t=>`<article class="pa-masteritem ${t.unread?'unread':''}" onclick="paMasterOpen(${t.id})"><div class="pa-avatar">${esc((t.crew_name||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join(''))}</div><div><b>${esc(t.crew_name)}</b><small>${esc(t.mission_role||'TRIPULANTE')}</small><p><strong>${esc(t.subject)}</strong> — ${esc(paShort(t.last_message,230))}</p><small>${paDate(t.updated_at)} // ${t.last_sender==='master'?'ÚLTIMA MENSAGEM: PANI':'ÚLTIMA MENSAGEM: TRIPULANTE'}</small></div><span class="pa-status ${paStatusClass(t.status)}">${t.unread?'NOVA':paStatusLabel(t.status)}</span></article>`).join(''):'<div class="pa-zero">Nenhuma solicitação corresponde ao filtro.</div>'}
async function paMasterOpen(id){try{let d=await rpc('pani_master_assistance_open',{p_pin:pin,p_thread:id});paOpenThreadData=d;$('#pamtname').textContent=d.crew_name;$('#pamtmeta').textContent=`${d.subject} // ${paDate(d.updated_at)} // ${d.mission_role||'TRIPULANTE'}`;$('#pamtchat').innerHTML=(d.messages||[]).map(m=>paMessageHtml(m,true)).join('');$('#pamtreply').value='';$('#pamtclosecase').textContent=d.status==='closed'?'REABRIR SOLICITAÇÃO':'ENCERRAR SOLICITAÇÃO';$('#pamastermodal').classList.remove('hidden');$('#pamtchat').scrollTop=$('#pamtchat').scrollHeight;await paMasterRefresh(true)}catch{toast('Falha ao abrir solicitação.',true)}}
function paMasterModalClose(){$('#pamastermodal').classList.add('hidden')}
async function paMasterReply(){let d=paOpenThreadData,body=$('#pamtreply')?.value||'';if(!d||!body.trim())return toast('Digite uma resposta.',true);let b=$('#pamtsend');b.disabled=true;try{await rpc('pani_master_assistance_reply',{p_pin:pin,p_thread:d.id,p_body:body});await paMasterOpen(d.id);toast(`Resposta privada enviada para ${d.crew_name}.`)}catch{toast('Falha ao responder solicitação.',true)}finally{b.disabled=false}}
async function paMasterToggleClosed(){let d=paOpenThreadData;if(!d)return;let closing=d.status!=='closed';try{await rpc('pani_master_assistance_close',{p_pin:pin,p_thread:d.id,p_closed:closing});await paMasterOpen(d.id);toast(closing?'Solicitação encerrada.':'Solicitação reaberta.')}catch{toast('Falha ao atualizar solicitação.',true)}}

paInjectModals();
setInterval(()=>{
  paInjectModals();
  if(MASTER){if(pin){paMasterInject();paMasterRefresh(false)}}
  else if(me&&tok){paCrewRefresh(false)}
},5000);
setInterval(()=>{if(!MASTER&&me)paUpdateCrewNav()},900);
