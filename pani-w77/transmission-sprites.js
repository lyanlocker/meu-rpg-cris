'use strict';
/* PANI W77 // ALFABETO PARANORMAL v14
   CORREÇÃO EXCLUSIVA A-Z / 0-9.

   Os 30 CONCEITOS continuam no renderer de máscara que já funciona.

   A-Z / 0-9 NÃO usam mais:
   - CSS mask
   - background-position
   - sprite CSS
   - SVG/viewBox
   - <img> recortada
   - URL externa para o atlas

   O build injeta window.PANI_ALPHA_ATLAS_DATA como DATA URI do atlas canônico.
   Este módulo decodifica o atlas uma única vez e copia pixels diretamente para
   <canvas> independentes em cards, preview, transmissões ativas e overlay player.
*/

const TX_CONCEPT_ATLAS='./tx-concept-sprite.webp?v=concept-v8';
const TX_ALPHA_W=1280;
const TX_ALPHA_H=800;
const TX_ALPHA_CELL=160;
const TX_ALPHA_COLS=8;
const TX_ALPHA_ROWS=5;
const TX_ALPHA_COLOR='#37ff78';

let TX_ALPHA_IMAGE=null;
let TX_ALPHA_READY=false;
let TX_ALPHA_ERROR='';
let TX_ALPHA_INIT_STARTED=false;

function txAssetMeta(asset){
  const m=/^([ac])(\d{2})$/.exec(String(asset||''));
  if(!m)return null;
  const alphabet=m[1]==='a';
  const index=Math.max(0,parseInt(m[2],10)-1);
  if(alphabet){
    if(index>=36)return null;
    return {alphabet:true,index,col:index%TX_ALPHA_COLS,row:Math.floor(index/TX_ALPHA_COLS)};
  }
  const cols=6,rows=5,col=index%cols,row=Math.floor(index/cols);
  if(row>=rows)return null;
  return {alphabet:false,index,cols,rows,col,row};
}

/* ===================== CONCEITOS: NÃO ALTERAR ===================== */
function txConceptStyle(asset){
  const s=txAssetMeta(asset);
  if(!s||s.alphabet)return '';
  const x=s.cols>1?(s.col*100/(s.cols-1)):0;
  const y=s.rows>1?(s.row*100/(s.rows-1)):0;
  const u=`url("${TX_CONCEPT_ATLAS}")`;
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.cols*100}% ${s.rows*100}%;mask-size:${s.cols*100}% ${s.rows*100}%;-webkit-mask-position:${x}% ${y}%;mask-position:${x}% ${y}%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}

txMaskStyle=function(asset){return txConceptStyle(asset)};

/* ===================== ALFABETO: CANVAS ===================== */
function txAlphaCanvasMarkup(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(!s||!s.alphabet)return '';
  const cls=kind==='player'?'tx-alpha-canvas tx-alpha-player-canvas':kind==='preview'?'tx-alpha-canvas tx-alpha-preview-canvas':kind==='mini'?'tx-alpha-canvas tx-alpha-mini-canvas':'tx-alpha-canvas tx-alpha-card-canvas';
  return `<canvas class="${cls}" data-alpha="${asset}" aria-hidden="true"></canvas>`;
}

function txAlphaCssSize(canvas){
  const r=canvas.getBoundingClientRect();
  const w=Math.max(1,Math.round(r.width||canvas.clientWidth||78));
  const h=Math.max(1,Math.round(r.height||canvas.clientHeight||78));
  return {w,h};
}

