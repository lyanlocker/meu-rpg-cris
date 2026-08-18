'use strict';
/* PANI W77 // GLIFOS CANÔNICOS v13
   CORREÇÃO EXCLUSIVA DO ALFABETO A-Z / 0-9.
   Conceitos permanecem no pipeline de máscara já estável.

   Pipeline alfanumérico redundante:
   1) SVG viewBox exibe imediatamente a célula de 160x160 do atlas 1280x800.
   2) Quando o atlas termina de carregar, Canvas recorta as 36 células em memória
      e converte cada uma em PNG independente. Cards/preview/player passam a usar
      essas imagens independentes, sem mask/background-position/sprite CSS. */

const TX_ALPHA_ATLAS='./tx-alphabet-sprite.webp?v=alphabet-v13';
const TX_CONCEPT_ATLAS='./tx-concept-sprite.webp?v=concept-v8';
const TX_ALPHA_W=1280,TX_ALPHA_H=800,TX_ALPHA_CELL=160;
let TX_ALPHA_CROPS=null;
let TX_ALPHA_PLAYER_STATE=null;

function txAssetMeta(asset){
  const m=/^([ac])(\d{2})$/.exec(String(asset||''));
  if(!m)return null;
  const alphabet=m[1]==='a';
  const index=Math.max(0,parseInt(m[2],10)-1);
  if(alphabet){if(index>=36)return null;return {alphabet:true,index,col:index%8,row:Math.floor(index/8)}}
  const cols=6,rows=5,col=index%cols,row=Math.floor(index/cols);
  if(row>=rows)return null;
  return {alphabet:false,index,cols,rows,col,row};
}

function txConceptStyle(asset){
  const s=txAssetMeta(asset);if(!s||s.alphabet)return '';
  const x=s.cols>1?(s.col*100/(s.cols-1)):0,y=s.rows>1?(s.row*100/(s.rows-1)):0,u=`url("${TX_CONCEPT_ATLAS}")`;
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.cols*100}% ${s.rows*100}%;mask-size:${s.cols*100}% ${s.rows*100}%;-webkit-mask-position:${x}% ${y}%;mask-position:${x}% ${y}%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}

function txAlphaMarkup(asset,kind='card'){
  const s=txAssetMeta(asset);if(!s||!s.alphabet)return '';
  const crop=TX_ALPHA_CROPS?.[asset];
  const cls=kind==='player'?'tx-alpha-independent tx-alpha-player-img':kind==='preview'?'tx-alpha-independent tx-alpha-preview-img':kind==='mini'?'tx-alpha-independent tx-alpha-mini-img':'tx-alpha-independent tx-alpha-card-img';
  if(crop)return `<img class="${cls}" src="${crop}" draggable="false" alt="" aria-hidden="true">`;
  const x=s.col*TX_ALPHA_CELL,y=s.row*TX_ALPHA_CELL;
  const svgcls=kind==='player'?'tx-alpha-svg tx-alpha-player-svg':kind==='preview'?'tx-alpha-svg tx-alpha-preview-svg':kind==='mini'?'tx-alpha-svg tx-alpha-mini-svg':'tx-alpha-svg tx-alpha-card-svg';
  return `<svg class="${svgcls}" viewBox="${x} ${y} ${TX_ALPHA_CELL} ${TX_ALPHA_CELL}" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"><image class="tx-alpha-svg-image" href="${TX_ALPHA_ATLAS}" x="0" y="0" width="${TX_ALPHA_W}" height="${TX_ALPHA_H}" preserveAspectRatio="none"></image></svg>`;
}

function txClearGlyph(el){
  if(!el)return;el.innerHTML='';el.classList.remove('tx-alpha-viewport');
  for(const p of ['background','background-image','background-size','background-position','background-repeat','background-color','filter','-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','-webkit-mask-position','mask-position','-webkit-mask-repeat','mask-repeat'])el.style.removeProperty(p);
}

function txApplyConcept(el,asset){
  txClearGlyph(el);const st=txConceptStyle(asset);if(!st)return;
  for(const part of st.split(';')){if(!part)continue;const i=part.indexOf(':');if(i<0)continue;el.style.setProperty(part.slice(0,i),part.slice(i+1))}
}

function txApplyAlpha(el,asset,kind='preview'){
  txClearGlyph(el);const s=txAssetMeta(asset);if(!s||!s.alphabet)return;
  el.classList.add('tx-alpha-viewport');el.innerHTML=txAlphaMarkup(asset,kind);
}

function txRenderGlyphContainer(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(s?.alphabet)return `<div class="tx-glyph tx-alpha-viewport">${txAlphaMarkup(asset,kind)}</div>`;
  return `<div class="tx-glyph" style='${txConceptStyle(asset)}'></div>`;
}

txMaskStyle=function(asset){return txConceptStyle(asset)};

