begin;
do $test$
declare v jsonb;v2 jsonb;r bigint;sol jsonb;piece jsonb;i int;j int;rot int;n int;
begin
 update public.crew_access set token_hash=encode(extensions.digest('eco-test-'||crew_id,'sha256'),'hex') where crew_id in('gilbert','eklay','christian','willy','aliya','alice');
 perform pani_private.eco_reset(1,true);
 assert(select count(*) from pani_private.eco_anchor where session_id='W77-02')=5,'requires five anchors';
 assert not exists(select 1 from pani_private.eco_anchor where crew_id='alice'),'Alice became sixth anchor';
 assert not exists(
  select 1
  from pani_private.eco_seed_library seed,
       generate_series(1,cardinality(seed.sec_route)-1) edge_index
  where pani_private.eco_edge(seed.sec_route[edge_index],seed.sec_route[edge_index+1]) is null
 ),'a SEC seed contains an impossible edge';
 create or replace function public.pani_master_valid(p_pin text) returns boolean language sql stable security definer set search_path=pg_catalog as $$select p_pin='eco-master-test'$$;
 v:=public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');
 assert(select phase=2 and progress=25 and stability=3 and not locked from pani_private.eco_anchor where crew_id='willy'),'master did not solve exactly one MED phase';
 assert(select count(*) from pani_private.eco_anchor where crew_id<>'willy' and phase=1 and progress=0)=4,'master solve changed another anchor';
 assert(select public_log @> '[{"type":"master_solve"}]'::jsonb from pani_private.eco_anchor where crew_id='willy'),'master solve was not audited on anchor';
 begin perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"alice"}');assert false,'master solved an invalid anchor';exception when others then assert sqlerrm='invalid_anchor';end;
 perform public.pani_eco_master_action('eco-master-test','pause','{}');
 begin perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');assert false,'master solved phase while paused';exception when others then assert sqlerrm='solve_phase_unavailable';end;
 perform public.pani_eco_master_action('eco-master-test','resume','{}');
 perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');
 perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');
 perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');
 assert(select phase=4 and progress=100 and locked from pani_private.eco_anchor where crew_id='willy'),'fourth master solve did not lock MED';
 begin perform public.pani_eco_master_action('eco-master-test','solve_phase','{"crewId":"willy"}');assert false,'master solved a locked anchor';exception when others then assert sqlerrm='anchor_locked';end;
 v:=public.pani_eco_status('eco-test-alice');assert not(v->>'eligible')::boolean,'Alice must remain ineligible';
 v:=public.pani_eco_status('eco-test-gilbert');select revision into r from pani_private.eco_session where session_id='W77-02';v2:=public.pani_eco_status('eco-test-gilbert');assert(select revision from pani_private.eco_session where session_id='W77-02')=r,'heartbeat revision churn';assert(v->'anchor'->>'revision')=(v2->'anchor'->>'revision'),'anchor revision churn';
 begin perform public.pani_eco_status('invalid');assert false,'bad token accepted';exception when others then assert sqlerrm='unauthorized';end;
 for i in 1..8 loop perform public.pani_eco_input('eco-test-gilbert','gen_test','{"guess":["A1","A1","A1"]}');end loop;
 assert(select stability=3 and help_tokens=1 from pani_private.eco_anchor where crew_id='gilbert'),'recalibration failed';assert(select global_pressure from pani_private.eco_session where session_id='W77-02')=1,'pressure failed';
 perform pani_private.eco_reset(1,true);

 -- GEN: four phases, three independent readings and physical/description split.
 perform public.pani_eco_input('eco-test-gilbert','gen_test','{"guess":["A1","C3","NØ"]}');
 perform public.pani_eco_input('eco-test-gilbert','gen_test','{"guess":["B2","D4","A1","NØ"]}');
 for i in 1..3 loop perform public.pani_eco_input('eco-test-gilbert','gen_test','{"guess":["B2","D4","A1","NØ"]}');end loop;
 perform public.pani_eco_input('eco-test-gilbert','gen_suspect','{"verifier":"DESCRIÇÃO"}');
 assert(public.pani_eco_status('eco-test-gilbert')->'anchor'->>'phase')::int=4,'GEN reconnect lost phase';
 perform public.pani_eco_input('eco-test-gilbert','gen_fix','{"support":["B2","D4","A1","NØ"],"separateDescription":true}');

 -- OPS: placement, selection edits and rotations pass through the public API.
 perform public.pani_eco_input('eco-test-eklay','ops_place','{"cell":"0,1"}');
 perform public.pani_eco_input('eco-test-eklay','ops_move','{"cell":"0,1","target":"4,0"}');
 perform public.pani_eco_input('eco-test-eklay','ops_move','{"cell":"4,0","target":"0,1"}');
 perform public.pani_eco_input('eco-test-eklay','ops_rotate','{"cell":"0,1"}');
 perform public.pani_eco_input('eco-test-eklay','ops_remove','{"cell":"0,1"}');
 assert(select public_state->'returned'->>0='straight' from pani_private.eco_anchor where crew_id='eklay'),'OPS removal did not return the piece';
 for i in 1..3 loop
  select secret_state->'solution' into sol from pani_private.eco_anchor where crew_id='eklay';
  for piece in select value from jsonb_array_elements(sol) loop
   perform public.pani_eco_input('eco-test-eklay','ops_place',jsonb_build_object('cell',piece->>'cell'));rot:=coalesce((piece->>'rot')::int,0);
   if rot>0 then for j in 1..rot loop perform public.pani_eco_input('eco-test-eklay','ops_rotate',jsonb_build_object('cell',piece->>'cell'));end loop;end if;
  end loop;
  perform public.pani_eco_input('eco-test-eklay','ops_validate','{}');
  if i>1 then update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('flowStartedAt',now()-interval'30 seconds','flowCompleteAt',now()-interval'1 second') where crew_id='eklay';perform public.pani_eco_status('eco-test-eklay');end if;
 end loop;
 assert(select phase from pani_private.eco_anchor where crew_id='eklay')=4,'OPS did not reach phase 4';
 perform public.pani_eco_input('eco-test-eklay','ops_node','{"node":"A"}');perform public.pani_eco_input('eco-test-eklay','ops_node','{"node":"B"}');perform public.pani_eco_input('eco-test-eklay','ops_node','{"node":"C"}');

 -- SEC: calibration, hidden movement, invalidated path and blackbox.
 perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"SEC"}');
 perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"HUB"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"SEC"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"OPS"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"MED"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"INV"}');
 perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"HUB"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"SEC"}');perform public.pani_eco_input('eco-test-christian','sec_scan','{"sector":"OPS"}');perform public.pani_eco_input('eco-test-christian','sec_accuse_jump','{"index":2}');perform public.pani_eco_input('eco-test-christian','sec_blackbox','{"index":2}');

 -- MED: increasing pattern, two timed rounds, markers and raw signal.
 perform public.pani_eco_input('eco-test-willy','med_repeat','{"sequence":["pulse","resp","neural","tonus"]}');perform public.pani_eco_input('eco-test-willy','med_repeat','{"sequence":["pulse","resp","neural","tonus","pulse"]}');perform public.pani_eco_input('eco-test-willy','med_repeat','{"sequence":["pulse","resp","neural","tonus","pulse","neural"]}');perform public.pani_eco_input('eco-test-willy','med_repeat','{"sequence":["pulse","resp","neural","tonus","pulse","neural","resp"]}');
 for i in 1..2 loop perform public.pani_eco_input('eco-test-willy','med_timed','{"sequence":[{"channel":"pulse","time":0},{"channel":"resp","time":720},{"channel":"neural","time":1390},{"channel":"tonus","time":2050},{"channel":"pulse","time":2720}]}');end loop;
 perform public.pani_eco_input('eco-test-willy','med_markers','{"markers":[31,34,29,33,30,35],"conclusion":"anticipated"}');perform public.pani_eco_input('eco-test-willy','med_preserve','{"sequence":["pulse","resp","neural","tonus","pulse"],"preserveRaw":true}');

 -- INV: gabarito oficial Aliya/Alef, validação unitária e persistente.
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C1","category":"DEFINIR"}');
 assert(select not(public_state->'classified'?'C1') and public_state->'lastResult'->>'message'='CLASSIFICAÇÃO INCONSISTENTE' from pani_private.eco_anchor where crew_id='aliya'),'C1 em DEFINIR foi aceito';
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C1","category":"LOCALIZAR"}');
 v:=public.pani_eco_status('eco-test-aliya');assert v->'anchor'->'publicState'->'classified'->>'C1'='LOCALIZAR','refresh perdeu C1';
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C3","category":"LOCALIZAR"}');
 assert(select not(public_state->'classified'?'C3') from pani_private.eco_anchor where crew_id='aliya'),'C3 em LOCALIZAR foi aceito';
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C3","category":"DEFINIR"}');
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C2","category":"LOCALIZAR"}');
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C4","category":"LOCALIZAR"}');
 assert(select not(public_state->'classified'?'C4') and (public_state->'lastResult'->>'categoryFull')::boolean from pani_private.eco_anchor where crew_id='aliya'),'terceira carta entrou em categoria 2/2';
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C4","category":"DEFINIR"}');
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C5","category":"PERCEBER"}');perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C6","category":"PERCEBER"}');
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C7","category":"DELIMITAR"}');perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C8","category":"DELIMITAR"}');
 perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C9","category":"RELACIONAR"}');perform public.pani_eco_input('eco-test-aliya','inv_classify_card','{"cardId":"C10","category":"RELACIONAR"}');
 assert(select phase=2 from pani_private.eco_anchor where crew_id='aliya'),'10/10 não avançou Aliya';
 sol:=(select secret_state from pani_private.eco_anchor where crew_id='aliya');
 perform public.pani_eco_master_action('eco-master-test','interfere','{"crewId":"aliya","type":"phantom_relation"}');
 assert(select secret_state=sol from pani_private.eco_anchor where crew_id='aliya'),'interferência alterou o gabarito INV';
 perform public.pani_eco_input('eco-test-aliya','inv_validate_pair','{"cards":["C7","C3"]}');assert(select (public_state->>'pairCount')::int=0 from pani_private.eco_anchor where crew_id='aliya'),'C7+C3 foi aceito';
 perform public.pani_eco_input('eco-test-aliya','inv_validate_pair','{"cards":["C7","C1"]}');perform public.pani_eco_input('eco-test-aliya','inv_validate_pair','{"cards":["C3","C4"]}');perform public.pani_eco_input('eco-test-aliya','inv_validate_pair','{"cards":["C5","C6"]}');perform public.pani_eco_input('eco-test-aliya','inv_validate_pair','{"cards":["C8","C2"]}');
 assert(select phase=3 from pani_private.eco_anchor where crew_id='aliya'),'quatro pares não avançaram';
 perform public.pani_eco_input('eco-test-aliya','inv_test_hypothesis','{"hypothesis":"five"}');assert(select public_state->'testedHypotheses'->'five'->>'result'='INCOMPATÍVEL' from pani_private.eco_anchor where crew_id='aliya'),'cinco falhas não foi refutada';
 perform public.pani_eco_input('eco-test-aliya','inv_test_hypothesis','{"hypothesis":"pani"}');assert(select public_state->'testedHypotheses'->'pani'->>'result'='INCOMPATÍVEL' from pani_private.eco_anchor where crew_id='aliya'),'PANI danificada não foi refutada';
 perform public.pani_eco_input('eco-test-aliya','inv_test_hypothesis','{"hypothesis":"one"}');assert(select phase=4 from pani_private.eco_anchor where crew_id='aliya'),'hipótese correta não avançou';
 perform public.pani_eco_input('eco-test-aliya','inv_name_relation','{"name":"ESTRANGEIRO"}');assert(select not locked from pani_private.eco_anchor where crew_id='aliya'),'nomear Estrangeiro foi aceito';
 perform public.pani_eco_input('eco-test-aliya','inv_link_output','{"output":"GEN"}');perform public.pani_eco_input('eco-test-aliya','inv_link_output','{"output":"OPS"}');perform public.pani_eco_input('eco-test-aliya','inv_link_output','{"output":"SEC"}');perform public.pani_eco_input('eco-test-aliya','inv_link_output','{"output":"MED"}');perform public.pani_eco_input('eco-test-aliya','inv_link_output','{"output":"INV"}');
 perform public.pani_eco_input('eco-test-aliya','inv_fix_relation','{"noName":true,"fixRelation":true}');
 assert(select locked and public_state->>'ecoTimestamp'='03:17:12.2' and public_state->>'output'='CINCO SUPORTES // UMA ESTRUTURA RECORRENTE // SIGNIFICADO AINDA NÃO ATRIBUÍDO' from pani_private.eco_anchor where crew_id='aliya'),'Aliya não finalizou com output oficial';

 perform public.pani_eco_status('eco-test-aliya');assert(select status from pani_private.eco_session where session_id='W77-02')='convergence','five locks did not open convergence';assert(select count(*) from pani_private.eco_anchor where locked)=5,'missing lock';
 update pani_private.eco_session set convergence=convergence||jsonb_build_object('windowEnd',now()-interval'1 second');perform public.pani_eco_status('eco-test-gilbert');assert(select convergence->>'state' from pani_private.eco_session where session_id='W77-02')='recalibrating','no retry state';update pani_private.eco_session set convergence=convergence||jsonb_build_object('retryAt',now()-interval'1 second');perform public.pani_eco_status('eco-test-gilbert');assert(select convergence->>'state' from pani_private.eco_session where session_id='W77-02')='open','retry did not reopen';assert(select count(*) from pani_private.eco_anchor where locked)=5,'retry erased locks';
 sol:=(select secret_state from pani_private.eco_anchor where crew_id='aliya');perform public.pani_eco_master_action('eco-master-test','rupture','{"crewId":"aliya"}');assert(select secret_state=sol and extract(epoch from((interference->>'until')::timestamptz-now())) between 2 and 3.2 from pani_private.eco_anchor where crew_id='aliya'),'Ruptura Aliya mudou gabarito ou não dura aproximadamente 3 s';
 begin perform public.pani_eco_input('eco-test-gilbert','convergence','{"marker":"NØ","holdMs":2999}');assert false,'short hold accepted';exception when others then assert sqlerrm='invalid_convergence_action';end;
 perform public.pani_eco_input('eco-test-gilbert','convergence','{"marker":"NØ","holdMs":3100}');perform public.pani_eco_input('eco-test-gilbert','convergence','{"marker":"NØ","holdMs":3100}');assert(select(convergence->>'readyCount')::int from pani_private.eco_session where session_id='W77-02')=1,'duplicate ready counted';perform public.pani_eco_input('eco-test-eklay','convergence','{"nodes":["A","B","C"]}');perform public.pani_eco_input('eco-test-christian','convergence','{"sector":"Ø-C"}');perform public.pani_eco_input('eco-test-willy','convergence','{"sequence":["pulse","resp","neural","tonus"]}');v:=public.pani_eco_input('eco-test-aliya','inv_convergence','{"outputs":["GEN","OPS","SEC","MED","INV"],"noName":true,"fixRelation":true}');assert v->>'status'='complete'and(v->'convergence'->>'readyCount')::int=5,'ready 5/5 failed';assert v->'sixthLayer'->>'layer'='ENV'and position('Alice'in v::text)=0,'sixth layer leaked Alice';
 v:=public.pani_eco_status('eco-test-gilbert');assert not(v->'anchor')?'secretState','secretState leaked';assert position('"solution"'in v::text)=0 and position('correctSuspect'in v::text)=0,'solution leaked';assert not has_table_privilege('anon','pani_private.eco_anchor','select'),'anon reads private anchor';assert has_function_privilege('anon','public.pani_eco_input(text,text,jsonb)','execute'),'single public dispatcher missing';assert not has_function_privilege('anon','public.pani_eco_inv_input(text,text,jsonb)','execute') and not has_function_privilege('anon','public.pani_eco_ops_edit(text,text,jsonb)','execute'),'internal ECO RPC leaked';
 raise notice 'ECO-W77 ACCEPTANCE OK // 20 PHASES // READY 5/5';
end$test$;
rollback;