function txAlphaPaint(canvas){
  if(!canvas||canvas.tagName!=='CANVAS')return false;
  const meta=txAssetMeta(canvas.dataset.alpha);
  if(!meta?.alphabet)return false;
  const {w,h}=txAlphaCssSize(canvas);
  const dpr=Math.min(2,Math.max(1,Number(window.devicePixelRatio)||1));
  const pw=Math.max(1,Math.round(w*dpr)),ph=Math.max(1,Math.round(h*dpr));
  if(canvas.width!==pw)canvas.width=pw;
  if(canvas.height!==ph)canvas.height=ph;
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return false;
  ctx.clearRect(0,0,pw,ph);

  if(TX_ALPHA_ERROR){
    /* Master nunca fica com um espaço silenciosamente vazio se algo falhar. */
    ctx.fillStyle='#ff6170';ctx.font=`${Math.max(12,Math.floor(pw*.14))}px monospace`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('GLYPH ERROR',pw/2,ph/2);return false;
  }
  if(!TX_ALPHA_READY||!TX_ALPHA_IMAGE)return false;

  const sx=meta.col*TX_ALPHA_CELL,sy=meta.row*TX_ALPHA_CELL;
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(TX_ALPHA_IMAGE,sx,sy,TX_ALPHA_CELL,TX_ALPHA_CELL,0,0,pw,ph);

  /* O atlas é transparente com desenho claro. Recolore preservando o alpha. */
  ctx.globalCompositeOperation='source-in';
  ctx.fillStyle=TX_ALPHA_COLOR;
  ctx.fillRect(0,0,pw,ph);
  ctx.globalCompositeOperation='source-over';
  return true;
}

function txAlphaPaintAll(root=document){
  const canvases=[...root.querySelectorAll('canvas[data-alpha]')];
  canvases.forEach(txAlphaPaint);
  return canvases.length;
}

function txAlphaSchedule(root=document){
  requestAnimationFrame(()=>requestAnimationFrame(()=>txAlphaPaintAll(root)));
}

function txAlphaValidateImage(img){
  if(img.naturalWidth!==TX_ALPHA_W||img.naturalHeight!==TX_ALPHA_H){
    return `atlas_size_${img.naturalWidth}x${img.naturalHeight}`;
  }
  /* Confirma que A, U e 0 possuem pixels não transparentes no atlas. */
  try{
    const c=document.createElement('canvas');c.width=TX_ALPHA_CELL;c.height=TX_ALPHA_CELL;
    const ctx=c.getContext('2d',{willReadFrequently:true});
    if(!ctx)return 'canvas_context_unavailable';
    for(const idx of [0,20,35]){
      ctx.clearRect(0,0,TX_ALPHA_CELL,TX_ALPHA_CELL);
      const col=idx%TX_ALPHA_COLS,row=Math.floor(idx/TX_ALPHA_COLS);
      ctx.drawImage(img,col*TX_ALPHA_CELL,row*TX_ALPHA_CELL,TX_ALPHA_CELL,TX_ALPHA_CELL,0,0,TX_ALPHA_CELL,TX_ALPHA_CELL);
      const data=ctx.getImageData(0,0,TX_ALPHA_CELL,TX_ALPHA_CELL).data;
      let opaque=0;
      for(let i=3;i<data.length;i+=4)if(data[i]>24){opaque++;if(opaque>24)break}
      if(opaque<=24)return `empty_cell_a${String(idx+1).padStart(2,'0')}`;
    }
  }catch(e){return `atlas_probe_${e?.name||'error'}`}
  return '';
}

function txAlphaInit(){
  if(TX_ALPHA_INIT_STARTED)return;
  TX_ALPHA_INIT_STARTED=true;
  const src=window.PANI_ALPHA_ATLAS_DATA;
  if(typeof src!=='string'||!src.startsWith('data:image/webp;base64,')){
    TX_ALPHA_ERROR='atlas_data_missing';
    console.error('PANI TX ALPHABET v14 // atlas data missing');
    txAlphaSchedule();return;
  }
  const img=new Image();
  img.decoding='sync';
  img.onload=()=>{
    const err=txAlphaValidateImage(img);
    if(err){TX_ALPHA_ERROR=err;console.error('PANI TX ALPHABET v14 // validation failed:',err);txAlphaSchedule();return}
    TX_ALPHA_IMAGE=img;TX_ALPHA_READY=true;TX_ALPHA_ERROR='';
    console.info('PANI TX ALPHABET v14 // CANVAS READY // 36 glyphs');
    txAlphaSchedule();
    try{if(typeof MASTER!=='undefined'&&MASTER){txRenderCatalog();txRenderSelected();txRenderActive();txAlphaSchedule()}}catch(e){console.error('PANI TX alphabet master refresh',e)}
  };
  img.onerror=()=>{TX_ALPHA_ERROR='atlas_decode_failed';console.error('PANI TX ALPHABET v14 // atlas decode failed');txAlphaSchedule()};
  img.src=src;
}

