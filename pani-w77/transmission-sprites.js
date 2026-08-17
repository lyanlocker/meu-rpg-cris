'use strict';
/* PANI W77 // GLIFOS CANÔNICOS v11
   CORREÇÃO EXCLUSIVA DO ALFABETO A-Z / 0-9.
   Conceitos continuam no pipeline de máscara já estável.
   Alfabeto usa <img> real do atlas dentro de viewport recortada:
   sem mask, sem background-position, sem canvas. */

const TX_ALPHA_ATLAS='./tx-alphabet-sprite.webp?v=alpha-img-v11';
const TX_CONCEPT_ATLAS='./tx-concept-sprite.webp?v=concept-v8';
const TX_ALPHA_FILTER='brightness(0) saturate(100%) invert(83%) sepia(88%) saturate(1190%) hue-rotate(79deg) brightness(105%) contrast(103%) drop-shadow(0 0 8px rgba(45,255,111,.72))';

function txAssetMeta(asset){
  const m=/^([ac])(\d{2})$/.exec(String(asset||''));
  if(!m)return null;
  const alphabet=m[1]==='a';
  const index=Math.max(0,parseInt(m[2],10)-1);
  const cols=alphabet?8:6,rows=5;
  const col=index%cols,row=Math.floor(index/cols);
  if(row>=rows)return null;
  return {alphabet,index,cols,rows,col,row};
}

function txConceptStyle(asset){
  const s=txAssetMeta(asset);
  if(!s||s.alphabet)return '';
  const x=s.cols>1?(s.col*100/(s.cols-1)):0;
  const y=s.rows>1?(s.row*100/(s.rows-1)):0;
  const u=`url("${TX_CONCEPT_ATLAS}")`;
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.cols*100}% ${s.rows*100}%;mask-size:${s.cols*100}% ${s.rows*100}%;-webkit-mask-position:${x}% ${y}%;mask-position:${x}% ${y}%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}

function txAlphaMarkup(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(!s||!s.alphabet)return '';
  const cls=kind==='player'?'tx-alpha-atlas tx-alpha-player-img':kind==='preview'?'tx-alpha-atlas tx-alpha-preview-img':kind==='mini'?'tx-alpha-atlas tx-alpha-mini-img':'tx-alpha-atlas tx-alpha-card-img';
  return `<img class="${cls}" src="${TX_ALPHA_ATLAS}" draggable="false" alt="" aria-hidden="true" style="width:${s.cols*100}%;height:${s.rows*100}%;left:-${s.col*100}%;top:-${s.row*100}%">`;
}

function txClearGlyph(el){
  if(!el)return;
  el.innerHTML='';
  el.classList.remove('tx-alpha-viewport');
  for(const p of ['background','background-image','background-size','background-position','background-repeat','background-color','filter','-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','-webkit-mask-position','mask-position','-webkit-mask-repeat','mask-repeat']){
    el.style.removeProperty(p);
  }
}

function txApplyConcept(el,asset){
  txClearGlyph(el);
  const st=txConceptStyle(asset);
  if(!st)return;
  for(const part of st.split(';')){
    if(!part)continue;
    const i=part.indexOf(':');
    if(i<0)continue;
    el.style.setProperty(part.slice(0,i),part.slice(i+1));
  }
}

function txApplyAlpha(el,asset,kind='preview'){
  txClearGlyph(el);
  const s=txAssetMeta(asset);
  if(!s||!s.alphabet)return;
  el.classList.add('tx-alpha-viewport');
  el.innerHTML=txAlphaMarkup(asset,kind);
}

function txRenderGlyphContainer(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(s?.alphabet)return `<div class="tx-glyph tx-alpha-viewport">${txAlphaMarkup(asset,kind)}</div>`;
  return `<div class="tx-glyph" style='${txConceptStyle(asset)}'></div>`;
}

/* Compatibilidade: transmission.js ainda chama txMaskStyle em alguns trechos.
   Para conceitos mantemos a máscara. Alfabeto é renderizado pelos overrides abaixo. */
txMaskStyle=function(asset){return txConceptStyle(asset)};

