import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const calls=[];
const sandbox={
  console,MASTER:false,tok:'qa-token',pin:'',me:{display_name:'QA',module:'gen'},view:'containment',
  localStorage:{getItem:()=>null,setItem:()=>{}},matchMedia:()=>({matches:false}),
  setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
  document:{body:{classList:{toggle:()=>{},add:()=>{},remove:()=>{}},insertAdjacentHTML:()=>{}},querySelector:()=>null},
  $:()=>null,esc:v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),
  toast:()=>{},navRender:()=>{},rpc:async()=>{throw Error('RPC_NOT_MOCKED')},calls,rendered:'',
};
sandbox.window=sandbox;
sandbox.render=function(force=false){calls.push(force);sandbox.rendered=vm.runInContext('containmentPage()',context)};
const context=vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(new URL('./containment.js',import.meta.url),'utf8'),context);

const words=['ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO','CHAVE','TRAVA','SENHA','PORTA','ECO','LEMBRANÇA','SONHO','VESTÍGIO','MÓDULO','SETOR','CÂMARA','CORREDOR'];
const state={released:true,status:'active',active_event:'knowledge',event_status:{knowledge:'in_progress'},event:{phase:'groups',active_side:'PLAYERS',words,solved:[],solved_groups:[],coherence:4,vote_phase:'knowledge:g1'},modules_restored:[],saturation:0};
vm.runInContext(`containmentState=${JSON.stringify({released:true,joined:true,revision:1,player:{crew_id:'qa',display_name:'QA',role:'spectator'},players:[{crew_id:'qa',display_name:'QA',connected:true}],state})}`,context);
sandbox.render(true);
assert.match(sandbox.rendered,/0\/4 SELECIONADAS/);

for(const word of words.slice(0,4))vm.runInContext(`ctKnowledgeToggle(${JSON.stringify(word)})`,context);
assert.equal(calls.at(-1),true,'seleção local deve forçar renderização');
assert.match(sandbox.rendered,/4\/4 SELECIONADAS/);
assert.match(sandbox.rendered,/GRUPO PRONTO PARA ENVIO/);
assert.equal((sandbox.rendered.match(/aria-pressed="true"/g)||[]).length,4);
assert.equal((sandbox.rendered.match(/<i>✓<\/i>/g)||[]).length,4);
assert.doesNotMatch(sandbox.rendered,/ct-submit-group" disabled/);

vm.runInContext(`ctKnowledgeToggle('CHAVE')`,context);
assert.equal((sandbox.rendered.match(/aria-pressed="true"/g)||[]).length,4,'quinta palavra não pode exceder o limite');
vm.runInContext(`ctKnowledgeToggle('ARQUIVO')`,context);
assert.match(sandbox.rendered,/3\/4 SELECIONADAS/);
assert.match(sandbox.rendered,/ct-submit-group" disabled/);

const cases=[
  ['energy',{phase:'trail',active_side:'PLAYERS',position:0,pulse:2,overload:0,forks:[3,9,15],checkpoints:[6,13]},'TRILHA DE SOBRECARGA'],
  ['energy',{phase:'master_threat',active_side:'MASTER',position:2,pulse:2,overload:1,forks:[3,9,15],checkpoints:[6,13]},'MESTRE // ENTIDADE'],
  ['blood',{phase:'master_prepare',active_side:'MASTER',beat:1},'A ENTIDADE ESCOLHE O CORAÇÃO'],
  ['blood',{phase:'beats',active_side:'PLAYERS',beat:1,beat_seconds:15,stabilization:1,hemorrhage:0,readings:['A','B','C']},'HEMOPULSO'],
  ['death',{phase:'master_prepare',active_side:'MASTER',cycle:1},'A ENTIDADE PREPARA A MUTAÇÃO'],
  ['death',{phase:'cycles',active_side:'PLAYERS',cycle:1,changed_visuals:['lamp']},'CÂMERA 13'],
  ['death',{phase:'final',active_side:'PLAYERS',cycle:4},'MANTER CICLO'],
];
for(const [id,event,needle] of cases){
  vm.runInContext(`containmentState.state.active_event=${JSON.stringify(id)};containmentState.state.event=${JSON.stringify(event)};containmentState.player.role='spectator'`,context);
  sandbox.render(true);assert.ok(sandbox.rendered.includes(needle),`${id}/${event.phase} não renderizou`);
}

console.log('PANI containment UI interaction QA PASS');
