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
  ['energy',{phase:'race',active_side:'PLAYERS',control_mode:'team',player_position:3,master_position:2,pulse:2,master_pulse:4,overload:0,forks:[3,9,15],checkpoints:[6,13]},'CORRIDA DE SOBRECARGA'],
  ['energy',{phase:'master_threat',active_side:'MASTER',control_mode:'operator',player_position:7,master_position:5,pulse:2,master_pulse:3,overload:1,forks:[3,9,15],checkpoints:[6,13]},'MESTRE // CRIATURA'],
  ['energy',{phase:'finished',active_side:'MASTER',winner:'MASTER',control_mode:'team',player_position:15,master_position:19,pulse:2,master_pulse:4,overload:2},'A CRIATURA ALCANÇOU A CONTENÇÃO'],
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

vm.runInContext(`containmentState.state.active_event='energy';containmentState.state.event=${JSON.stringify({phase:'race',active_side:'PLAYERS',control_mode:'team',player_position:3,master_position:2,pulse:2,master_pulse:4,overload:0,forks:[3,9,15],checkpoints:[6,13]})};containmentState.player.role='spectator'`,context);
sandbox.render(true);
assert.equal((sandbox.rendered.match(/class="ct-duel-cell/g)||[]).length,20,'Energia deve renderizar exatamente 20 casas');
assert.equal((sandbox.rendered.match(/ct-racer team/g)||[]).length,1,'a peça da Equipe deve aparecer');
assert.equal((sandbox.rendered.match(/ct-racer creature/g)||[]).length,1,'a peça da Criatura deve aparecer');
assert.match(sandbox.rendered,/EQUIPE INTEIRA/);
assert.match(sandbox.rendered,/PULSO EQUIPE/);
assert.match(sandbox.rendered,/PULSO CRIATURA/);
assert.doesNotMatch(sandbox.rendered,/ct-energy-path/,'a trilha antiga rotacionada não pode reaparecer');

vm.runInContext(`containmentState.state.event=${JSON.stringify({phase:'finished',active_side:'PLAYERS',winner:'PLAYERS',control_mode:'team',player_position:19,master_position:14,pulse:3,master_pulse:2,overload:1})}`,context);
sandbox.render(true);
assert.match(sandbox.rendered,/CONTER ENERGIA/);
assert.match(sandbox.rendered,/A EQUIPE VENCEU A CORRIDA/);

vm.runInContext(`containmentMasterState={state:{active_event:'energy',event:${JSON.stringify({phase:'master_threat',active_side:'MASTER',control_mode:'operator',player_position:8,master_position:6,master_pulse:3})}},secret_state:{energy:{hand:['ANÁRQUICO','DIABO']}}}`,context);
const masterEnergy=vm.runInContext(`ctMasterSpecific('energy')`,context);
assert.equal((masterEnergy.match(/class="ct-duel-cell/g)||[]).length,20,'o Mestre deve ver o mesmo tabuleiro de 20 casas');
assert.match(masterEnergy,/SEU PULSO DE MOVIMENTO/);
assert.match(masterEnergy,/ANÁRQUICO/);
assert.match(masterEnergy,/PASSAR E MOVER/);

vm.runInContext(`containmentState.state.active_event='blood';containmentState.state.event=${JSON.stringify({phase:'beats',active_side:'PLAYERS',beat:2,beat_seconds:15,stabilization:2,hemorrhage:1,readings:['A estável','B oscilante','C crítica'],selected_valve:'B',vote_phase:'blood:beat2'})};containmentState.player.role='representative'`,context);
sandbox.render(true);
assert.match(sandbox.rendered,/HEMOPULSO/);
assert.equal((sandbox.rendered.match(/<button class="selected"/g)||[]).length,1,'Sangue deve destacar a válvula selecionada');
assert.match(sandbox.rendered,/CONFIRMAÇÃO|SELECIONADA/);

vm.runInContext(`containmentState.state.active_event='death';containmentState.state.event=${JSON.stringify({phase:'cycles',active_side:'PLAYERS',cycle:2,scene_kind:'alternate',changed_visuals:['lamp'],vote_phase:'death:c2'})};containmentState.player.role='witness'`,context);
sandbox.render(true);
assert.match(sandbox.rendered,/CÂMERA 13/);
assert.match(sandbox.rendered,/CONFIRMAÇÃO DA TESTEMUNHA/);
assert.equal((sandbox.rendered.match(/class="ct-room/g)||[]).length,2,'Morte deve renderizar memória e quadro atual');

vm.runInContext(`containmentState.state.event=${JSON.stringify({phase:'final',active_side:'PLAYERS',cycle:4})};containmentState.player.role='spectator'`,context);
sandbox.render(true);
assert.match(sandbox.rendered,/MANTER CICLO/);
assert.match(sandbox.rendered,/cthold/);

vm.runInContext(`containmentMasterState={state:{active_event:'blood',event:{phase:'master_prepare',active_side:'MASTER',beat:2}},secret_state:{blood:{answer_locked:false,choices:[{answer:'A'},{answer:'B'},{answer:'C'}]}}}`,context);
const masterBlood=vm.runInContext(`ctMasterSpecific('blood')`,context);
assert.equal((masterBlood.match(/DESAFIO/g)||[]).length,3,'Mestre deve receber três desafios de Sangue');
vm.runInContext(`containmentMasterState={state:{active_event:'death',event:{phase:'master_prepare',active_side:'MASTER',cycle:2}},secret_state:{death:{choices:[{answer:'lamp'},{answer:'clock'},{answer:'door'}]}}}`,context);
const masterDeath=vm.runInContext(`ctMasterSpecific('death')`,context);
assert.equal((masterDeath.match(/ALTERAR/g)||[]).length,3,'Mestre deve receber três mutações de Morte');

const css=fs.readFileSync(new URL('./containment.css',import.meta.url),'utf8');
for(const required of ('.ct-duel-board .ct-duel-track .ct-racer.team .ct-racer.creature .ct-energy-turnbar @media(max-width:680px)').split(' '))assert.ok(css.includes(required),`CSS ausente: ${required}`);
assert.match(css,/\.ct-energy-duel\{display:block;grid-template-columns:none/,'a arena deve neutralizar a classe global .energy');

console.log('PANI containment UI interaction QA PASS');
