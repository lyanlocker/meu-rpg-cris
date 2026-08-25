'use strict';
/* Camada visual PANI // os glifos usam exclusivamente os paths canônicos do projeto. */
(function(){
  const SVG='http://www.w3.org/2000/svg',glyphs=['a03','a08','a14','a21','a27','a33','a36'];
  function mountGlyphRail(){
    let host=document.getElementById('pani-glyph-rail'),paths=window.PANI_ALPHA_PATHS;if(!host||!paths||host.childElementCount)return;
    glyphs.forEach((key,index)=>{let d=paths[key];if(!d)return;let svg=document.createElementNS(SVG,'svg'),path=document.createElementNS(SVG,'path');svg.setAttribute('viewBox','0 0 128 128');svg.setAttribute('class','pani-glyph');svg.setAttribute('focusable','false');svg.setAttribute('aria-hidden','true');svg.dataset.glyph=key;path.setAttribute('d',d);svg.appendChild(path);svg.style.opacity=String(.55+(index%3)*.18);host.appendChild(svg)});
  }
  function stampMode(){document.body.classList.add(MASTER?'pani-master-ui':'pani-crew-ui');document.documentElement.dataset.paniLayer='corrupted-update'}
  function pulse(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    document.body.classList.add('pani-glitch-pulse');setTimeout(()=>document.body.classList.remove('pani-glitch-pulse'),220);
  }
  function schedulePulse(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    setTimeout(()=>{if(!document.hidden)pulse();schedulePulse()},12000+Math.floor(Math.random()*9000));
  }
  function integrityTick(){
    let value=document.querySelector('.update-value');if(!value)return;let now=new Date(),fault=(now.getMinutes()*7+now.getSeconds())%13===0;value.textContent=fault?'PARTIAL // 8█.7%':'PARTIAL // 88.7%';
  }
  function boot(){stampMode();mountGlyphRail();integrityTick();setInterval(integrityTick,1000);schedulePulse();document.addEventListener('pani:render',()=>{document.querySelectorAll('.glitch-title').forEach(x=>{if(!x.dataset.text)x.dataset.text=x.textContent})})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
