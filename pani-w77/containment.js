'use strict';

const CT_EVENT_META={
  knowledge:{title:'CONEXO // MATRIZ DE ASSOCIAÇÃO',short:'CONHECIMENTO',module:'ÍNDICE & ACESSO',gravity:'ALTA',icon:'◇'},
  energy:{title:'TRILHA DE SOBRECARGA',short:'ENERGIA',module:'REDE ELÉTRICA',gravity:'ALTA',icon:'ϟ'},
  blood:{title:'HEMOPULSO',short:'SANGUE',module:'BIOMETRIA',gravity:'CRÍTICA',icon:'♥'},
  death:{title:'CÂMERA 13',short:'MORTE',module:'TEMPO & HISTÓRICO',gravity:'CRÍTICA',icon:'◉'}
};
const CT_STATUS_LABEL={detected:'DETECTADA',available:'DISPONÍVEL',in_progress:'EM CURSO',contained:'CONTIDA'};
const CT_OBJECTS={clock:'RELÓGIO',lamp:'LUMINÁRIA',door:'PORTA',sample:'AMOSTRA',chair:'CADEIRA',mirror:'ESPELHO'};
const CT_CARDS=['ZUMBI DE SANGUE','ESQUELETO DE LODO','ANÁRQUICO','EXISTIDO','ENRAIZADO','MARIONETE','VIAJANTE','CARNIÇAL PRETO DA MORTE','ENPAP-X','DEGOLIFICADA','MAGISTRADA','DEUS DA MORTE','DIABO','ANFITRIÃO'];

let containmentState={released:false,state:{},sync_error:null},containmentMasterState={},containmentBusy=false;
let containmentClockOffset=0,containmentSeen=false,containmentGlitchRevision=0,containmentAnnouncementRevision=0;
let containmentDeathHoldTimer=null;
let containmentReduced=localStorage.getItem('pani-containment-reduced')==='1'||
  (localStorage.getItem('pani-containment-reduced')===null&&matchMedia('(prefers-reduced-motion: reduce)').matches);
let containmentSound=localStorage.getItem('pani-containment-sound')!=='0';

