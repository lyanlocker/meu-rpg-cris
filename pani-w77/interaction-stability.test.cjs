const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');

class FakeElement{
  constructor(tag='div',id=''){this.tagName=tag.toUpperCase();this.id=id;this.value='';this.checked=false;this.children=[];this.options=[];this.writes=0;this._innerHTML='';}
  contains(node){return this===node||this.children.includes(node)}
  matches(selector){return selector.split(',').some(x=>x.trim().startsWith(this.tagName.toLowerCase())||x.includes('contenteditable'))}
  set innerHTML(value){this._innerHTML=String(value);this.writes++;if(this.tagName==='SELECT')this.options=[...this._innerHTML.matchAll(/<option(?:\s+value=["']?([^"'\s>]+)["']?)?[^>]*>([^<]*)<\/option>/g)].map(m=>({value:m[1]??m[2]}));}
  get innerHTML(){return this._innerHTML}
}

const body=new FakeElement('body','body');
const view=new FakeElement('div','view');
const elements=new Map([['view',view]]);
const document={
  body,
  activeElement:body,
  querySelector(){return null},
  querySelectorAll(selector){return selector.startsWith('#view ')?[...elements.values()].filter(x=>x!==view):[]},
  getElementById(id){return elements.get(id)||null}
};
const context={URLSearchParams,location:{search:'',pathname:'/'},document,window:{},console,setTimeout,clearTimeout,setInterval(){return 1},clearInterval,CustomEvent:class{},performance:{now:()=>1000},Date};
vm.createContext(context);
const core=fs.readFileSync('pani-w77/core.js','utf8');
vm.runInContext(core+`\nthis.__coreTest={paniStableHtml,paniStableOptions,paniEditing,capDraft,putDraft};`,context);
const api=context.__coreTest;

const host=new FakeElement('div','host'),select=new FakeElement('select','choice');host.children.push(select);
assert.equal(api.paniStableHtml(host,'A','a'),true);
assert.equal(host.writes,1);
assert.equal(api.paniStableHtml(host,'A outra vez','a'),false,'snapshot igual não pode redesenhar');
document.activeElement=select;
assert.equal(api.paniStableHtml(host,'B','b'),false,'campo ativo deve bloquear atualização destrutiva');
assert.equal(host.writes,1);
document.activeElement=body;
assert.equal(api.paniStableHtml(host,'B','b'),true,'atualização pendente deve entrar após o foco sair');
assert.equal(host.writes,2);

select.value='2';
assert.equal(api.paniStableOptions(select,'<option value="1">UM</option><option value="2">DOIS</option>','2'),true);
assert.equal(select.value,'2','opção escolhida deve sobreviver à atualização legítima');
assert.equal(api.paniStableOptions(select,'<option value="1">UM</option><option value="2">DOIS</option>','2'),false,'opções idênticas não podem fechar o seletor');

const checkbox=new FakeElement('input','keep-check');checkbox.value='on';checkbox.checked=true;elements.set(checkbox.id,checkbox);
api.capDraft();checkbox.checked=false;checkbox.value='off';api.putDraft();
assert.equal(checkbox.checked,true,'checkbox deve ser restaurado');
assert.equal(checkbox.value,'on','valor de formulário deve ser restaurado');

const eco=fs.readFileSync('pani-w77/eco-w77.js','utf8');
const qa=fs.readFileSync('pani-w77/eco-w77-qa.html','utf8');
const qaPublic=qa.slice(qa.indexOf('function qaPublic'),qa.indexOf('function qaPaint'));
vm.runInContext(eco+'\n'+qaPublic+`\nthis.__ecoTest={page:function(id,p,mode){me={crew_id:id,display_name:ECO_NAMES[id]};ecoDraft={};ecoState={eligible:true,released:mode!=='standby',status:mode==='standby'?'dormant':mode,paused:false,coherence:42,locks:mode==='active'?2:5,globalPressure:1,revision:1,convergence:{state:'open',readyCount:3,windowEnd:new Date(Date.now()+11500).toISOString()},sixthLayer:{historicalLayers:6,activeAnchors:5,layer:'ENV'},crossClue:'IFF Ø-C',anchor:{crewId:id,anchorId:ECO_META[id].anchor.toLowerCase(),phase:p,stability:3,progress:(p-1)*25,publicState:qaPublic(id,p),publicLog:[],helpTokens:1,locked:mode!=='active',interference:{},revision:1,output:'ÂNCORA FIXADA'}};return ecoPage()}};`,context);
const phaseMarkers={gilbert:['gen-slots'],eklay:['ops-board','ops-nodes'],christian:['sec-map','sec-timeline'],willy:['med-console','med-traces'],aliya:['inv-board','inv-statements','inv-hypotheses','inv-constellation']};
for(const id of Object.keys(phaseMarkers))for(let phase=1;phase<=4;phase++){
  const html=context.__ecoTest.page(id,phase,'active');
  assert.match(html,new RegExp(`FASE ${phase}`),`${id} fase ${phase} não renderizou`);
  assert.ok(phaseMarkers[id].some(marker=>html.includes(marker)),`${id} fase ${phase} sem controle próprio`);
}
for(const id of Object.keys(phaseMarkers))assert.match(context.__ecoTest.page(id,4,'convergence'),/CONVERGÊNCIA/,`${id} sem convergência`);
assert.match(context.__ecoTest.page('aliya',4,'complete'),/5\/5/, 'tela final ausente');
assert.match(context.__ecoTest.page('gilbert',1,'standby'),/STANDBY/, 'standby ausente');

const sources={
  runtime:fs.readFileSync('pani-w77/runtime.js','utf8'),
  missionRuntime:fs.readFileSync('pani-w77/mission-runtime.js','utf8'),
  assistance:fs.readFileSync('pani-w77/assistance.js','utf8'),
  files:fs.readFileSync('pani-w77/files.js','utf8'),
  eco
};
assert.ok(!sources.runtime.includes('render(old!==fingerprint())'),'poll do jogador ainda força redesenho');
assert.ok(!sources.eco.includes('if(repaint||ecoMasterState)'),'painel ECO ainda redesenha sempre');
assert.ok(sources.eco.includes('ecoMasterPaintKey')&&sources.eco.includes('paniEditing(b)'),'painel ECO sem trava de edição');
assert.ok(sources.files.includes('pfCrewPaintKey')&&sources.files.includes("view==='files'&&pfCrewPaintKey!==key"),'Arquivos sem snapshot estável');
assert.ok(sources.files.includes("paniStableHtml($('#pfqueue')"),'fila do Mestre sem atualização estável');
assert.ok(sources.assistance.includes('paniStableOptions(s,html'),'Assistência ainda recria opções');
assert.ok(sources.missionRuntime.includes("paniEditing($('#view'))"),'Missão sem proteção durante edição');

console.log('PANI interaction stability OK // 20 PHASES // POLLING SAFE');
