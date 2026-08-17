'use strict';

/* PANI W77 // TRANSMISSÃO ALHEIA
   Semântica/legendas existem somente no console do mestre.
   O feed do jogador recebe exclusivamente asset_key + tempo restante. */
const TX_ASSET_BASE='https://nvwzcnfonhpilnxmopgi.supabase.co/storage/v1/object/public/pani-transmission-assets/';
const TX_CREW=[
  ['gilbert','Gilbert'],['willy','Willy'],['viego','Viego'],['alice','Alice'],['eklay','Eklay'],['christian','Christian']
];
let txCatalog=[],txSelected=null,txTab='alphabet',txSearch='',txActive=[],txMasterBusy=false;
let txLastFeedId=0,txOverlayTimer=null,txMasterMounted=false;

function txAssetUrl(asset){return TX_ASSET_BASE+encodeURIComponent(String(asset||''))+'.png'}
function txMaskStyle(asset){let u=txAssetUrl(asset);return `-webkit-mask-image:url("${u}");mask-image:url("${u}")`}
function txEscape(v){return typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c))}
function txToast(msg,bad=false){if(typeof toast==='function')toast(msg,bad);else console[bad?'error':'log'](msg)}

function txHideLegacyTransmission(){
  document.querySelector('#trans')?.classList.add('hidden');
  document.querySelectorAll('[data-mode="transmission"]').forEach(x=>x.classList.add('hidden'));
}

function txMasterHost(){return document.querySelector('#masterApp')||document.querySelector('#master')||document.querySelector('main .wrap')||document.querySelector('main')||document.body}

function txMasterMarkup(){return `<section id="txmaster" class="card tx-master">
  <div class="tx-master-head">
    <div class="tx-master-title"><div class="k">MASTER // TRANSMISSÃO</div><h2>LINGUAGEM DOS SINAIS</h2><p class="mut">Selecione um símbolo da referência alheia, determine quem irá recebê-lo e por quanto tempo. O significado abaixo existe apenas no seu console.</p></div>
    <div class="tx-source-note">REFERÊNCIAS // ALFABETO DO ESTRANGEIRO + AGLOMERADO DE TRADUÇÕES</div>
  </div>
  <div class="tx-layout">
    <div class="tx-library">
      <div class="tx-toolbar"><div class="tx-tabs"><button id="txtabalpha" class="btn tx-tab on" onclick="txSetTab('alphabet')">ALFABETO / NÚMEROS</button><button id="txtabconcept" class="btn tx-tab" onclick="txSetTab('concept')">CONCEITOS</button></div><input id="txsearch" class="tx-search" placeholder="Buscar letra, conceito ou significado..." oninput="txSetSearch(this.value)"></div>
      <div id="txgrid" class="tx-grid"><div class="tx-empty">CARREGANDO CATÁLOGO...</div></div>
    </div>
    <aside class="tx-console">
      <div class="k">SINAL SELECIONADO</div>
      <div class="tx-preview-wrap"><div id="txpreview" class="tx-preview"></div></div>
      <div id="txselectedmeta" class="tx-selected-meta"><b>Selecione um símbolo</b><span>O significado ficará visível somente aqui.</span></div>
      <span class="tx-field-label">DESTINATÁRIOS</span>
      <div class="tx-targets">
        <label class="tx-target"><input id="txtargetall" type="checkbox" checked onchange="txTargetAll(this.checked)"><b>TODOS OS PERFIS</b></label>
        ${TX_CREW.map(([id,n])=>`<label class="tx-target"><input class="txtargetcrew" value="${id}" type="checkbox" onchange="txCrewTargetChanged()"><span>${n}</span></label>`).join('')}
      </div>
      <span class="tx-field-label">TEMPO DE EXIBIÇÃO</span>
      <div class="tx-duration-row"><input id="txdurationrange" type="range" min="1" max="120" value="6" oninput="txDurationSync(this.value,'range')"><input id="txduration" type="number" min="1" max="120" value="6" oninput="txDurationSync(this.value,'number')"></div>
      <div class="small mut" style="margin-top:5px">1–120 segundos. O tempo começa no momento do envio.</div>
      <button id="txsend" class="btn a tx-send" onclick="txMasterSend()">TRANSMITIR SÍMBOLO</button>
      <button class="btn r tx-stop" onclick="txStopAll()">INTERROMPER TRANSMISSÕES</button>
      <div class="tx-active"><div style="display:flex;justify-content:space-between;align-items:center"><div class="k">TRANSMISSÕES ATIVAS</div><span id="txactivecount" class="tx-count">0</span></div><div id="txactivelist"><div class="tx-empty">Nenhum sinal ativo.</div></div></div>
    </aside>
  </div>
</section>`}