/* ===================== MASTER: CATÁLOGO ===================== */
txRenderCatalog=function(){
  const g=document.querySelector('#txgrid');if(!g)return;
  const group=txTab==='alphabet'?'alphabet':'concept';
  const rows=txCatalog.filter(s=>s.source_group===group).filter(s=>!txSearch||`${s.symbol_label||''} ${s.meaning||''}`.toLowerCase().includes(txSearch));
  if(!rows.length){
    g.innerHTML=`<div class="tx-empty">${txCatalog.length?'Nenhum símbolo corresponde ao filtro.':'CARREGANDO CATÁLOGO...'}</div>`;
    return;
  }
  g.innerHTML=rows.map(s=>`<button class="tx-symbol ${txSelected?.symbol_key===s.symbol_key?'selected':''}" onclick="txSelectSymbol('${s.symbol_key}')">${txRenderGlyphContainer(s.asset_key||s.symbol_key,'card')}<span class="tx-label">${txEscape(s.symbol_label)}</span><span class="tx-meaning">${txEscape(s.meaning)}</span></button>`).join('');
};

txRenderSelected=function(){
  const p=document.querySelector('#txpreview'),m=document.querySelector('#txselectedmeta');
  if(!p||!m)return;
  if(!txSelected){
    txClearGlyph(p);
    m.innerHTML='<b>Selecione um símbolo</b><span>O significado ficará visível somente aqui.</span>';
    return;
  }
  const asset=txSelected.asset_key||txSelected.symbol_key;
  const meta=txAssetMeta(asset);
  if(meta?.alphabet)txApplyAlpha(p,asset,'preview');else txApplyConcept(p,asset);
  m.innerHTML=`<b>${txEscape(txSelected.symbol_label)}</b><span>${txEscape(txSelected.meaning)}</span>`;
};

txRenderActive=function(){
  const box=document.querySelector('#txactivelist'),count=document.querySelector('#txactivecount');
  if(!box)return;
  if(count)count.textContent=String(txActive.length);
  if(!txActive.length){box.innerHTML='<div class="tx-empty">Nenhum sinal ativo.</div>';return}
  box.innerHTML=txActive.map(r=>{
    const meta=txAssetMeta(r.asset_key);
    const glyph=meta?.alphabet
      ? `<div class="tx-active-mini tx-alpha-viewport">${txAlphaMarkup(r.asset_key,'mini')}</div>`
      : `<div class="tx-active-mini" style='${txConceptStyle(r.asset_key)}'></div>`;
    return `<div class="tx-active-item">${glyph}<div><b>${txEscape(r.symbol_label)}</b><span>${txEscape(txTargetText(r))} // ${Math.ceil((r.remaining_ms||0)/1000)}s restantes</span></div><button class="btn r" onclick="txStopOne(${Number(r.dispatch_id)})">PARAR</button></div>`;
  }).join('');
};

/* ===================== PLAYER ===================== */
txShowPlayerSignal=function(asset,remainingMs){
  txInjectPlayerOverlay();
  const o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');
  if(!o||!g)return;
  const meta=txAssetMeta(asset);
  if(meta?.alphabet)txApplyAlpha(g,asset,'player');else txApplyConcept(g,asset);
  o.classList.add('show','glitch');
  clearTimeout(txOverlayTimer);
  txOverlayTimer=setTimeout(()=>txHidePlayerSignal(),Math.max(0,Number(remainingMs)||0));
};

/* Diagnóstico silencioso: se o atlas alfanumérico falhar, o console mostra a causa.
   Não vaza tradução para o jogador. */
(function txPreflightAlphabet(){
  const img=new Image();
  img.onload=()=>console.info(`PANI TX alphabet atlas OK // ${img.naturalWidth}x${img.naturalHeight}`);
  img.onerror=()=>console.error('PANI TX alphabet atlas FAILED TO LOAD');
  img.src=TX_ALPHA_ATLAS;
})();

/* Re-render se o console já foi montado antes deste módulo. */
setTimeout(()=>{
  try{
    if(typeof MASTER!=='undefined'&&MASTER){
      if(typeof txRenderCatalog==='function')txRenderCatalog();
      if(typeof txRenderSelected==='function')txRenderSelected();
      if(typeof txRenderActive==='function')txRenderActive();
    }
  }catch(e){console.error('PANI alphabet renderer v11',e)}
},25);
