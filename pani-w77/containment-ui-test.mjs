import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const calls=[];
const sandbox={
  console,MASTER:false,tok:'qa-token',pin:'',me:{display_name:'QA',module:'gen'},view:'containment',
  localStorage:{getItem:()=>null,setItem:()=>{}},matchMedia:()=>({matches:false}),
  setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
  document:{body:{classList:{toggle:()=>{}},insertAdjacentHTML:()=>{}},querySelector:()=>null,querySelectorAll:()=>[]},
  $:()=>null,esc:v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])),
  toast:()=>{},navRender:()=>{},rpc:async()=>{throw Error('RPC_NOT_MOCKED')},calls,rendered:''
};
sandbox.window=sandbox;
const context=vm.createContext(sandbox);
sandbox.render=function(force=false){calls.push(force);sandbox.rendered=vm.runInContext('containmentPage()',context)};
vm.runInContext(fs.readFileSync(new URL('./containment.js',import.meta.url),'utf8'),context);

const words=['ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO','CHAVE','TRAVA','SENHA','PORTA','ECO','LEMBRANÇA','SONHO','VESTÍGIO','MÓDULO','SETOR','CÂMARA','CORREDOR'];
const board=[
 {n:1,type:'start'},{n:2,type:'draw'},{n:3,type:'back',value:1},{n:4,type:'neutral'},{n:5,type:'overload',value:1},{n:6,type:'draw'},
 {n:7,type:'advance',value:1},{n:8,type:'neutral'},{n:9,type:'checkpoint'},{n:10,type:'draw'},{n:11,type:'back',value:2},{n:12,type:'roll_again'},
 {n:13,type:'neutral'},{n:14,type:'draw'},{n:15,type:'overload',value:1},{n:16,type:'advance',value:2},{n:17,type:'stabilize',value:1},{n:18,type:'checkpoint'},
 {n:19,type:'draw'},{n:20,type:'shortcut'},{n:21,type:'back',value:1},{n:22,type:'draw'},{n:23,type:'overload',value:1},{n:24,type:'finish'}
];
const base={released:true,status:'active',protocol_version:'containment_v2_0',modules_restored:[],saturation:0,event_status:{}};
function setState(id,event,role='spectator',extra={}){
  vm.runInContext(`containmentState=${JSON.stringify({released:true,joined:true,revision:1,my_vote:extra.my_vote||null,my_suggestion:extra.my_suggestion||[],suggestion_summary:extra.suggestion_summary||[],vote_summary:extra.vote_summary||{},player:{crew_id:'qa',display_name:'QA',role},players:[{crew_id:'qa',display_name:'QA',connected:true}],state:{...base,active_event:id,event_status:{[id]:'in_progress'},representative_id:role==='representative'?'qa':null,witness_id:role==='witness'?'qa':null,event}})}`,context);
  sandbox.render(true);
}

setState('knowledge',{phase:'PLAYER_ACTION',active_side:'PLAYERS',words,solved_groups:[],coherence:4,vote_phase:'knowledge:g1'},'representative',{suggestion_summary:[{words:words.slice(0,4),count:2,voters:['QA','ALIADA']}]});
assert.match(sandbox.rendered,/0\/4 SELECIONADAS/);
for(const word of words.slice(0,4))vm.runInContext(`ctKnowledgeToggle(${JSON.stringify(word)})`,context);
assert.match(sandbox.rendered,/4\/4 SELECIONADAS/);
assert.equal((sandbox.rendered.match(/aria-pressed="true"/g)||[]).length,4,'quatro palavras devem receber feedback visual imediato');
assert.match(sandbox.rendered,/ENVIAR GRUPO FINAL/);
assert.match(sandbox.rendered,/CONSENSO DA EQUIPE/);
vm.runInContext(`ctKnowledgeToggle('CHAVE')`,context);
assert.equal((sandbox.rendered.match(/aria-pressed="true"/g)||[]).length,4,'uma quinta palavra não pode entrar');