function txEnsureMaster(){
  if(typeof MASTER==='undefined'||!MASTER)return;
  txHideLegacyTransmission();
  if(!document.querySelector('#txmaster')){
    let host=txMasterHost();
    host.insertAdjacentHTML('beforeend',txMasterMarkup());
    txMasterMounted=true;
    txRenderCatalog();
  }
  if(typeof pin!=='undefined'&&pin&&!txCatalog.length&&!txMasterBusy)txLoadCatalog();
}

async function txLoadCatalog(){
  if(typeof pin==='undefined'||!pin||txMasterBusy)return;
  txMasterBusy=true;
  try{
    txCatalog=await rpc('pani_master_transmission_catalog',{p_pin:pin})||[];
    txCatalog.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    if(!txSelected&&txCatalog.length)txSelected=txCatalog[0];
    txRenderCatalog();txRenderSelected();
    await txRefreshActive();
  }catch(e){console.error('transmission catalog',e);let g=document.querySelector('#txgrid');if(g)g.innerHTML='<div class="tx-empty">CATÁLOGO INDISPONÍVEL.</div>'}
  finally{txMasterBusy=false}
}

function txSetTab(tab){txTab=tab;document.querySelector('#txtabalpha')?.classList.toggle('on',tab==='alphabet');document.querySelector('#txtabconcept')?.classList.toggle('on',tab==='concept');txRenderCatalog()}
function txSetSearch(v){txSearch=String(v||'').trim().toLowerCase();txRenderCatalog()}
function txRenderCatalog(){
  let g=document.querySelector('#txgrid');if(!g)return;
  let group=txTab==='alphabet'?'alphabet':'concept';
  let rows=txCatalog.filter(s=>s.source_group===group).filter(s=>!txSearch||`${s.symbol_label||''} ${s.meaning||''}`.toLowerCase().includes(txSearch));
  if(!rows.length){g.innerHTML=`<div class="tx-empty">${txCatalog.length?'Nenhum símbolo corresponde ao filtro.':'CARREGANDO CATÁLOGO...'}</div>`;return}
  g.innerHTML=rows.map(s=>`<button class="tx-symbol ${txSelected?.symbol_key===s.symbol_key?'selected':''}" onclick="txSelectSymbol('${s.symbol_key}')"><div class="tx-glyph" style='${txMaskStyle(s.asset_key)}'></div><span class="tx-label">${txEscape(s.symbol_label)}</span><span class="tx-meaning">${txEscape(s.meaning)}</span></button>`).join('');
}
function txSelectSymbol(key){txSelected=txCatalog.find(s=>s.symbol_key===key)||null;txRenderCatalog();txRenderSelected()}
function txRenderSelected(){let p=document.querySelector('#txpreview'),m=document.querySelector('#txselectedmeta');if(!p||!m)return;if(!txSelected){p.style.webkitMaskImage='none';p.style.maskImage='none';m.innerHTML='<b>Selecione um símbolo</b><span>O significado ficará visível somente aqui.</span>';return}let u=`url("${txAssetUrl(txSelected.asset_key)}")`;p.style.webkitMaskImage=u;p.style.maskImage=u;m.innerHTML=`<b>${txEscape(txSelected.symbol_label)}</b><span>${txEscape(txSelected.meaning)}</span>`}
function txTargetAll(on){document.querySelectorAll('.txtargetcrew').forEach(x=>{x.checked=false;x.disabled=on})}
function txCrewTargetChanged(){let any=[...document.querySelectorAll('.txtargetcrew')].some(x=>x.checked);let a=document.querySelector('#txtargetall');if(a){a.checked=!any;a.disabled=false}document.querySelectorAll('.txtargetcrew').forEach(x=>x.disabled=false)}
function txDurationSync(v,source){v=Math.max(1,Math.min(120,Number(v)||1));let r=document.querySelector('#txdurationrange'),n=document.querySelector('#txduration');if(r&&source!=='range')r.value=v;if(n&&source!=='number')n.value=v}
function txTargets(){if(document.querySelector('#txtargetall')?.checked)return ['all'];return [...document.querySelectorAll('.txtargetcrew:checked')].map(x=>x.value)}