function ctState(){return containmentState?.state||{}}
function ctEvent(){return ctState().event||{}}
function containmentReleased(){return containmentState?.released===true||ctState().released===true}
function containmentJoined(){return containmentState?.joined===true}
function containmentActive(){return containmentJoined()&&!!ctState().active_event}
function ctRole(){return containmentState?.player?.role||'spectator'}
function ctIsRepresentative(){return ctRole()==='representative'}
function ctIsWitness(){return ctRole()==='witness'}
function ctEscAttr(v){return esc(v).replace(/'/g,'&#39;')}
function ctSafeInt(v,d=0){let n=Number(v);return Number.isFinite(n)?Math.trunc(n):d}
function ctEventName(id){return CT_EVENT_META[id]?.short||String(id||'—').toUpperCase()}

function containmentAdopt(data,master=false){
  if(!data)return;
  let incomingState=data.state||{},glitch=ctSafeInt(incomingState?.glitch?.revision),announcement=ctSafeInt(incomingState?.announcement_revision);
  if(data.server_time)containmentClockOffset=Date.parse(data.server_time)-Date.now();
  if(!master){
    if(containmentSeen&&glitch>containmentGlitchRevision)containmentRunGlitch(incomingState.glitch);
    if(containmentSeen&&announcement>containmentAnnouncementRevision&&incomingState.announcement)toast(incomingState.announcement);
    containmentState=data;
  }else containmentMasterState=data;
  containmentGlitchRevision=Math.max(containmentGlitchRevision,glitch);
  containmentAnnouncementRevision=Math.max(containmentAnnouncementRevision,announcement);
  containmentSeen=true;
}

async function containmentCrewRefresh(rerender=false){
  if(MASTER||!tok||!me)return containmentState;
  try{
    let data=await rpc('pani_containment_crew_state',{p_token:tok});
    data.sync_error=null;
    let wasActive=containmentActive();containmentAdopt(data,false);
    if(containmentActive()&&!wasActive)view='containment';
    if(rerender&&view==='containment')render(true);
    return containmentState;
  }catch(error){console.error('containment crew state',error);containmentState={...containmentState,sync_error:String(error?.message||'Falha de sincronização')};if(rerender&&view==='containment')render(true);return null}
}

async function containmentOpen(){
  view='containment';navRender();render(true);
  let refreshed=await containmentCrewRefresh(false);
  if(!refreshed)toast('Não foi possível sincronizar a arena. Use TENTAR NOVAMENTE.',true);
  render(true)
}

async function containmentJoin(){
  let code=String($('#ctcode')?.value||'').trim().toUpperCase();
  if(!code)return toast('Informe o código curto da sessão.',true);
  let b=$('#ctjoin');if(b){b.disabled=true;b.textContent='SINCRONIZANDO...'}
  try{let data=await rpc('pani_containment_join',{p_token:tok,p_code:code});containmentAdopt(data,false);toast('SESSÃO SINCRONIZADA // PERSONAGEM VINCULADO');render(true)}
  catch(error){let m=String(error?.message||'');toast(m.includes('invalid_session_code')?'Código de sessão inválido.':m.includes('session_closed')?'A sessão ainda não foi aberta pelo Diretor.':'Falha ao entrar na sessão.',true)}
  finally{if(b){b.disabled=false;b.textContent='ENTRAR NA SESSÃO'}}
}

async function containmentAction(action,payload={},rerender=true){
  if(containmentBusy)return null;containmentBusy=true;
  try{let data=await rpc('pani_containment_crew_action',{p_token:tok,p_action:action,p_payload:payload});containmentAdopt(data,false);if(rerender||!ctState().active_event)render(true);return data}
  catch(error){
    let m=String(error?.message||''),friendly=m.includes('representative_required')?'A decisão final pertence ao representante.':
      m.includes('witness_required')?'Somente a testemunha atual pode confirmar o quadro.':
      m.includes('alternate_operator_required')?'A malha exige outro operador para a próxima jogada.':
      m.includes('event_in_progress')?'Encerre a arena atual antes de iniciar outra.':
      m.includes('unstable_cell')?'A casa instável rejeitou a marca.':m.includes('rule_violation')?'A regra desta rodada rejeitou a casa.':
      m.includes('occupied_cell')?'Essa casa já está ocupada.':m.includes('charge_unavailable')?'A carga PANI já foi consumida.':
      m.includes('anchor_unavailable')?'A Âncora já foi usada ou não está disponível.':m.includes('final_unavailable')?'A contenção final ainda não foi liberada.':'A PANI rejeitou a operação.';
    toast(friendly,true);console.error('containment action',error);return null
  }finally{containmentBusy=false}
}
function containmentVote(value){return containmentAction('vote',{value})}

function containmentToggleReduced(){
  containmentReduced=!containmentReduced;localStorage.setItem('pani-containment-reduced',containmentReduced?'1':'0');
  document.body.classList.toggle('ct-reduced',containmentReduced);render(true)
}
function containmentToggleSound(){containmentSound=!containmentSound;localStorage.setItem('pani-containment-sound',containmentSound?'1':'0');render(true)}

function containmentNoise(){
  if(!containmentSound)return;
  try{
    let C=window.AudioContext||window.webkitAudioContext,ctx=new C(),duration=.18,frames=Math.floor(ctx.sampleRate*duration),buf=ctx.createBuffer(1,frames,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<frames;i++)d[i]=(Math.random()*2-1)*(1-i/frames)*.12;
    let src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buf;src.connect(gain);gain.connect(ctx.destination);src.start();setTimeout(()=>ctx.close(),350)
  }catch{}
}
function containmentRunGlitch(glitch={}){
  let duration=Math.max(900,Math.min(2200,ctSafeInt(glitch.duration_ms,1400)));
  $('#ctglitch')?.remove();
  document.body.insertAdjacentHTML('beforeend',`<div id="ctglitch" class="ct-glitch ${containmentReduced?'reduced':''}" role="status" aria-live="assertive"><div class="ct-glitch-blocks"></div><div class="ct-glitch-scan"></div><div class="ct-glitch-copy" data-text="INTERFERÊNCIA DETECTADA">INTERFERÊNCIA DETECTADA</div></div>`);
  document.body.classList.add('ct-corrupting');containmentNoise();
  setTimeout(()=>{document.body.classList.remove('ct-corrupting');$('#ctglitch')?.remove()},containmentReduced?Math.min(900,duration):duration)
}

function ctStatusClass(status){return status==='contained'?'contained':status==='in_progress'?'active':status==='available'?'available':'detected'}
function ctSaturation(){let n=Math.max(0,Math.min(8,ctSafeInt(ctState().saturation)));return `<div class="ct-sat"><div class="ct-sat-head"><span>SATURAÇÃO DA ESTAÇÃO</span><b>${n}/8</b></div><div class="ct-sat-track">${Array.from({length:8},(_,i)=>`<i class="${i<n?(n>=6?'critical':n>=4?'danger':'lit'):''}"></i>`).join('')}</div><small>${n<=1?'ESTÁVEL':n<=3?'INTERFERÊNCIA':n<=5?'DEGRADAÇÃO':n<=7?'CRÍTICA':'COLAPSO LOCAL'}</small></div>`}
function ctPlayerList(){let players=containmentState?.players||[];return `<div class="ct-players">${players.map(p=>`<span class="${p.connected?'online':'offline'}"><i></i>${esc(p.display_name)}</span>`).join('')||'<span class="mut">Nenhum personagem sincronizado.</span>'}</div>`}
function ctAccessibility(){return `<div class="ct-access"><button class="btn" onclick="containmentToggleReduced()">FLASHES: ${containmentReduced?'REDUZIDOS':'COMPLETOS'}</button><button class="btn" onclick="containmentToggleSound()">ÁUDIO: ${containmentSound?'ATIVO':'MUDO'}</button></div>`}
function ctHeader(){let st=ctState(),restored=(st.modules_restored||[]).length;return `<header class="ct-header"><div><div class="k">PROTOCOLO DE RECAPTURA // PANI</div><h2>${st.active_event?ctEventName(st.active_event)+' // '+CT_EVENT_META[st.active_event].title:'EVENTOS DE CONTENÇÃO ANÔMALA'}</h2><p>${st.announcement?esc(st.announcement):'Aguardando comando operacional do Diretor da Sessão.'}</p></div><div class="ct-restored"><b>${restored}/4</b><span>MÓDULOS RESTAURADOS</span></div></header>${ctSaturation()}${ctPlayerList()}${ctAccessibility()}`}

function ctLobby(){return `<div class="card ct-lobby"><div class="ct-lobby-grid"><div><div class="k">PANI // SESSÃO AO VIVO</div><h2>PROTOCOLO DE RECAPTURA</h2><p>O terminal reconhece <b>${esc(me?.display_name||'TRIPULANTE')}</b>. Insira o código curto exibido pelo Diretor; sua credencial já determina o personagem e impede duplicidade de identidade.</p><label>CÓDIGO DA SESSÃO<input id="ctcode" maxlength="8" autocomplete="off" spellcheck="false" placeholder="AB12" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')" onkeydown="if(event.key==='Enter')containmentJoin()"></label><button id="ctjoin" class="btn a" onclick="containmentJoin()">ENTRAR NA SESSÃO</button></div><div class="ct-lobby-signal"><span>LIVE LINK</span><b>${CT_EVENT_META.knowledge.icon}${CT_EVENT_META.energy.icon}${CT_EVENT_META.blood.icon}${CT_EVENT_META.death.icon}</b><small>RECONEXÃO AUTOMÁTICA ATIVA</small></div></div>${ctAccessibility()}</div>`}

function ctEventCards(){let st=ctState(),statuses=st.event_status||{};return `<div class="ct-event-grid">${Object.entries(CT_EVENT_META).map(([id,m])=>{let status=statuses[id]||'detected';return `<article class="ct-event-card ${id} ${ctStatusClass(status)}"><div class="ct-event-icon">${m.icon}</div><div><div class="k">${m.short} // ${m.module}</div><h3>${m.title}</h3><p>GRAVIDADE ${m.gravity}</p></div><span>${CT_STATUS_LABEL[status]||status.toUpperCase()}</span></article>`}).join('')}</div>`}
function ctResidue(){let status=ctState().residue_status;if(!status||status==='locked')return '';
  if(status==='available')return `<section class="ct-residue available"><div class="k">VARREDURA LIMPA // NOVA LEITURA</div><h3>RESÍDUO NÃO CATALOGADO</h3><p>A análise existe, mas permanece selada até o Diretor liberar a continuidade narrativa.</p></section>`;
  return `<section class="ct-residue revealed"><div class="k">SETOR AMBIENTAL // ALICE VELVET</div><h3>RESÍDUO BIOLÓGICO NÃO CATALOGADO</h3><p>O material reage a forma e padrão. A PANI isolou correlações com os Sinais, mas o gatilho de reciprocidade continua sob controle do Diretor.</p><div class="term">ROTA CONVENCIONAL: NÃO DETECTADA\nPRESENÇA INTERNA: POSSÍVEL\nEVIDÊNCIA PRESERVÁVEL: RASTREADOR / AMOSTRA / QUADRO / FERIDA</div></section>`
}
function containmentDashboard(){return `<div class="card ct-shell">${ctHeader()}<div class="ct-rule"><b>NÃO DESTRUAM A ARENA.</b><span>VENÇAM A ARENA.</span></div>${ctEventCards()}${ctResidue()}<div class="ct-dashboard-note"><div class="k">STATUS DA SESSÃO</div><p>${ctState().status==='contained'?'Quatro assinaturas recapturadas. A varredura residual está disponível ao Diretor.':'A equipe está sincronizada. Quando o Diretor iniciar uma arena, todos os terminais migrarão automaticamente.'}</p></div></div>`}

function ctConsensus(options){let summary=containmentState?.vote_summary||{},total=Object.values(summary).reduce((n,v)=>n+ctSafeInt(v),0);if(!total)return '<div class="ct-consensus mut">SEM RECOMENDAÇÕES RECEBIDAS</div>';return `<div class="ct-consensus">${options.map(o=>{let v=o.value,count=ctSafeInt(summary[v]),pct=Math.round(count*100/total);return `<div><span>${esc(o.label)}</span><i><em style="width:${pct}%"></em></i><b>${pct}%</b></div>`}).join('')}</div>`}
function ctVoteButtons(options,action='vote'){return `<div class="ct-votes">${options.map(o=>`<button class="${containmentState?.my_vote===o.value?'selected':''}" onclick="${action==='blood_seal'?`containmentAction('blood_seal',{seal:'${ctEscAttr(o.value)}'})`:`containmentVote('${ctEscAttr(o.value)}')`}"><b>${esc(o.label)}</b>${o.note?`<span>${esc(o.note)}</span>`:''}</button>`).join('')}</div>`}
function ctRoleBanner(){let event=ctState().active_event,role=ctRole();if(event==='death'&&role!=='witness')return `<div class="ct-role spectator"><span>FUNÇÃO ATUAL</span><b>EQUIPE DE OBSERVAÇÃO</b><small>Registre o objeto alterado; somente a Testemunha confirma o ciclo.</small></div>`;let name=role==='representative'?'REPRESENTANTE':role==='witness'?'TESTEMUNHA':'EQUIPE / OBSERVADOR';return `<div class="ct-role ${role}"><span>FUNÇÃO ATUAL</span><b>${name}</b><small>${role==='representative'?'Sua confirmação altera o estado da arena.':role==='witness'?'Observe o consenso e confirme o quadro real.':'Vote livremente; sua recomendação não substitui a decisão final.'}</small></div>`}

function ctEnergyPath(){let ev=ctEvent(),pos=ctSafeInt(ev.position),hidden=ctSafeInt(ev.hidden_cells),ghost=ctSafeInt(ev.ghost_cell,-1),checkpoints=new Set(ev.checkpoints||[6,13]),forks=new Set(ev.forks||[3,9,15]);return `<div class="ct-energy-path">${Array.from({length:20},(_,i)=>{let concealed=hidden>0&&i>pos&&i<=pos+hidden;return `<div class="ct-energy-cell ${i===pos?'current':''} ${i<pos?'past':''} ${checkpoints.has(i)?'checkpoint':''} ${forks.has(i)?'fork':''} ${i===ghost?'ghost':''} ${concealed?'concealed':''}"><span>${i+1}</span><b>${i===pos?'PEÃO':checkpoints.has(i)?'CHECK':forks.has(i)?'BIFURCAÇÃO':concealed?'?':''}</b></div>`}).join('')}</div>`}
function containmentEnergy(){let ev=ctEvent(),atFork=(ev.forks||[3,9,15]).includes(ctSafeInt(ev.position)),routes=atFork?[{value:'stable',label:'ROTA ESTÁVEL',note:'Pulso nominal'},{value:'volatile',label:'ROTA ARRISCADA',note:'+1 casa / +1 sobrecarga'}]:[{value:'advance',label:'EXECUTAR PULSO',note:'Avanço coletivo'}];return `<div class="card ct-shell energy">${ctHeader()}${ctRoleBanner()}<div class="ct-arena-head"><div><div class="k">ENERGIA // TURNO ${ev.turn||1}</div><h2>TRILHA DE SOBRECARGA</h2><p>Conduza o peão até a contenção antes da rede atingir 7/7.</p></div><div class="ct-pulse"><span>PULSO</span><b>+${ev.pulse||1}</b></div></div>${ctEnergyPath()}<div class="ct-energy-status"><div><span>SOBRECARGA</span><div>${Array.from({length:7},(_,i)=>`<i class="${i<ctSafeInt(ev.overload)?'lit':''}"></i>`).join('')}</div><b>${ev.overload||0}/7</b></div><article><div class="k">ÚLTIMA CARTA</div><h3>${esc(ev.card_label_override||ev.last_card||'PULSO AINDA NÃO RESOLVIDO')}</h3><p>${esc(ev.last_effect||'Aguardando confirmação.')}</p></article></div>${ctIsRepresentative()?`${ctConsensus(routes)}<div class="ct-energy-options"><label><input id="ctacceptover" type="checkbox"> ACEITAR SOBRECARGA PARA REDUZIR RECUO</label><select id="ctcardchoice"><option value="left">CARTA OCULTA // ESQUERDA</option><option value="right">CARTA OCULTA // DIREITA</option></select></div><div class="ct-votes">${routes.map(r=>`<button onclick="containmentEnergyMove('${r.value}')"><b>${r.label}</b><span>${r.note}</span></button>`).join('')}</div>`:ctVoteButtons(routes)}</div>`}
function containmentEnergyMove(route){return containmentAction('energy_move',{route:route==='advance'?'stable':route,accept_overload:!!$('#ctacceptover')?.checked,card_choice:$('#ctcardchoice')?.value||'left'})}

function containmentTimerRemaining(){let end=Date.parse(ctState().timer_end||'');if(!Number.isFinite(end))return null;return Math.max(0,Math.ceil((end-(Date.now()+containmentClockOffset))/1000))}
function containmentTimerTick(){let e=$('#ct-timer');if(!e)return;let n=containmentTimerRemaining();e.textContent=n===null?'—':String(n).padStart(2,'0');e.parentElement?.style.setProperty('--timer-p',String(n===null?0:Math.max(0,Math.min(1,n/Math.max(1,ctSafeInt(ctEvent().beat_seconds,15))))))}
setInterval(containmentTimerTick,250);
function containmentBlood(){let ev=ctEvent();if(ev.phase==='final')return containmentBloodFinal();let valves=['A','B','C'].map(x=>({value:x,label:'VÁLVULA '+x}));return `<div class="card ct-shell blood">${ctHeader()}${ctRoleBanner()}<div class="ct-arena-head"><div><div class="k">SANGUE // BATIMENTO ${ev.beat||1}</div><h2>HEMOPULSO // O CORAÇÃO IMPOSSÍVEL</h2><p>Uma única válvula é segura. As leituras são comparativas; conhecimento médico não é necessário.</p></div><div class="ct-timer-ring" style="--timer-p:1"><b id="ct-timer">${containmentTimerRemaining()??'—'}</b><span>SEGUNDOS</span></div></div><div class="ct-blood-meters"><div><span>ESTABILIZAÇÃO</span><b>${ev.stabilization||0}/4</b></div><div><span>HEMORRAGIA</span><b>${ev.hemorrhage||0}/3</b></div></div>${ev.one_may_lie?'<div class="ct-corruption-note">INTERFERÊNCIA: UMA LEITURA PODE ESTAR MENTINDO.</div>':''}<div class="ct-readings">${(ev.readings||[]).map((r,i)=>`<article><b>LEITURA ${i+1}</b><p>${esc(r)}</p></article>`).join('')}</div>${ctIsRepresentative()?`${ctConsensus(valves)}<div class="ct-valves">${valves.map(v=>`<button class="${ev.selected_valve===v.value?'selected':''}" onclick="containmentAction('blood_select',{valve:'${v.value}'})"><i></i><b>${v.value}</b><span>${ev.selected_valve===v.value?'SELECIONADA':'ARMAR'}</span></button>`).join('')}</div>`:ctVoteButtons(valves)}<p class="mut small">A escolha pode ser alterada até o cronômetro encerrar. Em 3/3, a PANI retorna ao patamar 2/4 sem reiniciar a arena.</p></div>`}
function containmentBloodFinal(){let ev=ctEvent(),seals=['A','B','C','D'].map(x=>({value:x,label:'FIXAR '+x})),others=Math.max(1,(containmentState.players||[]).filter(p=>p.connected&&p.crew_id!==ctState().representative_id).length),required=Math.min(4,others);return `<div class="card ct-shell blood final">${ctHeader()}${ctRoleBanner()}<div class="ct-final-call"><div class="k">COOPERAÇÃO FINAL // 4/4</div><h2>${ctIsRepresentative()?'CONTER':'FIXAR O HEMOPULSO'}</h2><p>O representante mantém a contenção enquanto ${required} selo${required===1?'':'s'} distinto${required===1?'':'s'} ${required===1?'é fixado':'são fixados'} pela equipe conectada.</p></div>${ctIsRepresentative()?`<button class="ct-contain-command ${ev.representative_ready?'ready':''}" onclick="containmentAction('blood_contain')"><b>${ev.representative_ready?'CONTENÇÃO ARMADA':'CONTER'}</b><span>${ev.representative_ready?`AGUARDANDO ${required} SELO${required===1?'':'S'}`:'CONFIRMAR COMANDO FINAL'}</span></button>`:`${ctVoteButtons(seals,'blood_seal')}<div class="ct-consensus-note">Seu selo atual: <b>${esc(containmentState.my_vote||'NENHUM')}</b>. A PANI ajustou a contenção para ${required} dispositivo${required===1?'':'s'} auxiliar${required===1?'':'es'} nesta sessão.</div>`}</div>`}

function ctSceneObject(id,current,changed,missing){let label=CT_OBJECTS[id],cls=`ct-object ${id} ${current&&changed?'changed':''} ${current&&missing?'missing':''}`;return `<button class="${cls} ${containmentState.my_vote===id?'voted':''}" onclick="containmentVote('${id}')"><i></i><span>${label}</span></button>`}
function ctDeathScene(current=false){let ev=ctEvent(),changed=new Set(ev.changed_visuals||[]),missing=ev.missing_object;return `<div class="ct-room ${current?'current':''} ${ev.memory_overlay?'memory':''}">${Object.keys(CT_OBJECTS).map(id=>ctSceneObject(id,current,changed.has(id),missing===id)).join('')}</div>`}
function containmentDeath(){let ev=ctEvent();if(ev.phase==='final')return containmentDeathFinal();let opts=Object.entries(CT_OBJECTS).map(([value,label])=>({value,label}));return `<div class="card ct-shell death">${ctHeader()}${ctRoleBanner()}<div class="ct-arena-head"><div><div class="k">MORTE // CICLO ${ev.cycle||1}/4 // LOOP 11.7s</div><h2>CÂMERA 13 // O QUADRO QUE VOLTA</h2><p>Compare os dois quadros e selecione o objeto que mudou. Somente uma alteração é verdadeira.</p></div><div class="ct-cycle"><b>${ev.cycle||1}</b><span>QUADRO</span></div></div><div class="ct-scenes"><section><span>MEMÓRIA BASE</span>${ctDeathScene(false)}</section><section><span>RETORNO ATUAL</span>${ctDeathScene(true)}</section></div>${ctIsWitness()?`${ctConsensus(opts)}<div class="ct-witness-confirm"><div><div class="k">CONFIRMAÇÃO DA TESTEMUNHA</div><p>O consenso é consultivo. Confirme o objeto que realmente mudou.</p></div><select id="ctdeathconfirm">${opts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select><button class="btn a" onclick="containmentAction('death_confirm',{object:$('#ctdeathconfirm').value})">CONFIRMAR QUADRO</button></div>`:`<p class="mut small">Clique em um objeto no quadro atual para registrar sua percepção.</p>`}${!ev.anchor&&ctIsWitness()?`<div class="ct-anchor"><select id="ctanchor">${opts.map(o=>`<option value="${o.value}">${o.label}</option>`).join('')}</select><button class="btn" onclick="containmentAction('death_anchor',{object:$('#ctanchor').value})">USAR ÂNCORA</button><small>Uso único: o objeto ancorado não poderá ser a mudança real nos ciclos seguintes.</small></div>`:ev.anchor?`<div class="ct-anchor locked">ÂNCORA ATIVA // ${esc(CT_OBJECTS[ev.anchor]||ev.anchor)}</div>`:''}</div>`}
function containmentDeathFinal(){return `<div class="card ct-shell death final">${ctHeader()}${ctRoleBanner()}<div class="ct-final-call"><div class="k">CICLO FRATURADO // 4/4</div><h2>MANTER CICLO</h2><p>Todos os participantes conectados devem sustentar o comando juntos. Solte e o vínculo desaparece.</p></div><button id="cthold" class="ct-hold" onpointerdown="containmentDeathHoldStart(event)" onpointerup="containmentDeathHoldStop()" onpointerleave="containmentDeathHoldStop()" onpointercancel="containmentDeathHoldStop()"><i></i><b>MANTER CICLO</b><span>SEGURE ATÉ A CONTENÇÃO</span></button></div>`}
function containmentDeathHoldStart(event){event?.preventDefault?.();if(containmentDeathHoldTimer)return;$('#cthold')?.classList.add('holding');containmentAction('death_hold',{},false);containmentDeathHoldTimer=setInterval(()=>containmentAction('death_hold',{},false),900)}
function containmentDeathHoldStop(){clearInterval(containmentDeathHoldTimer);containmentDeathHoldTimer=null;$('#cthold')?.classList.remove('holding')}

function containmentPage(){
  document.body.classList.toggle('ct-reduced',containmentReduced);
  if(containmentState?.sync_error)return `<div class="card ct-closed"><div class="k">PANI // FALHA DE SINCRONIZAÇÃO</div><h2>A ARENA NÃO RESPONDEU</h2><p class="mut">${esc(containmentState.sync_error)}</p><button class="btn a" onclick="containmentOpen()">TENTAR NOVAMENTE</button>${ctAccessibility()}</div>`;
  if(!containmentReleased())return `<div class="card ct-closed"><div class="k">PANI // ROTINA EXTRAORDINÁRIA</div><h2>NENHUMA SESSÃO DE CONTENÇÃO ATIVA</h2><p class="mut">O Protocolo de Recaptura permanece selado pelo Diretor da Sessão.</p>${ctAccessibility()}</div>`;
  if(!containmentJoined())return ctLobby();
  let id=ctState().active_event;
  if(!id)return containmentDashboard();
  return id==='knowledge'?containmentKnowledge():id==='energy'?containmentEnergy():id==='blood'?containmentBlood():containmentDeath()
}

async function containmentMasterRefresh(rerender=true){
  if(!MASTER||!pin)return containmentMasterState;
  try{let data=await rpc('pani_containment_master_state',{p_pin:pin});containmentAdopt(data,true);if(rerender)containmentMasterRender();return data}
  catch(error){console.error('containment master state',error);return containmentMasterState}
}
async function containmentMasterAction(action,payload={}){
  if(containmentBusy)return null;containmentBusy=true;
  try{let data=await rpc('pani_containment_master_action',{p_pin:pin,p_action:action,p_payload:payload});containmentAdopt(data,true);containmentMasterRender();toast('MASTER // CONTENÇÃO ATUALIZADA');return data}
  catch(error){console.error('containment master action',error);toast('Falha no controle de contenção: '+String(error?.message||'operação rejeitada'),true);return null}
  finally{containmentBusy=false}
}
function containmentMasterNew(){let code=String($('#ctmcode')?.value||'').trim().toUpperCase();return containmentMasterAction('new_session',code?{code}:{})}
function containmentMasterSetAvailable(event,status){return containmentMasterAction('set_available',{event,available:status!=='available'})}
function containmentMasterStart(event){let needsRep=['energy','blood'].includes(event),representative_id=$('#ctmrep')?.value||'';if(needsRep&&!representative_id)return toast('Energia e Sangue exigem um representante conectado.',true);return containmentMasterAction('start_event',{event,representative_id:needsRep?representative_id:null,beat_seconds:ctSafeInt($('#ctmbloodseconds')?.value,15)})}
function containmentMasterRep(){let crew_id=$('#ctmrep')?.value||'',active=ctState().active_event;if(crew_id&&['energy','blood'].includes(active))return containmentMasterAction('set_representative',{crew_id})}
function containmentMasterWitness(){let crew_id=$('#ctmwitness')?.value||'';if(crew_id)return containmentMasterAction('set_witness',{crew_id})}
function containmentMasterCorrupt(){return containmentMasterAction('corrupt',{kind:$('#ctmcorruption')?.value||'',duration_ms:ctSafeInt($('#ctmduration')?.value,1400)})}
function containmentMasterSay(){let text=$('#ctmsay')?.value?.trim();if(text)return containmentMasterAction('pani_say',{text})}

function ctMasterPlayerOptions(selected=''){let players=(containmentMasterState.players||[]).filter(p=>p.joined);return `<option value="">SELECIONE</option>${players.map(p=>`<option value="${ctEscAttr(p.crew_id)}" ${p.crew_id===selected?'selected':''}>${esc(p.display_name)}${p.connected?'':' // OFFLINE'}</option>`).join('')}`}
function ctMasterEventControls(){let st=containmentMasterState.state||{},statuses=st.event_status||{},active=st.active_event;return `<div class="ctm-events">${Object.entries(CT_EVENT_META).map(([id,m])=>{let status=statuses[id]||'detected';return `<article class="${id} ${ctStatusClass(status)}"><div><span>${m.icon}</span><div><b>${m.short}</b><small>${CT_STATUS_LABEL[status]||status}</small></div></div><div class="actions">${status==='detected'?`<button class="btn" onclick="containmentMasterSetAvailable('${id}','${status}')">DISPONIBILIZAR</button>`:status==='available'?`<button class="btn" onclick="containmentMasterSetAvailable('${id}','${status}')">RESTRINGIR</button><button class="btn a" onclick="containmentMasterStart('${id}')" ${active?'disabled':''}>${active?'AGUARDE A ARENA ATUAL':'INICIAR'}</button>`:status==='in_progress'?'<span class="pill">ARENA ATIVA</span>':'<span class="pill ok">MÓDULO RESTAURADO</span>'}</div></article>`}).join('')}</div>`}
function ctMasterCorruptionOptions(id){let options=id==='knowledge'?[['ghost_mark','MARCA FANTASMA'],['semantic_swap','TROCA SEMÂNTICA']]:id==='energy'?[['swapped_card','CARTA TROCADA'],['charged_pulse','PULSO CARREGADO']]:id==='blood'?[['false_reading','LEITURA FALSA'],['corrupted_vote','VOTO CORROMPIDO']]:[['false_echo','FALSO ECO'],['missing_frame','QUADRO AUSENTE'],['memory_overlay','MEMÓRIA SOBREPOSTA']];return options.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}
function ctMasterSpecific(id){let st=containmentMasterState.state||{},ev=st.event||{},sec=containmentMasterState.secret_state||{};
  if(id==='knowledge')return `<div class="ctm-specific"><div class="k">CONHECIMENTO // REGRA REAL: ${esc(sec?.knowledge?.rule_id||'—')}</div><div class="actions"><button class="btn" onclick="containmentMasterAction('knowledge_rule',{rule_id:'diagonal_prohibited'})">DIAGONAL PROIBIDA</button><button class="btn" onclick="containmentMasterAction('knowledge_rule',{rule_id:'false_center'})">CENTRO FALSO</button><button class="btn" onclick="containmentMasterAction('knowledge_rule',{rule_id:'mobile_cell'})">CASA MÓVEL</button><button class="btn" onclick="containmentMasterAction('grant_hint',{text:'A malha reage à posição, não ao desenho da marca.'})">+ PISTA</button></div></div>`;
  if(id==='energy')return `<div class="ctm-specific"><div class="k">ENERGIA // PRÓXIMA CARTA: ${esc(sec?.energy?.override_card||sec?.energy?.deck?.[sec?.energy?.index||0]||'—')}</div><div class="actions">${[1,2,3,4,5,6].map(n=>`<button class="btn" onclick="containmentMasterAction('energy_pulse',{value:${n}})">PULSO ${n}</button>`).join('')}</div><select id="ctmcard">${CT_CARDS.map(c=>`<option>${c}</option>`).join('')}</select><button class="btn" onclick="containmentMasterAction('energy_card',{card:$('#ctmcard').value})">FORÇAR CARTA</button></div>`;
  if(id==='blood')return `<div class="ctm-specific"><div class="k">SANGUE // RESPOSTA REAL: ${esc(sec?.blood?.answer||'—')}</div><div class="actions">${[12,15,18].map(n=>`<button class="btn" onclick="containmentMasterAction('blood_timer',{seconds:${n}})">${n}s</button>`).join('')}</div><p class="small mut">Votos reais permanecem no log abaixo mesmo quando VOTO CORROMPIDO altera apenas a tela do representante.</p></div>`;
  if(id==='death')return `<div class="ctm-specific"><div class="k">MORTE // OBJETO REAL: ${esc(CT_OBJECTS[sec?.death?.answer]||sec?.death?.answer||'—')}</div><label>TESTEMUNHA DO CICLO<select id="ctmwitness" onchange="containmentMasterWitness()">${ctMasterPlayerOptions(st.witness_id||'')}</select><small>Não existe representante nesta arena. A Testemunha confirma o quadro e pode usar a Âncora.</small></label><div class="actions">${[1,2,3,4].map(n=>`<button class="btn" onclick="containmentMasterAction('death_scene',{cycle:${n}})">CENA ${n}</button>`).join('')}</div></div>`;
  return ''
}
function ctMasterPlayers(){let st=containmentMasterState.state||{};return `<div class="ctm-player-list">${(containmentMasterState.players||[]).map(p=>`<article><i class="${p.connected?'on':''}"></i><div><b>${esc(p.display_name)}</b><small>${String(p.module||'').toUpperCase()} // ${p.joined?p.connected?'CONECTADO':'AUSENTE':'FORA DA SALA'}</small></div><div class="actions">${p.joined?`<button class="btn" onclick="containmentMasterAction('remove_player',{crew_id:'${ctEscAttr(p.crew_id)}'})">REMOVER</button>`:`<button class="btn" onclick="containmentMasterAction('reconnect_player',{crew_id:'${ctEscAttr(p.crew_id)}'})">RECONECTAR</button>`}</div></article>`).join('')}</div>`}
function ctMasterVotes(){let votes=containmentMasterState.votes||[];return votes.length?`<table><tr><th>Jogador</th><th>Evento / fase</th><th>Voto real</th></tr>${votes.slice(-18).reverse().map(v=>`<tr><td>${esc(v.display_name)}</td><td>${esc(v.event_id)} // ${esc(v.phase_key)}</td><td>${esc(v.value)}</td></tr>`).join('')}</table>`:'<p class="mut">Nenhum voto registrado na fase atual.</p>'}
function ctMasterLogs(){let logs=containmentMasterState.logs||[];return `<div class="term ctm-log">${logs.slice(0,35).map(x=>`[${new Date(x.created_at).toLocaleTimeString()}] ${x.actor} :: ${x.event_type}${x.detail?' :: '+x.detail:''}`).join('\n')||'Sem eventos de contenção.'}</div>`}

function containmentMasterRender(){let root=$('#ctmasterbody');if(!root)return;let data=containmentMasterState,st=data.state||{},released=st.released===true;
  if(!released){root.innerHTML=`<div class="ctm-new"><div><div class="k">PROTOCOLO PANI // v1.1</div><h3>ABRIR EVENTOS DE CONTENÇÃO</h3><p class="mut">Crie a sala. O código pode ser definido agora ou gerado automaticamente.</p></div><input id="ctmcode" maxlength="8" placeholder="CÓDIGO OPCIONAL" oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,'')"><button class="btn a" onclick="containmentMasterNew()">NOVA SESSÃO AO VIVO</button></div>`;return}
  let active=st.active_event,joined=(data.players||[]).filter(p=>p.joined),charges=ctSafeInt(st.corruption_charges),residue=st.residue_status;
  root.innerHTML=`<div class="ctm-top"><div><span>CÓDIGO DA SESSÃO</span><b>${esc(data.join_code||'—')}</b><small>${joined.length} PERSONAGEM${joined.length===1?'':'S'} NA SALA</small></div><div><span>SATURAÇÃO</span><b>${st.saturation||0}/8</b><small>${(st.modules_restored||[]).length}/4 MÓDULOS</small></div><div><span>CORRUPÇÃO</span><b>${charges}/2</b><small>CARGAS RESTANTES</small></div></div>
  <label>REPRESENTANTE // SOMENTE ENERGIA E SANGUE<select id="ctmrep" onchange="containmentMasterRep()">${ctMasterPlayerOptions(st.representative_id||'')}</select><small>Conhecimento é jogado diretamente por todos. Morte utiliza Testemunha.</small></label>
  ${ctMasterEventControls()}${active?`<section class="ctm-live"><div class="ctm-live-head"><div><div class="k">ARENA ATIVA // ${ctEventName(active)}</div><h3>${esc(CT_EVENT_META[active].title)}</h3></div><span class="pill">${esc(st.event?.phase||'—')}</span></div><div class="ctm-global-actions"><button class="btn ${st.paused?'a':''}" onclick="containmentMasterAction('pause')">${st.paused?'RETOMAR':'PAUSAR SYNC'}</button><button class="btn" onclick="containmentMasterAction('saturation',{delta:-1})">SAT −</button><button class="btn" onclick="containmentMasterAction('saturation',{delta:1})">SAT +</button><button class="btn" onclick="containmentMasterAction('clear_votes')">LIMPAR VOTOS</button><button class="btn r" onclick="containmentMasterAction('contain_event')">FORÇAR CONTENÇÃO</button><button class="btn" onclick="containmentMasterAction('end_event')">ENCERRAR ARENA</button></div><div class="ctm-corrupt"><select id="ctmcorruption">${ctMasterCorruptionOptions(active)}</select><select id="ctmduration"><option value="900">0.9s</option><option value="1400" selected>1.4s</option><option value="2200">2.2s</option></select><button class="btn r" onclick="containmentMasterCorrupt()" ${charges<1?'disabled':''}>CORROMPER PANI</button><button class="btn" onclick="containmentMasterAction('restore_corruption')">RESTAURAR</button></div>${ctMasterSpecific(active)}</section>`:''}
  <section class="ctm-say"><input id="ctmsay" maxlength="600" placeholder="FALA DIEGÉTICA DA PANI"><button class="btn" onclick="containmentMasterSay()">TRANSMITIR</button></section>
  ${residue==='available'?'<button class="btn r ctm-residue" onclick="containmentMasterAction(\'residue_reveal\')">LIBERAR RESÍDUO BIOLÓGICO // ALICE</button>':residue==='revealed'?'<button class="btn a ctm-residue" onclick="containmentMasterAction(\'residue_complete\')">REGISTRAR CORRELAÇÃO DA ALICE</button>':''}
  <div class="ctm-columns"><section><div class="k">PERSONAGENS & PRESENÇA</div>${ctMasterPlayers()}</section><section><div class="k">VOTOS REAIS // SERVIDOR</div>${ctMasterVotes()}</section></div>${ctMasterLogs()}<button class="btn r ctm-close" onclick="confirmBox('Encerrar sessão de contenção?','Jogadores sairão da sala e o estado das quatro arenas será reiniciado.',()=>containmentMasterAction('close_session'))">ENCERRAR E REINICIAR PROTOCOLO</button>`
}

function containmentMasterInject(){if(!MASTER||$('#ctmaster'))return;let log=$('#logs')?.closest('.card');let html=`<section id="ctmaster" class="card ctm"><div class="ctm-title"><div><div class="k">MASTER // PROTOCOLO DE RECAPTURA</div><h2>EVENTOS DE CONTENÇÃO ANÔMALA</h2><p class="mut">Sessão sincronizada, representante, testemunha, votação real e estado secreto de corrupção.</p></div><button class="btn" onclick="containmentMasterRefresh(true)">SINCRONIZAR</button></div><div id="ctmasterbody"><p class="mut">Aguardando autenticação...</p></div></section>`;(log||$('#mapp')).insertAdjacentHTML(log?'beforebegin':'beforeend',html)}
containmentMasterInject();

// v1.2 // CONEXO + turnos adversariais reais do Mestre.
CT_EVENT_META.knowledge.title='CONEXO // MATRIZ DE ASSOCIAÇÃO';

async function containmentAction(action,payload={}){
  if(containmentBusy)return null;containmentBusy=true;
  try{let data=await rpc('pani_containment_crew_action_v12',{p_token:tok,p_action:action,p_payload:payload});containmentAdopt(data);render(true);return data}
  catch(error){let m=String(error?.message||''),friendly=m.includes('master_turn')?'A entidade está agindo. Aguarde a vez da equipe.':m.includes('representative_required')?'A decisão final pertence ao representante.':m.includes('witness_required')?'A confirmação pertence à Testemunha.':m.includes('four_unique_words_required')?'Selecione exatamente quatro palavras diferentes.':m.includes('anchor_protected')?'A Âncora não pode ser alterada.':m;toast(friendly,true);return null}
  finally{containmentBusy=false}
}
async function containmentMasterAction(action,payload={}){
  if(containmentBusy)return null;containmentBusy=true;
  try{let data=await rpc('pani_containment_master_action_v12',{p_pin:pin,p_action:action,p_payload:payload});containmentAdopt(data,true);containmentMasterRender();toast('MASTER // CONTENÇÃO ATUALIZADA');return data}
  catch(error){console.error('containment master action',error);toast('Falha no controle: '+String(error?.message||'operação rejeitada'),true);return null}
  finally{containmentBusy=false}
}

function ctSideBanner(){let side=ctEvent().active_side||'PLAYERS',knowledge=ctState().active_event==='knowledge';return `<div class="ct-side ${side.toLowerCase()}"><span>TURNO ATIVO</span><b>${side==='MASTER'?'MESTRE // ENTIDADE':'PLAYERS // EQUIPE'}</b><small>${side==='MASTER'?'Aguardando a ação hostil do Mestre.':knowledge?'Qualquer integrante pode fechar um grupo; o primeiro envio válido é processado.':'A equipe pode votar; o representante confirma.'}</small></div>`}
function ctKnowledgeWords(){return ctEvent().words||[]}
function ctKnowledgeSelection(){window.ctKSelection=Array.isArray(window.ctKSelection)?window.ctKSelection.filter(x=>ctKnowledgeWords().includes(x)):[];return window.ctKSelection}
function ctKnowledgeToggle(word){let a=ctKnowledgeSelection(),i=a.indexOf(word);if(i>=0)a.splice(i,1);else if(a.length<4)a.push(word);render(true)}
function ctKnowledgeSubmit(){let words=ctKnowledgeSelection();if(words.length!==4)return toast('Selecione quatro palavras.',true);window.ctKSelection=[];return containmentAction('knowledge_submit',{words})}
function containmentKnowledge(){let ev=ctEvent(),words=ctKnowledgeWords(),selected=ctKnowledgeSelection(),masterTurn=ev.active_side==='MASTER';
  if(ev.phase==='final')return `<div class="card ct-shell knowledge final">${ctHeader()}${ctSideBanner()}<div class="ct-final-call"><div class="k">MATRIZ SEMÂNTICA 4/4</div><h2>INDEXAÇÃO RESTAURADA</h2><p>A entidade permaneceu como o único objeto sem categoria válida.</p></div><button class="ct-contain-command" onclick="containmentAction('knowledge_contain')"><b>CONTER</b><span>CONFIRMAR CAPTURA DA EQUIPE</span></button></div>`;
  let solved=(ev.solved_groups||[]).map(g=>`<article><b>${esc(g.name)}</b><span>${(g.words||[]).map(esc).join(' · ')}</span></article>`).join('');
  return `<div class="card ct-shell knowledge">${ctHeader()}${ctSideBanner()}<div class="ct-arena-head"><div><div class="k">CONHECIMENTO // CONEXO</div><h2>MATRIZ DE ASSOCIAÇÃO</h2><p>Reconstrua quatro relações ocultas em equipe. A criatura corrompe a percepção, nunca a solução.</p></div><div class="ct-score"><b>${ev.coherence??4}/4</b><span>COERÊNCIA PANI</span></div></div>${ev.partial?'<div class="ct-hint">CORRELAÇÃO PARCIAL DETECTADA // três palavras pertencem ao mesmo grupo.</div>':''}${ev.hint?`<div class="ct-hint">${esc(ev.hint)}</div>`:''}<div class="ct-k-solved">${solved}</div><div class="ct-selection-status" aria-live="polite"><b>${selected.length}/4 SELECIONADAS</b><span>${selected.length===4?'GRUPO PRONTO PARA ENVIO':'Escolha '+(4-selected.length)+' palavra'+(4-selected.length===1?'':'s')}</span></div><div class="ct-conexo">${words.map(w=>{let chosen=selected.includes(w);return `<button type="button" aria-pressed="${chosen}" class="${chosen?'selected':''} ${ev.blocked_word===w?'blocked':''} ${ev.unstable_word===w?'unstable':''}" ${masterTurn||ev.blocked_word===w?'disabled':''} onclick="ctKnowledgeToggle('${ctEscAttr(w)}')">${chosen?'<i>✓</i>':''}${esc(w)}</button>`}).join('')}</div><button class="btn a ct-submit-group" ${masterTurn||selected.length!==4?'disabled':''} onclick="ctKnowledgeSubmit()">ENVIAR GRUPO DA EQUIPE // ${selected.length}/4</button></div>`}

const containmentEnergyV11=containmentEnergy;
containmentEnergy=function(){let html=containmentEnergyV11(),ev=ctEvent();return html.replace(ctRoleBanner(),ctRoleBanner()+ctSideBanner()).replace('<div class="ct-votes">',`<div class="ct-turn-note">${ev.active_side==='MASTER'?'A entidade está escolhendo uma ameaça. Nenhum movimento será aceito.':'A equipe controla um único peão coletivo.'}</div><div class="ct-votes">`).replace(/onclick="containmentEnergyMove/g,`${ev.active_side==='MASTER'?'disabled ':''}onclick="containmentEnergyMove`) }
const containmentBloodV11=containmentBlood;
containmentBlood=function(){let ev=ctEvent();if(ev.phase==='master_prepare')return `<div class="card ct-shell blood">${ctHeader()}${ctRoleBanner()}${ctSideBanner()}<div class="ct-final-call"><div class="k">SANGUE // BATIMENTO ${ev.beat||1}</div><h2>A ENTIDADE ESCOLHE O CORAÇÃO</h2><p>A resposta será bloqueada no servidor antes do cronômetro começar.</p></div></div>`;return containmentBloodV11().replace(ctRoleBanner(),ctRoleBanner()+ctSideBanner())}
const containmentDeathV11=containmentDeath;
containmentDeath=function(){let ev=ctEvent();if(ev.phase==='master_prepare')return `<div class="card ct-shell death">${ctHeader()}${ctRoleBanner()}${ctSideBanner()}<div class="ct-final-call"><div class="k">CÂMERA 13 // CICLO ${ev.cycle||1}/4</div><h2>A ENTIDADE PREPARA A MUTAÇÃO</h2><p>A cena só será exibida após o Mestre registrar uma alteração válida.</p></div></div>`;return containmentDeathV11().replace(ctRoleBanner(),ctRoleBanner()+ctSideBanner())}

function containmentMasterStart(event){let needsRep=['energy','blood'].includes(event),representative_id=$('#ctmrep')?.value||'';if(needsRep&&!representative_id)return toast('Escolha um representante conectado para esta arena.',true);return containmentMasterAction('start_event',{event,representative_id:needsRep?representative_id:null,beat_seconds:ctSafeInt($('#ctmbloodseconds')?.value,15)})}
function containmentMasterRep(){let crew_id=$('#ctmrep')?.value||'',active=containmentMasterState?.state?.active_event;if(crew_id&&['energy','blood'].includes(active))return containmentMasterAction('set_representative',{crew_id})}
function ctMasterSpecific(id){let st=containmentMasterState.state||{},ev=st.event||{},sec=containmentMasterState.secret_state||{};
 if(id==='knowledge'){let hand=sec?.knowledge?.corruption_hand||[];return `<div class="ctm-specific"><div class="k">CONEXO // ${ev.active_side==='MASTER'?'SUA VEZ':'VEZ DA EQUIPE'}</div><div class="ct-master-hand">${hand.map(c=>`<button class="btn" ${ev.active_side!=='MASTER'?'disabled':''} onclick="containmentMasterAction('knowledge_master',{card:'${c}'})">${c.replaceAll('_',' ').toUpperCase()}</button>`).join('')}<button class="btn a" ${ev.active_side!=='MASTER'?'disabled':''} onclick="containmentMasterAction('knowledge_master',{card:'pass'})">PASSAR</button></div><small>A solução real permanece imutável.</small></div>`}
 if(id==='energy'){let hand=sec?.energy?.hand||[];return `<div class="ctm-specific"><div class="k">MÃO PRIVADA DE AMEAÇAS // ${ev.active_side==='MASTER'?'ESCOLHA OBRIGATÓRIA':'AGUARDANDO PLAYERS'}</div><div class="ct-master-hand">${hand.map(c=>`<button class="btn r" onclick="containmentMasterAction('energy_threat',{card:'${ctEscAttr(c)}'})">${esc(c)}</button>`).join('')}<button class="btn a" ${ev.active_side!=='MASTER'?'disabled':''} onclick="containmentMasterAction('energy_threat',{card:'PASSAR'})">PASSAR</button></div></div>`}
 if(id==='blood'){let choices=sec?.blood?.choices||[];return `<div class="ctm-specific"><div class="k">BATIMENTOS PREPARADOS // ${sec?.blood?.answer_locked?'RESPOSTA BLOQUEADA: '+esc(sec.blood.answer):'ESCOLHA UM CARTÃO'}</div><div class="ct-master-hand">${choices.map((c,i)=>`<button class="btn r" ${ev.active_side!=='MASTER'?'disabled':''} onclick="containmentMasterAction('blood_choose',{index:${i}})"><b>DESAFIO ${i+1}</b><span>Resposta ${esc(c.answer)}</span></button>`).join('')}</div></div>`}
 if(id==='death'){let choices=sec?.death?.choices||[];return `<div class="ctm-specific"><div class="k">MUTAÇÕES PREPARADAS // CICLO ${ev.cycle||1}</div><label>TESTEMUNHA DO CICLO<select id="ctmwitness" onchange="containmentMasterWitness()">${ctMasterPlayerOptions(st.witness_id||'')}</select></label><div class="ct-master-hand">${choices.map((c,i)=>`<button class="btn r" ${ev.active_side!=='MASTER'?'disabled':''} onclick="containmentMasterAction('death_mutation',{index:${i}})">ALTERAR ${esc(CT_OBJECTS[c.answer]||c.answer)}</button>`).join('')}</div><small>A mutação é gravada no servidor antes da exibição.</small></div>`}return ''}

const containmentMasterRenderV11=containmentMasterRender;
containmentMasterRender=function(){containmentMasterRenderV11();let root=$('#ctmasterbody');if(!root)return;root.innerHTML=root.innerHTML.replaceAll('v1.1','v1.2').replace('REPRESENTANTE // SOMENTE ENERGIA E SANGUE','REPRESENTANTE // ENERGIA E SANGUE').replace('Conhecimento é jogado diretamente por todos. Morte utiliza Testemunha.','Conhecimento é cooperativo e não exige representante. Energia e Sangue usam operador; Morte utiliza Testemunha.');let active=containmentMasterState?.state?.active_event;if(active){let spec=root.querySelector('.ctm-specific');if(spec)spec.outerHTML=ctMasterSpecific(active);let playerList=root.querySelector('.ctm-player-list');if(playerList&&['energy','blood'].includes(active)){playerList.insertAdjacentHTML('beforebegin','<button class="btn" onclick="containmentMasterSkipAbsent()">PULAR AUSENTE / TROCAR OPERADOR</button>')}}}
function containmentMasterSkipAbsent(){let current=containmentMasterState?.state?.representative_id,players=(containmentMasterState.players||[]).filter(p=>p.joined&&p.crew_id!==current),next=players.find(p=>p.connected)||players[0];if(!next)return toast('Nenhum outro jogador disponível.',true);return containmentMasterAction('skip_player',{crew_id:next.crew_id})}
