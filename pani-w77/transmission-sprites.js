'use strict';
/* PANI W77 // GLIFOS CANÔNICOS v10
   Conceitos continuam usando máscara (pipeline já estável).
   A-Z/0-9 usam o atlas transparente como background recortado diretamente,
   evitando a falha de CSS mask observada no Chrome do mestre/jogadores. */

const TX_ALPHA_FILTER='brightness(0) saturate(100%) invert(83%) sepia(88%) saturate(1190%) hue-rotate(79deg) brightness(105%) contrast(103%) drop-shadow(0 0 8px rgba(45,255,111,.72))';

function txSpriteMeta(asset){
  const m=/^([ac])(\d{2})$/.exec(String(asset||''));
  if(!m)return null;
  const alphabet=m[1]==='a';
  const index=Math.max(0,parseInt(m[2],10)-1);
  const cols=alphabet?8:6, rows=5;
  const col=index%cols, row=Math.floor(index/cols);
  if(row>=rows)return null;
  const x=cols>1?(col*100/(cols-1)):0;
  const y=rows>1?(row*100/(rows-1)):0;
  return {
    alphabet,
    url:alphabet?'./tx-alphabet-sprite.webp?v=alpha-direct-v10':'./tx-concept-sprite.webp?v=concept-v8',
    size:`${cols*100}% ${rows*100}%`,
    pos:`${x}% ${y}%`
  };
}

function txSpriteStyle(asset){
  const s=txSpriteMeta(asset);if(!s)return '';
  const u=`url("${s.url}")`;
  if(s.alphabet){
    return `background-color:transparent!important;background-image:${u}!important;background-size:${s.size}!important;background-position:${s.pos}!important;background-repeat:no-repeat!important;-webkit-mask-image:none!important;mask-image:none!important;filter:${TX_ALPHA_FILTER}!important;`;
  }
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.size};mask-size:${s.size};-webkit-mask-position:${s.pos};mask-position:${s.pos};-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}

function txClearSprite(el){
  if(!el)return;
  for(const p of ['background-image','background-size','background-position','background-repeat','background-color','filter','-webkit-mask-image','mask-image','-webkit-mask-size','mask-size','-webkit-mask-position','mask-position','-webkit-mask-repeat','mask-repeat']){
    el.style.removeProperty(p);
  }
}

function txApplySprite(el,asset){
  if(!el)return;
  txClearSprite(el);
  const s=txSpriteMeta(asset);if(!s)return;
  const u=`url("${s.url}")`;
  if(s.alphabet){
    /* Direct background sprite: independent of CSS mask support. */
    el.style.setProperty('background-color','transparent','important');
    el.style.setProperty('background-image',u,'important');
    el.style.setProperty('background-size',s.size,'important');
    el.style.setProperty('background-position',s.pos,'important');
    el.style.setProperty('background-repeat','no-repeat','important');
    el.style.setProperty('-webkit-mask-image','none','important');
    el.style.setProperty('mask-image','none','important');
    el.style.setProperty('filter',TX_ALPHA_FILTER,'important');
    return;
  }
  /* Conceitos: renderer anterior preservado. */
  el.style.webkitMaskImage=u;el.style.maskImage=u;
  el.style.webkitMaskSize=s.size;el.style.maskSize=s.size;
  el.style.webkitMaskPosition=s.pos;el.style.maskPosition=s.pos;
  el.style.webkitMaskRepeat='no-repeat';el.style.maskRepeat='no-repeat';
}

/* Substitui a antiga montagem que apontava para PNGs inexistentes no Storage. */
txMaskStyle=function(asset){return txSpriteStyle(asset)};

txRenderSelected=function(){
  const p=document.querySelector('#txpreview'),m=document.querySelector('#txselectedmeta');
  if(!p||!m)return;
  if(!txSelected){
    txApplySprite(p,null);
    m.innerHTML='<b>Selecione um símbolo</b><span>O significado ficará visível somente aqui.</span>';
    return;
  }
  txApplySprite(p,txSelected.asset_key||txSelected.symbol_key);
  m.innerHTML=`<b>${txEscape(txSelected.symbol_label)}</b><span>${txEscape(txSelected.meaning)}</span>`;
};

txShowPlayerSignal=function(asset,remainingMs){
  txInjectPlayerOverlay();
  const o=document.querySelector('#txplayeroverlay'),g=document.querySelector('#txplayerglyph');
  if(!o||!g)return;
  txApplySprite(g,asset);
  o.classList.add('show','glitch');
  clearTimeout(txOverlayTimer);
  txOverlayTimer=setTimeout(()=>txHidePlayerSignal(),Math.max(0,Number(remainingMs)||0));
};

/* Re-render imediato se o console já tiver sido montado antes deste hotfix. */
setTimeout(()=>{
  try{
    if(typeof MASTER!=='undefined'&&MASTER){
      if(typeof txRenderCatalog==='function')txRenderCatalog();
      if(typeof txRenderSelected==='function')txRenderSelected();
      if(typeof txRenderActive==='function')txRenderActive();
    }
  }catch(e){console.error('PANI alphabet renderer v10',e)}
},25);