function txClearGlyph(el){
  if(!el)return;
  el.innerHTML='';
  el.classList.remove('tx-alpha-host');
  for(const p of ['background','background-image','background-size','background-position','background-repeat','background-color','filter','-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','-webkit-mask-position','mask-position','-webkit-mask-repeat','mask-repeat'])el.style.removeProperty(p);
}

function txApplyConcept(el,asset){
  txClearGlyph(el);
  const st=txConceptStyle(asset);if(!st)return;
  for(const part of st.split(';')){if(!part)continue;const i=part.indexOf(':');if(i<0)continue;el.style.setProperty(part.slice(0,i),part.slice(i+1))}
}

function txApplyAlpha(el,asset,kind='preview'){
  txClearGlyph(el);
  const m=txAssetMeta(asset);if(!m?.alphabet)return;
  el.classList.add('tx-alpha-host');
  el.innerHTML=txAlphaCanvasMarkup(asset,kind);
  txAlphaSchedule(el);
}

function txRenderGlyphContainer(asset,kind='card'){
  const s=txAssetMeta(asset);
  if(s?.alphabet)return `<div class="tx-glyph tx-alpha-host">${txAlphaCanvasMarkup(asset,kind)}</div>`;
  return `<div class="tx-glyph" style='${txConceptStyle(asset)}'></div>`;
}

/* ===================== MASTER OVERRIDES ===================== */
txRenderCatalog=function(){
  const g=document.querySelector('#txgrid');if(!g)return;
  const group=txTab==='alphabet'?'alphabet':'concept';
  const rows=txCatalog.filter(s=>s.source_group===group).filter(s=>!txSearch||`${s.symbol_label||''} ${s.meaning||''}`.toLowerCase().includes(txSearch));
  if(!rows.length){g.innerHTML=`<div class="tx-empty">${txCatalog.length?'Nenhum símbolo corresponde ao filtro.':'CARREGANDO CATÁLOGO...'}</div>`;return}
  g.innerHTML=rows.map(s=>`<button class="tx-symbol ${txSelected?.symbol_key===s.symbol_key?'selected':''}" onclick="txSelectSymbol('${s.symbol_key}')">${txRenderGlyphContainer(s.asset_key||s.symbol_key,'card')}<span class="tx-label">${txEscape(s.symbol_label)}</span><span class="tx-meaning">${txEscape(s.meaning)}</span></button>`).join('');
  txAlphaSchedule(g);
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
    const meta=txAssetMeta(r.asset_key);
    const glyph=meta?.alphabet?`<div class="tx-active-mini tx-alpha-host">${txAlphaCanvasMarkup(r.asset_key,'mini')}</div>`:`<div class="tx-active-mini" style='${txConceptStyle(r.asset_key)}'></div>`;
    return `<div class="tx-active-item">${glyph}<div><b>${txEscape(r.symbol_label)}</b><span>${txEscape(txTargetText(r))} // ${Math.ceil((r.remaining_ms||0)/1000)}s restantes</span></div><button class="btn r" onclick="txStopOne(${Number(r.dispatch_id)})">PARAR</button></div>`;
  }).join('');
  txAlphaSchedule(box);
};

/* ===================== PLAYER OVERRIDE ===================== */
txShowPlayerSignal=function(asset,remainingMs){
  txInjectPlayerOverlay();
  const o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');if(!o||!g)return;
  const meta=txAssetMeta(asset);
  if(meta?.alphabet)txApplyAlpha(g,asset,'player');else txApplyConcept(g,asset);
  o.classList.add('show','glitch');
  clearTimeout(txOverlayTimer);
  txOverlayTimer=setTimeout(()=>txHidePlayerSignal(),Math.max(0,Number(remainingMs)||0));
};

/* Repaint em resize, inclusive se overlay estiver aberto. */
window.addEventListener('resize',()=>txAlphaSchedule(),{passive:true});

/* Inicia imediatamente; DATA URI é carregada antes deste arquivo pelo build. */
txAlphaInit();
setTimeout(()=>{try{if(typeof MASTER!=='undefined'&&MASTER){txRenderCatalog();txRenderSelected();txRenderActive();txAlphaSchedule()}}catch(e){console.error('PANI alphabet renderer v14',e)}},40);