async function txMasterSend(){
  if(!txSelected)return txToast('Selecione um símbolo para transmitir.',true);
  let targets=txTargets();if(!targets.length)return txToast('Selecione ao menos um destinatário.',true);
  let duration=Math.max(1,Math.min(120,Number(document.querySelector('#txduration')?.value)||6));
  let b=document.querySelector('#txsend');if(b){b.disabled=true;b.textContent='TRANSMITINDO...'}
  try{
    await rpc('pani_master_transmission_dispatch',{p_pin:pin,p_symbol_key:txSelected.symbol_key,p_targets:targets,p_duration:duration});
    txToast(`TRANSMISSÃO ENVIADA // ${txSelected.symbol_label} // ${duration}s`);await txRefreshActive();
  }catch(e){console.error(e);txToast('Falha ao transmitir o símbolo.',true)}
  finally{if(b){b.disabled=false;b.textContent='TRANSMITIR SÍMBOLO'}}
}
async function txStopAll(){try{await rpc('pani_master_transmission_stop',{p_pin:pin,p_dispatch:null});txToast('Transmissões interrompidas.');await txRefreshActive()}catch(e){txToast('Falha ao interromper transmissões.',true)}}
async function txStopOne(id){try{await rpc('pani_master_transmission_stop',{p_pin:pin,p_dispatch:Number(id)});await txRefreshActive()}catch(e){txToast('Falha ao interromper o sinal.',true)}}
function txTargetText(r){if(r.target_mode==='all')return 'TODOS';let ids=r.target_crew||[];return ids.map(id=>TX_CREW.find(x=>x[0]===id)?.[1]||id).join(', ')}
async function txRefreshActive(){
  if(typeof MASTER==='undefined'||!MASTER||typeof pin==='undefined'||!pin)return;
  try{txActive=await rpc('pani_master_transmission_active',{p_pin:pin})||[];txRenderActive()}catch(e){console.error('active transmissions',e)}
}
function txRenderActive(){let box=document.querySelector('#txactivelist'),count=document.querySelector('#txactivecount');if(!box)return;if(count)count.textContent=String(txActive.length);if(!txActive.length){box.innerHTML='<div class="tx-empty">Nenhum sinal ativo.</div>';return}box.innerHTML=txActive.map(r=>`<div class="tx-active-item"><div class="tx-active-mini" style='${txMaskStyle(r.asset_key)}'></div><div><b>${txEscape(r.symbol_label)}</b><span>${txEscape(txTargetText(r))} // ${Math.ceil((r.remaining_ms||0)/1000)}s restantes</span></div><button class="btn r" onclick="txStopOne(${Number(r.dispatch_id)})">PARAR</button></div>`).join('')}

/* ===================== PLAYER ===================== */
function txInjectPlayerOverlay(){if(document.querySelector('#txplayeroverlay'))return;document.body.insertAdjacentHTML('beforeend','<div id="txplayeroverlay" class="tx-player-overlay"><div id="txplayerglyph" class="tx-player-only-glyph"></div></div>')}
function txShowPlayerSignal(asset,remainingMs){
  txInjectPlayerOverlay();let o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');if(!o||!g)return;
  let u=`url("${txAssetUrl(asset)}")`;g.style.webkitMaskImage=u;g.style.maskImage=u;
  o.classList.add('show','glitch');clearTimeout(txOverlayTimer);txOverlayTimer=setTimeout(()=>txHidePlayerSignal(),Math.max(0,Number(remainingMs)||0));
}
function txHidePlayerSignal(){clearTimeout(txOverlayTimer);let o=document.querySelector('#txplayeroverlay');o?.classList.remove('show','glitch')}
async function txPollPlayer(){
  if(typeof MASTER==='undefined'||MASTER||typeof tok==='undefined'||!tok||typeof me==='undefined'||!me||document.hidden)return;
  try{
    let rows=await rpc('pani_crew_transmission_feed',{p_token:tok,p_after_id:txLastFeedId})||[];
    if(!Array.isArray(rows)||!rows.length)return;
    let max=Math.max(...rows.map(r=>Number(r.id)||0));if(max>txLastFeedId)txLastFeedId=max;
    let newest=rows.filter(r=>(Number(r.remaining_ms)||0)>0).sort((a,b)=>(Number(a.id)||0)-(Number(b.id)||0)).pop();
    if(newest)txShowPlayerSignal(newest.asset_key,newest.remaining_ms);
  }catch(e){console.error('transmission feed',e)}
}

function txBoot(){
  if(typeof MASTER!=='undefined'&&MASTER){txEnsureMaster();setInterval(()=>{txEnsureMaster();if(typeof pin!=='undefined'&&pin)txRefreshActive()},1000)}
  else{txInjectPlayerOverlay();setInterval(txPollPlayer,600);setTimeout(txPollPlayer,800)}
}
setTimeout(txBoot,0);
