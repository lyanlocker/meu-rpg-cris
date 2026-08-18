'use strict';
/* PANI W77 // ALFABETO PARANORMAL v18
   A-Z / 0-9 são SVG inline construídos a partir dos paths canônicos em
   window.PANI_ALPHA_PATHS. Não existe imagem externa, Data URI, WebP,
   request HTTP, atlas, Canvas ou máscara para o alfabeto.
   Os conceitos continuam no pipeline de máscara já estável. */

const TX_CONCEPT_ATLAS='./tx-concept-sprite.webp?v=concept-v8';

function txAssetMeta(asset){
  const m=/^([ac])(\d{2})$/.exec(String(asset||''));
  if(!m)return null;
  const alphabet=m[1]==='a';
  const index=Math.max(0,parseInt(m[2],10)-1);
  if(alphabet){if(index>=36)return null;return {alphabet:true,index};}
  const cols=6,rows=5,col=index%cols,row=Math.floor(index/cols);
  if(row>=rows)return null;
  return {alphabet:false,index,cols,rows,col,row};
}

function txConceptStyle(asset){
  const s=txAssetMeta(asset);if(!s||s.alphabet)return '';
  const x=s.cols>1?(s.col*100/(s.cols-1)):0,y=s.rows>1?(s.row*100/(s.rows-1)):0,u=`url("${TX_CONCEPT_ATLAS}")`;
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.cols*100}% ${s.rows*100}%;mask-size:${s.cols*100}% ${s.rows*100}%;-webkit-mask-position:${x}% ${y}%;mask-position:${x}% ${y}%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}
txMaskStyle=function(asset){return txConceptStyle(asset)};

function txAlphaPath(asset){return window.PANI_ALPHA_PATHS?.[asset]||''}
function txAlphaMarkup(asset,kind='card'){
  const path=txAlphaPath(asset);if(!path)return '';
  const cls=kind==='player'?'tx-alpha-svg tx-alpha-player-svg':kind==='preview'?'tx-alpha-svg tx-alpha-preview-svg':kind==='mini'?'tx-alpha-svg tx-alpha-mini-svg':'tx-alpha-svg tx-alpha-card-svg';
  return `<svg class="${cls}" viewBox="0 0 128 128" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet"><path d="${path}" fill="currentColor" fill-rule="evenodd"/></svg>`;
}

function txClearGlyph(el){
  if(!el)return;el.innerHTML='';el.classList.remove('tx-alpha-host');
  for(const p of ['background','background-image','background-size','background-position','background-repeat','background-color','filter','-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','-webkit-mask-position','mask-position','-webkit-mask-repeat','mask-repeat'])el.style.removeProperty(p);
}
function txApplyConcept(el,asset){
  txClearGlyph(el);const st=txConceptStyle(asset);if(!st)return;
  for(const part of st.split(';')){if(!part)continue;const i=part.indexOf(':');if(i<0)continue;el.style.setProperty(part.slice(0,i),part.slice(i+1))}
}
function txApplyAlpha(el,asset,kind='preview'){
  txClearGlyph(el);if(!txAlphaPath(asset))return;
  el.classList.add('tx-alpha-host');el.innerHTML=txAlphaMarkup(asset,kind);
}
function txRenderGlyphContainer(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(s?.alphabet)return `<div class="tx-glyph tx-alpha-host">${txAlphaMarkup(asset,kind)}</div>`;
  return `<div class="tx-glyph" style='${txConceptStyle(asset)}'></div>`;
}

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
    const meta=txAssetMeta(r.asset_key),glyph=meta?.alphabet?`<div class="tx-active-mini tx-alpha-host">${txAlphaMarkup(r.asset_key,'mini')}</div>`:`<div class="tx-active-mini" style='${txConceptStyle(r.asset_key)}'></div>`;
    return `<div class="tx-active-item">${glyph}<div><b>${txEscape(r.symbol_label)}</b><span>${txEscape(txTargetText(r))} // ${Math.ceil((r.remaining_ms||0)/1000)}s restantes</span></div><button class="btn r" onclick="txStopOne(${Number(r.dispatch_id)})">PARAR</button></div>`;
  }).join('');
};

txShowPlayerSignal=function(asset,remainingMs){
  txInjectPlayerOverlay();const o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');if(!o||!g)return;
  const meta=txAssetMeta(asset);if(meta?.alphabet)txApplyAlpha(g,asset,'player');else txApplyConcept(g,asset);
  o.classList.add('show','glitch');clearTimeout(txOverlayTimer);txOverlayTimer=setTimeout(()=>txHidePlayerSignal(),Math.max(0,Number(remainingMs)||0));
};

(function txAlphabetPreflight(){
  const map=window.PANI_ALPHA_PATHS||{},missing=[];
  for(let i=1;i<=36;i++){const k=`a${String(i).padStart(2,'0')}`;if(typeof map[k]!=='string'||map[k].length<20)missing.push(k)}
  if(missing.length)console.error('PANI TX ALPHABET v18 // missing vector glyphs',missing);
  else console.info('PANI TX ALPHABET v18 // 36 INLINE SVG GLYPHS READY');
})();
setTimeout(()=>{try{if(typeof MASTER!=='undefined'&&MASTER){txRenderCatalog();txRenderSelected();txRenderActive()}}catch(e){console.error('PANI alphabet renderer v18',e)}},25);