setState('energy',{phase:'PLAYER_ACTION',active_side:'PLAYERS',control_mode:'team',board,position:7,last_checkpoint:1,die:5,overload:2,turn:3,team_hand:['RECALIBRAR','ESCUDO PANI','SCAN DE ROTA'],last_effect:'Casa 7.'});
assert.equal((sandbox.rendered.match(/class="ct-board-cell/g)||[]).length,24,'Energia deve ter 24 casas');
assert.equal((sandbox.rendered.match(/ct-pawn/g)||[]).length,1,'Energia deve ter um único peão da equipe');
assert.doesNotMatch(sandbox.rendered,/CRIATURA.*\/(20|24)|ct-racer creature/,'não pode existir uma segunda peça de corrida');
assert.match(sandbox.rendered,/ROLAR O DADO/);
assert.match(sandbox.rendered,/ct-die-face d5/);
assert.equal((sandbox.rendered.match(/ct-team-hand/g)||[]).length,1);
assert.equal((sandbox.rendered.match(/SUPORTE PANI|Role novamente|Cancele a ameaça|Revele as próximas/g)||[]).length,3);

setState('energy',{phase:'PLAYER_REACTION',active_side:'PLAYERS',control_mode:'operator',board,position:11,last_checkpoint:9,die:4,overload:3,turn:4,team_hand:['ROTA SEGURA'],last_effect:'Recuar 2.'},'representative');
assert.match(sandbox.rendered,/ENCERRAR \/\/ PASSAR AO MESTRE/);
assert.doesNotMatch(sandbox.rendered,/ROLAR O DADO/);

setState('energy',{phase:'PLAYER_CHOICE',active_side:'PLAYERS',control_mode:'team',pending_choice:'backup',backup_offer:['ATALHO DE MANUTENCAO','REDE ESTAVEL'],board,position:11,last_checkpoint:9,die:4,overload:3,turn:4,team_hand:['ROTA SEGURA','DRENAR CARGA'],support_used:true,last_effect:'Backup.'});
assert.match(sandbox.rendered,/BACKUP LOCAL/);
assert.equal((sandbox.rendered.match(/energy_backup_choose/g)||[]).length,2,'Backup Local deve oferecer exatamente duas cartas');

setState('energy',{phase:'PLAYER_CHOICE',active_side:'PLAYERS',control_mode:'team',pending_choice:'discard',board,position:2,last_checkpoint:1,die:1,overload:0,turn:2,team_hand:['A','B','C','D'],last_effect:'Mão cheia.'});
assert.equal((sandbox.rendered.match(/energy_discard/g)||[]).length,4,'mão cheia deve permitir escolher uma das quatro cartas para descarte');

const challenge={title:'RITMO FRATURADO',target:[2,5,2,8,2,5,2],options:{A:[2,5,2,7,2,5,2],B:[2,5,2,8,2,5,2],C:[2,7,2,7,2,7,2]}};
setState('blood',{phase:'PLAYER_ACTION',active_side:'PLAYERS',round:2,hits:2,errors:1,challenge,display_order:['A','B','C'],vote_phase:'blood:r2'},'representative',{my_vote:'B',vote_summary:{A:1,B:2,C:0}});
assert.equal((sandbox.rendered.match(/ct-wave-option/g)||[]).length,3,'Sangue deve renderizar A/B/C');
assert.equal((sandbox.rendered.match(/class="ct-wave"/g)||[]).length,4,'Sangue deve exibir alvo mais três opções visuais');
assert.match(sandbox.rendered,/✓ VOTO REGISTRADO/);
assert.match(sandbox.rendered,/CONFIRMAR RESPOSTA/);
assert.match(sandbox.rendered,/data-ct-timer/,'Sangue deve exibir o cronômetro da rodada');

setState('death',{phase:'OBSERVE',active_side:'SYSTEM',cycle:1,scene_id:'lab',base_variant:'base'},'witness');
assert.equal((sandbox.rendered.match(/class="ct-room-v2/g)||[]).length,1,'Morte deve mostrar uma única cena');
assert.equal((sandbox.rendered.match(/class="ct-scene-object/g)||[]).length,17,'a cena deve ter 17 objetos reconhecíveis');
assert.equal((sandbox.rendered.match(/<button[^>]+ct-scene-object/g)||[]).length,0,'durante OBSERVE não pode existir botão de resposta');
assert.equal((sandbox.rendered.match(/role="img"/g)||[]).length,17,'durante OBSERVE os objetos são apenas elementos visuais acessíveis');
assert.doesNotMatch(sandbox.rendered,/MEMÓRIA BASE[\s\S]*RETORNO ATUAL/,'quadros simultâneos são proibidos');

setState('death',{phase:'VOTE',active_side:'PLAYERS',cycle:3,scene_id:'security',current_variant:'clipboard_marked',vote_phase:'death:c3'},'witness',{my_vote:'clipboard',vote_summary:{clipboard:2,crate:1}});
assert.equal((sandbox.rendered.match(/class="ct-room-v2/g)||[]).length,1);
assert.match(sandbox.rendered,/✓ REGISTRADO/);
assert.match(sandbox.rendered,/TESTEMUNHA \/\/ CONFIRMAR/);
assert.match(sandbox.rendered,/LISTA TEXTUAL DOS OBJETOS/);
assert.match(sandbox.rendered,/clipboard mutated clipboard_marked/);
assert.match(sandbox.rendered,/data-ct-timer/,'Morte deve exibir o estado temporal do ciclo');

vm.runInContext(`containmentMasterState=${JSON.stringify({state:{active_event:'energy',event:{phase:'MASTER_ACTION',active_side:'MASTER',control_mode:'team',board,position:12,last_checkpoint:9,overload:3}},secret_state:{energy:{master_hand:['ZUMBI DE SANGUE','ANARQUICO','DIABO']}},players:[]})}`,context);
let master=vm.runInContext(`ctMasterSpecific('energy')`,context);
assert.equal((master.match(/class="ct-board-cell/g)||[]).length,24,'Mestre deve ver o mesmo tabuleiro');
assert.match(master,/ZUMBI DE SANGUE/);assert.match(master,/PASSAR/);assert.doesNotMatch(master,/ct-racer creature/);

vm.runInContext(`containmentMasterState=${JSON.stringify({state:{active_event:'energy',event:{phase:'MASTER_CHOICE',active_side:'MASTER',control_mode:'team',board,position:12,last_checkpoint:9,overload:3,die_options:[2,6]}},secret_state:{energy:{master_hand:['ZUMBI DE SANGUE','ANARQUICO','DIABO']}},players:[]})}`,context);
master=vm.runInContext(`ctMasterSpecific('energy')`,context);
assert.equal((master.match(/energy_anarchic_choose/g)||[]).length,2,'Anárquico deve dar ao Mestre dois resultados server-side');
assert.match(master,/USAR RESULTADO 2/);assert.match(master,/USAR RESULTADO 6/);

vm.runInContext(`containmentMasterState=${JSON.stringify({state:{active_event:'blood',event:{phase:'MASTER_ACTION',active_side:'MASTER'}},secret_state:{blood:{choices:[{title:'A',target:[1],correct:'A'},{title:'B',target:[1],correct:'B'},{title:'C',target:[1],correct:'C'}]}}})}`,context);
master=vm.runInContext(`ctMasterSpecific('blood')`,context);assert.equal((master.match(/Resposta privada/g)||[]).length,3);
vm.runInContext(`containmentMasterState=${JSON.stringify({state:{active_event:'death',witness_id:'qa',event:{phase:'MASTER_ACTION',active_side:'MASTER',cycle:2}},secret_state:{death:{choices:[{label:'A',changed_object_id:'clock',scene_id:'lab'},{label:'B',changed_object_id:'door',scene_id:'lab'},{label:'C',changed_object_id:'sample',scene_id:'lab'}]}},players:[{crew_id:'qa',display_name:'QA',joined:true,connected:true}]})}`,context);
master=vm.runInContext(`ctMasterSpecific('death')`,context);assert.equal((master.match(/containmentMasterAction\('death_mutation'/g)||[]).length,3);

const js=fs.readFileSync(new URL('./containment.js',import.meta.url),'utf8');
for(const needle of ['pani_containment_crew_action_v2','pani_containment_master_action_v2','energy_roll','energy_backup_choose','energy_anarchic_choose','blood_confirm','death_confirm','knowledge_suggest'])assert.ok(js.includes(needle),needle);
const css=fs.readFileSync(new URL('./containment.css',import.meta.url),'utf8');
for(const needle of ['.ct-energy-board','.ct-die-face','.ct-room-v2','.ct-wave-option','@media(max-width:680px)','@media(prefers-reduced-motion:reduce)'])assert.ok(css.includes(needle),needle);
console.log('PANI containment v2 UI interaction QA PASS');