txRenderCatalog=function(){
  const g=document.querySelector('#txgrid');if(!g)return;
  const group=txTab==='alphabet'?'alphabet':'concept';
  const rows=txCatalog.filter(s=>s.source_group===group).filter(s=>!txSearch||`${s.symbol_label||''} ${s.meaning||''}`.toLowerCase().includes(txSearch));
  if(!rows.length){g.innerHTML=`<div class="tx-empty">${txCatalog.length?'Nenhum símbolo corresponde ao filtro.':'CARREGANDO CATÁLOGO...'}</div>`;return}
  g.innerHTML=rows.map(s=>`<button class="tx-symbol ${txSelected?.symbol_key===s.symbol_key?'selected':''}" onclick="txSelectSymbol('${s.symbol_key}')">${txRenderGlyphContainer(s.asset_key||s.symbol_key,'card')}<span class="tx-label">${txEscape(s.symbol_label)}</span><span class="tx-meaning">${txEscape(s.meaning)}</span></button>`).join('');
};

txRenderSelected=function(){
  const p=document.querySelector('#txpreview'),m=document.querySelector('#txselectedmeta');if(!p||!m)return;
  if(!txSelected){txClearGlyph(p);m.innerHTML='<b>Selecione um símbolo</b><span>O significado ficará visível somente aqui.</span>';return}
  const asset=txSelected.asset_key||txSelected.symbol_key,meta=txAssetMeta(asset);
  if(meta?.alphabet)txApplyAlpha(p,asset,'preview');else txApplyConcept(p,asset);
  m.innerHTML=`<b>${txEscape(txSelected.symbol_label)}</b><span>${txEscape(txSelected.meaning)}</span>`;
};

txRenderActive=function(){
  const box=document.querySelector('#txactivelist'),count=document.querySelector('#txactivecount');if(!box)return;
  if(count)count.textContent=String(txActive.length);
  if(!txActive.length){box.innerHTML='<div class="tx-empty">Nenhum sinal ativo.</div>';return}
  box.innerHTML=txActive.map(r=>{
    const meta=txAssetMeta(r.asset_key),glyph=meta?.alphabet?`<div class="tx-active-mini tx-alpha-viewport">${txAlphaMarkup(r.asset_key,'mini')}</div>`:`<div class="tx-active-mini" style='${txConceptStyle(r.asset_key)}'></div>`;
    return `<div class="tx-active-item">${glyph}<div><b>${txEscape(r.symbol_label)}</b><span>${txEscape(txTargetText(r))} // ${Math.ceil((r.remaining_ms||0)/1000)}s restantes</span></div><button class="btn r" onclick="txStopOne(${Number(r.dispatch_id)})">PARAR</button></div>`;
  }).join('');
};

txShowPlayerSignal=function(asset,remainingMs){
  txInjectPlayerOverlay();const o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');if(!o||!g)return;
  const meta=txAssetMeta(asset);if(meta?.alphabet)txApplyAlpha(g,asset,'player');else txApplyConcept(g,asset);
  TX_ALPHA_PLAYER_STATE=meta?.alphabet?{asset,expires:Date.now()+Math.max(0,Number(remainingMs)||0)}:null;
  o.classList.add('show','glitch');clearTimeout(txOverlayTimer);txOverlayTimer=setTimeout(()=>{TX_ALPHA_PLAYER_STATE=null;txHidePlayerSignal()},Math.max(0,Number(remainingMs)||0));
};

function txBuildIndependentAlphabet(img){
  const out={};
  for(let i=0;i<36;i++){
    const c=document.createElement('canvas');c.width=TX_ALPHA_CELL;c.height=TX_ALPHA_CELL;
    const ctx=c.getContext('2d',{alpha:true});if(!ctx)throw new Error('canvas_context_unavailable');
    ctx.clearRect(0,0,TX_ALPHA_CELL,TX_ALPHA_CELL);
    const col=i%8,row=Math.floor(i/8);
    ctx.drawImage(img,col*TX_ALPHA_CELL,row*TX_ALPHA_CELL,TX_ALPHA_CELL,TX_ALPHA_CELL,0,0,TX_ALPHA_CELL,TX_ALPHA_CELL);
    out[`a${String(i+1).padStart(2,'0')}`]=c.toDataURL('image/png');
  }
  return out;
}

(function txPreflightAlphabet(){
  const img=new Image();
  img.onload=()=>{
    if(img.naturalWidth!==TX_ALPHA_W||img.naturalHeight!==TX_ALPHA_H){console.error(`PANI TX alphabet atlas INVALID SIZE // ${img.naturalWidth}x${img.naturalHeight}`);return}
    try{TX_ALPHA_CROPS=txBuildIndependentAlphabet(img);console.info('PANI TX alphabet independent crops OK // 36/36 // v13')}
    catch(e){console.error('PANI TX alphabet crop generation failed',e)}
    try{if(typeof MASTER!=='undefined'&&MASTER){txRenderCatalog();txRenderSelected();txRenderActive()}}catch(e){console.error('PANI TX alphabet master rerender',e)}
    try{
      if(TX_ALPHA_PLAYER_STATE&&TX_ALPHA_PLAYER_STATE.expires>Date.now()){
        const g=document.querySelector('#txplayerglyph');if(g)txApplyAlpha(g,TX_ALPHA_PLAYER_STATE.asset,'player');
      }
    }catch(e){console.error('PANI TX alphabet player rerender',e)}
  };
  img.onerror=()=>console.error('PANI TX alphabet atlas FAILED TO LOAD');img.src=TX_ALPHA_ATLAS;
})();

setTimeout(()=>{try{if(typeof MASTER!=='undefined'&&MASTER){txRenderCatalog();txRenderSelected();txRenderActive()}}catch(e){console.error('PANI alphabet renderer v13',e)}},25);
