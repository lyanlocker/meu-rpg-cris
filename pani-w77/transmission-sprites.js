'use strict';
/* PANI W77 // HOTFIX DE GLIFOS CANÔNICOS
   Usa dois atlas locais gerados diretamente das referências fornecidas pelo mestre.
   Nenhuma tradução é enviada ao terminal do jogador. */

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
    url:alphabet?'./tx-alphabet-sprite.webp':'./tx-concept-sprite.webp',
    size:`${cols*100}% ${rows*100}%`,
    pos:`${x}% ${y}%`
  };
}

function txSpriteStyle(asset){
  const s=txSpriteMeta(asset);if(!s)return '';
  const u=`url("${s.url}")`;
  return `-webkit-mask-image:${u};mask-image:${u};-webkit-mask-size:${s.size};mask-size:${s.size};-webkit-mask-position:${s.pos};mask-position:${s.pos};-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;`;
}

function txApplySprite(el,asset){
  if(!el)return;
  const s=txSpriteMeta(asset);
  if(!s){
    el.style.webkitMaskImage='none';el.style.maskImage='none';
    return;
  }
  const u=`url("${s.url}")`;
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
  }catch(e){console.error('PANI sprite hotfix',e)}
},25);
