begin;

-- ECO-W77: gabarito definitivo da Cartografia das Contradições (Aliya)
-- e edição reversível das peças de Paralaxe (Eklay). O gabarito permanece
-- exclusivamente no schema privado.

create or replace function pani_private.eco_inv_phase_public(p integer) returns jsonb
language plpgsql set search_path=pg_catalog,pani_private as $$
begin
 if p=1 then return jsonb_build_object(
  'title','CLASSIFICAR SEM INTERPRETAR','subtitle','Organize as evidências pela operação informacional que cada registro executa. Não tente explicar o fenômeno ainda.',
  'cards',jsonb_build_array(
   jsonb_build_object('id','C1','text','Presença registrada no interior de SEC às 03:17:12.'),jsonb_build_object('id','C2','text','R-3 aparece como destino válido, mas sem coordenada estável.'),
   jsonb_build_object('id','C3','text','Amostra G-04 permanece fisicamente idêntica.'),jsonb_build_object('id','C4','text','Descrição genética de G-04 troca A2 por NØ.'),
   jsonb_build_object('id','C5','text','Evento ambiental inicia em T+0.'),jsonb_build_object('id','C6','text','Seis corpos iniciam resposta em T negativo.'),
   jsonb_build_object('id','C7','text','Porta SEC-02 não abriu no intervalo registrado.'),jsonb_build_object('id','C8','text','Rota OPS encerra em R-3 apesar de não haver posição convencional.'),
   jsonb_build_object('id','C9','text','Cinco setores convergem em 03:17:12 ± 0,8 s.'),jsonb_build_object('id','C10','text','Alef marca o mesmo padrão em suportes diferentes.')),
  'operations',jsonb_build_array('LOCALIZAR','DEFINIR','PERCEBER','DELIMITAR','RELACIONAR'),'classified','{}'::jsonb,
  'categoryCounts','{"LOCALIZAR":0,"DEFINIR":0,"PERCEBER":0,"DELIMITAR":0,"RELACIONAR":0}'::jsonb,
  'classifiedCount',0,'stabilizedCategories','[]'::jsonb,'lastResult',null,'feedback','AGUARDANDO CLASSIFICAÇÃO');
 elsif p=2 then return jsonb_build_object(
  'title','CONTRADIÇÕES VÁLIDAS','subtitle','Quais evidências não deveriam poder ser verdade ao mesmo tempo sob uma explicação convencional?',
  'statements',pani_private.eco_inv_phase_public(1)->'cards','validatedPairs','[]'::jsonb,'correlationEvidence',jsonb_build_array('C9','C10'),'pairCount',0,'lastResult',null,'feedback','CONTRADIÇÕES 0/4');
 elsif p=3 then return jsonb_build_object(
  'title','UMA OCORRÊNCIA OU CINCO?','subtitle','Teste cada hipótese contra as evidências antes de estabilizar a conclusão.',
  'hypotheses',jsonb_build_array(
   jsonb_build_object('id','five','title','CINCO FALHAS INDEPENDENTES','prediction','PREVISÃO: baixa correlação temporal'),
   jsonb_build_object('id','pani','title','PANI DANIFICADA','prediction','PREVISÃO: anomalia restrita a sistemas de informação'),
   jsonb_build_object('id','one','title','UM FENÔMENO EM CINCO SUPORTES','prediction','PREVISÃO: manifestações diferentes mantendo estrutura comum')),
  'testedHypotheses','{}'::jsonb,'lastResult',null,'feedback','TESTE AS TRÊS PREVISÕES');
 else return jsonb_build_object(
  'title','FIXAR A RELAÇÃO','subtitle','Você provou a relação. Não atribua um nome que as evidências ainda não sustentam.',
  'outputs',jsonb_build_array('GEN','OPS','SEC','MED','INV'),'linkedOutputs','[]'::jsonb,'centerLabel','SEM NOME','decision','pending','lastResult',null,'feedback','LIGUE OS CINCO SUPORTES AO NODO CENTRAL');
 end if;
end$$;

create or replace function pani_private.eco_inv_phase_secret(p integer) returns jsonb
language plpgsql set search_path=pg_catalog,pani_private as $$
begin
 if p=1 then return jsonb_build_object('categoryAnswerKey',jsonb_build_object('C1','LOCALIZAR','C2','LOCALIZAR','C3','DEFINIR','C4','DEFINIR','C5','PERCEBER','C6','PERCEBER','C7','DELIMITAR','C8','DELIMITAR','C9','RELACIONAR','C10','RELACIONAR'));
 elsif p=2 then return jsonb_build_object('contradictionPairs',jsonb_build_array(jsonb_build_array('C7','C1'),jsonb_build_array('C3','C4'),jsonb_build_array('C5','C6'),jsonb_build_array('C8','C2')));
 elsif p=3 then return jsonb_build_object('correctHypothesis','one','results',jsonb_build_object(
  'five',jsonb_build_object('result','INCOMPATÍVEL','level','refuted','reason','Eventos independentes não deveriam convergir temporalmente e estruturalmente dessa forma. C9 e C10 refutam essa hipótese.'),
  'pani',jsonb_build_object('result','INCOMPATÍVEL','level','refuted','reason','Uma falha da PANI não explica respostas fisiológicas, comportamento corporal, matéria física ou alterações de descrição sem alteração da amostra.'),
  'one',jsonb_build_object('result','COMPATÍVEL','level','confirmed','reason','As manifestações são diferentes e mantêm uma estrutura comum em cinco suportes.')));
 else return jsonb_build_object('phase4Answer','NO_NAME_FIX_RELATION','outputs',jsonb_build_array('GEN','OPS','SEC','MED','INV'));
 end if;
end$$;

create or replace function pani_private.eco_inv_fail(reason text,detail jsonb default '{}'::jsonb) returns void
language plpgsql set search_path=pg_catalog,pani_private as $$
declare a pani_private.eco_anchor%rowtype;next_stability int;result jsonb;
begin
 select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id='aliya' for update;
 next_stability:=a.stability-1;result:=jsonb_build_object('level','error','message',left(reason,240),'accepted',false)||coalesce(detail,'{}'::jsonb);
 if next_stability>0 then update pani_private.eco_anchor set stability=next_stability,public_state=public_state||jsonb_build_object('lastResult',result,'feedback',left(reason,240),'serverAck','REGISTRADO // ESTABILIDADE REDUZIDA'),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','error','text',left(reason,240))),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';
 else update pani_private.eco_anchor set stability=3,help_tokens=help_tokens+1,public_state=public_state||jsonb_build_object('lastResult',result||jsonb_build_object('recalibrated',true),'feedback','FASE ATUAL RECALIBRADA // PROGRESSO VALIDADO PRESERVADO','serverAck','RECALIBRAÇÃO REGISTRADA'),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','recalibration','text','Fase atual recalibrada; acertos persistentes preservados.')),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';update pani_private.eco_session set global_pressure=global_pressure+1,revision=revision+1,updated_at=now() where session_id='W77-02';end if;
 perform pani_private.eco_log_write('aliya','anchor_error',reason,jsonb_build_object('phase',a.phase));
end$$;

create or replace function pani_private.eco_inv_advance(outp text default null) returns void
language plpgsql set search_path=pg_catalog,pani_private as $$
declare a pani_private.eco_anchor%rowtype;n int;
begin
 select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id='aliya' for update;
 if a.phase=4 then update pani_private.eco_anchor set locked=true,progress=100,stability=3,public_state=public_state||jsonb_build_object('output',coalesce(outp,'CINCO SUPORTES // UMA ESTRUTURA RECORRENTE // SIGNIFICADO AINDA NÃO ATRIBUÍDO'),'ecoTimestamp','03:17:12.2','decision','NO_NAME_FIX_RELATION','feedback','RELAÇÃO FIXADA','serverAck','INV // LOCK'),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','anchor_locked','text','NÃO NOMEAR // FIXAR RELAÇÃO')),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';perform pani_private.eco_log_write('aliya','anchor_locked','INV // LOCK');
 else n:=a.phase+1;update pani_private.eco_anchor set phase=n,progress=(n-1)*25,stability=3,public_state=pani_private.eco_inv_phase_public(n)||jsonb_build_object('serverAck','FASE REGISTRADA'),secret_state=pani_private.eco_inv_phase_secret(n),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','phase','text','FASE '||a.phase||' CONCLUÍDA')),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';perform pani_private.eco_log_write('aliya','phase_advanced','FASE '||n);end if;
end$$;

create or replace function pani_private.eco_reset(s integer default 1,r boolean default true) returns void
language plpgsql set search_path=pg_catalog,pani_private as $$declare c text;begin
 if s not between 1 and 10 then raise exception 'invalid_seed';end if;insert into pani_private.eco_session(session_id) values('W77-02') on conflict do nothing;
 update pani_private.eco_session set released=r,status=case when r then 'active' else 'dormant' end,paused=false,paused_at=null,seed_id=s,global_pressure=0,presence_charges=5,rupture_available=true,coherence=12,convergence='{}',secret_state=jsonb_build_object('secRoute',(select to_jsonb(sec_route) from pani_private.eco_seed_library where seed_id=s)),revision=revision+1,updated_at=now() where session_id='W77-02';delete from pani_private.eco_anchor where session_id='W77-02';
 foreach c in array pani_private.eco_active_crew() loop insert into pani_private.eco_anchor(session_id,crew_id,anchor_id,public_state,secret_state) values('W77-02',c,pani_private.eco_anchor_name(c),case when c='aliya' then pani_private.eco_inv_phase_public(1) else pani_private.eco_phase_public(c,1,s) end,case when c='aliya' then pani_private.eco_inv_phase_secret(1) else pani_private.eco_phase_secret(c,1,s) end);end loop;
 perform pani_private.eco_log_write('MASTER',case when r then 'protocol_started' else 'protocol_reset' end,'ECO-W77 // CINCO ÂNCORAS',jsonb_build_object('seed',s));
end$$;

create or replace function pani_private.eco_fail(c text,reason text) returns void
language plpgsql set search_path=pg_catalog,pani_private as $$declare a pani_private.eco_anchor%rowtype;s int;begin
 if c='aliya' then perform pani_private.eco_inv_fail(reason);return;end if;select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id=c for update;select seed_id into s from pani_private.eco_session where session_id='W77-02';
 if a.stability>1 then update pani_private.eco_anchor set stability=stability-1,public_state=public_state||jsonb_build_object('feedback',left(reason,240),'serverAck','REGISTRADO // ESTABILIDADE REDUZIDA'),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','error','text',left(reason,240))),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id=c;
 else update pani_private.eco_anchor set stability=3,help_tokens=help_tokens+1,public_state=pani_private.eco_phase_public(c,a.phase,s)||'{"advantage":true,"feedback":"Fase recalibrada. AJUDA PANI compensatória concedida.","serverAck":"RECALIBRAÇÃO REGISTRADA"}'::jsonb,secret_state=pani_private.eco_phase_secret(c,a.phase,s),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','recalibration','text','Fase recalibrada sem apagar fases anteriores.')),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id=c;update pani_private.eco_session set global_pressure=global_pressure+1,revision=revision+1 where session_id='W77-02';end if;perform pani_private.eco_log_write(c,'anchor_error',reason,jsonb_build_object('phase',a.phase));
end$$;

create or replace function pani_private.eco_advance(c text,outp text default null) returns void
language plpgsql set search_path=pg_catalog,pani_private as $$declare a pani_private.eco_anchor%rowtype;s int;n int;begin
 if c='aliya' then perform pani_private.eco_inv_advance(outp);return;end if;select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id=c for update;select seed_id into s from pani_private.eco_session where session_id='W77-02';
 if a.phase=4 then update pani_private.eco_anchor set locked=true,progress=100,stability=3,public_state=public_state||jsonb_build_object('output',coalesce(outp,'ÂNCORA FIXADA'),'feedback','ÂNCORA FIXADA // AGUARDANDO CONVERGÊNCIA','serverAck','LOCK REGISTRADO'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id=c;perform pani_private.eco_log_write(c,'anchor_locked',coalesce(outp,'ÂNCORA FIXADA'));
 else n:=a.phase+1;update pani_private.eco_anchor set phase=n,progress=(n-1)*25,stability=3,public_state=pani_private.eco_phase_public(c,n,s)||'{"serverAck":"FASE REGISTRADA"}'::jsonb,secret_state=pani_private.eco_phase_secret(c,n,s),public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','phase','text','FASE '||a.phase||' CONCLUÍDA')),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id=c;if c='christian' and n in(2,3) then update pani_private.eco_anchor set secret_state=jsonb_set(secret_state,'{route}',(select secret_state->'secRoute' from pani_private.eco_session where session_id='W77-02')) where session_id='W77-02' and crew_id=c;end if;perform pani_private.eco_log_write(c,'phase_advanced','FASE '||n);end if;
end$$;

create or replace function pani_private.eco_inv_hint(p int,lvl int,st jsonb,sec jsonb) returns text
language plpgsql set search_path=pg_catalog,pani_private as $$declare k text;pair jsonb;begin
 if p=1 then if lvl=1 then return 'Classifique a OPERAÇÃO descrita, não o assunto do registro.';elsif lvl=2 then return 'Pergunte: isto está tentando localizar, definir, perceber, delimitar ou relacionar algo?';else select key into k from jsonb_each_text(sec->'categoryAnswerKey') where not (coalesce(st->'classified','{}')?key) order by substring(key from 2)::int limit 1;return coalesce(k||' corresponde a '||(sec->'categoryAnswerKey'->>k)||'.','Todas as cartas já foram classificadas.');end if;
 elsif p=2 then if lvl=1 then return 'Procure afirmações que não deveriam coexistir.';elsif lvl=2 then return 'Uma porta permaneceu fechada. Ainda assim há presença interna.';else select value into pair from jsonb_array_elements(sec->'contradictionPairs') x(value) where not exists(select 1 from jsonb_array_elements(coalesce(st->'validatedPairs','[]')) v(value) where v.value @> x.value and x.value @> v.value) limit 1;return coalesce((pair->>0)||' forma uma contradição com '||(pair->>1)||'.','Todas as contradições já foram validadas.');end if;
 elsif p=3 then return case lvl when 1 then 'Cinco falhas independentes deveriam compartilhar o mesmo horário?' when 2 then 'Uma falha da PANI explicaria respostas corporais?' else 'Teste a hipótese de um único fenômeno em múltiplos suportes.' end;
 else return case lvl when 1 then 'Você provou a relação. Não provou o nome.' when 2 then 'Nomear é uma conclusão adicional.' else 'Escolha NÃO NOMEAR — FIXAR RELAÇÃO.' end;end if;
end$$;

create or replace function public.pani_eco_inv_input(p_token text,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=pg_catalog,public,pani_private as $$
declare c text;s pani_private.eco_session%rowtype;a pani_private.eco_anchor%rowtype;st jsonb;sec jsonb;card text;category text;expected text;classified jsonb;counts jsonb;stabilized jsonb;cnt int;pair jsonb;valid_pair jsonb;tested jsonb;result jsonb;outputs jsonb;linked jsonb;ready jsonb;n int;lvl int;hint text;ok boolean:=false;
begin
 c:=pani_private.eco_auth_crew(p_token);if c<>'aliya' then raise exception 'anchor_not_assigned';end if;perform pani_private.eco_tick_session();select * into s from pani_private.eco_session where session_id='W77-02' for update;select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id='aliya' for update;if not s.released then raise exception 'eco_not_released';end if;if s.paused then raise exception 'eco_paused';end if;
 if p_action in('inv_convergence','convergence') then if not a.locked or s.status<>'convergence' or s.convergence->>'state'<>'open' then raise exception 'convergence_unavailable';end if;if now()>(s.convergence->>'windowEnd')::timestamptz then perform pani_private.eco_tick_session();raise exception 'convergence_window_closed';end if;outputs:=p_payload->'outputs';ok:=jsonb_typeof(outputs)='array' and jsonb_array_length(outputs)=5 and outputs @> '["GEN","OPS","SEC","MED","INV"]'::jsonb and '["GEN","OPS","SEC","MED","INV"]'::jsonb @> outputs and coalesce((p_payload->>'noName')::boolean,false) and coalesce((p_payload->>'fixRelation')::boolean,false);if not ok then raise exception 'invalid_convergence_action';end if;ready:=coalesce(s.convergence->'ready','[]');if not (ready?'aliya') then ready:=ready||jsonb_build_array('aliya');end if;n:=jsonb_array_length(ready);if n=5 then update pani_private.eco_session set status='complete',convergence=convergence||jsonb_build_object('state','success','ready',ready,'readyCount',5,'completedAt',now()),revision=revision+1,updated_at=now() where session_id='W77-02';else update pani_private.eco_session set convergence=convergence||jsonb_build_object('ready',ready,'readyCount',n),revision=revision+1,updated_at=now() where session_id='W77-02';end if;perform pani_private.eco_log_write('aliya','convergence_ready','READY // ALIYA');return public.pani_eco_status(p_token);end if;
 if s.status<>'active' then raise exception 'eco_inputs_closed';end if;if a.locked then raise exception 'anchor_locked';end if;st:=a.public_state;sec:=a.secret_state;
 if p_action in('inv_use_help','use_help') then if a.help_tokens<=0 then raise exception 'no_help_tokens';end if;lvl:=least(3,coalesce((st->>'hintLevel')::int,0)+1);hint:=pani_private.eco_inv_hint(a.phase,lvl,st,sec);update pani_private.eco_anchor set help_tokens=help_tokens-1,public_state=public_state||jsonb_build_object('hintLevel',lvl,'hint',hint,'serverAck','AJUDA PANI REGISTRADA'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';
 elsif p_action='inv_classify_card' and a.phase=1 then card:=upper(coalesce(p_payload->>'cardId',''));category:=upper(coalesce(p_payload->>'category',''));expected:=sec->'categoryAnswerKey'->>card;if expected is null or not category=any(array['LOCALIZAR','DEFINIR','PERCEBER','DELIMITAR','RELACIONAR']) then raise exception 'invalid_classification';end if;classified:=coalesce(st->'classified','{}');counts:=coalesce(st->'categoryCounts','{}');
  if classified?card then update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('lastResult',jsonb_build_object('level','success','message','CLASSIFICAÇÃO REGISTRADA','accepted',true,'cardId',card),'serverAck','REGISTRADO'),revision=revision+1 where session_id='W77-02' and crew_id='aliya';
  elsif coalesce((counts->>category)::int,0)>=2 then update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('lastResult',jsonb_build_object('level','error','message','CATEGORIA 2/2 // SELECIONE OUTRA OPERAÇÃO','accepted',false,'cardId',card,'categoryFull',true),'feedback','CLASSIFICAÇÃO NÃO ENVIADA','serverAck','BLOQUEADO // CATEGORIA ESTABILIZADA'),revision=revision+1 where session_id='W77-02' and crew_id='aliya';
  elsif category<>expected then perform pani_private.eco_inv_fail('CLASSIFICAÇÃO INCONSISTENTE',jsonb_build_object('cardId',card));
  else classified:=classified||jsonb_build_object(card,category);counts:=jsonb_set(counts,array[category],to_jsonb(coalesce((counts->>category)::int,0)+1),true);select count(*) into cnt from jsonb_object_keys(classified);select coalesce(jsonb_agg(key order by key),'[]') into stabilized from jsonb_each_text(counts) where value::int=2;update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('classified',classified,'categoryCounts',counts,'classifiedCount',cnt,'stabilizedCategories',stabilized,'lastResult',jsonb_build_object('level','success','message','CLASSIFICAÇÃO REGISTRADA','accepted',true,'cardId',card),'feedback',case when cnt=10 then 'CLASSIFICAÇÃO CONCLUÍDA' else 'EVIDÊNCIAS CLASSIFICADAS '||cnt||'/10' end,'serverAck','REGISTRADO'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';if cnt=10 then perform pani_private.eco_inv_advance();end if;end if;
 elsif p_action='inv_validate_pair' and a.phase=2 then pair:=p_payload->'cards';if jsonb_typeof(pair)<>'array' or jsonb_array_length(pair)<>2 or pair->>0=pair->>1 then raise exception 'invalid_pair';end if;select value into valid_pair from jsonb_array_elements(sec->'contradictionPairs') x(value) where x.value @> pair and pair @> x.value limit 1;if valid_pair is null then perform pani_private.eco_inv_fail('RELAÇÃO NÃO SUPORTADA',jsonb_build_object('cards',pair));else linked:=coalesce(st->'validatedPairs','[]');if not exists(select 1 from jsonb_array_elements(linked) x(value) where x.value @> valid_pair and valid_pair @> x.value) then linked:=linked||jsonb_build_array(valid_pair);end if;cnt:=jsonb_array_length(linked);update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('validatedPairs',linked,'pairCount',cnt,'lastResult',jsonb_build_object('level','success','message','CONTRADIÇÃO VALIDADA','accepted',true,'cards',valid_pair),'feedback','CONTRADIÇÕES '||cnt||'/4','serverAck','REGISTRADO'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';if cnt=4 then perform pani_private.eco_inv_advance();end if;end if;
 elsif p_action='inv_test_hypothesis' and a.phase=3 then card:=lower(coalesce(p_payload->>'hypothesis',''));result:=sec->'results'->card;if result is null then raise exception 'invalid_hypothesis';end if;tested:=coalesce(st->'testedHypotheses','{}')||jsonb_build_object(card,result);select count(*) into cnt from jsonb_object_keys(tested);update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('testedHypotheses',tested,'lastResult',result||jsonb_build_object('hypothesis',card,'message',case when card='one' then 'HIPÓTESE ESTÁVEL // 1 FENÔMENO / 5 SUPORTES' else 'HIPÓTESE REFUTADA' end),'feedback',case when card='one' then 'HIPÓTESE ESTÁVEL' else 'PREVISÃO INCOMPATÍVEL' end,'serverAck','REGISTRADO'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';if cnt=3 then perform pani_private.eco_inv_advance();end if;
 elsif p_action='inv_link_output' and a.phase=4 then card:=upper(coalesce(p_payload->>'output',''));if not card=any(array['GEN','OPS','SEC','MED','INV']) then raise exception 'invalid_output';end if;linked:=coalesce(st->'linkedOutputs','[]');if linked?card then linked:=linked-card;else linked:=linked||jsonb_build_array(card);end if;update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('linkedOutputs',linked,'lastResult',jsonb_build_object('level','success','message','RELAÇÃO REGISTRADA','accepted',true,'output',card),'feedback',jsonb_array_length(linked)||'/5 SUPORTES CONECTADOS','serverAck','REGISTRADO'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='aliya';
 elsif p_action='inv_name_relation' and a.phase=4 then perform pani_private.eco_inv_fail('NOME NÃO SUPORTADO PELAS EVIDÊNCIAS');
 elsif p_action='inv_fix_relation' and a.phase=4 then linked:=coalesce(st->'linkedOutputs','[]');ok:=jsonb_array_length(linked)=5 and linked @> '["GEN","OPS","SEC","MED","INV"]'::jsonb and coalesce((p_payload->>'noName')::boolean,false) and coalesce((p_payload->>'fixRelation')::boolean,false);if ok then perform pani_private.eco_inv_advance('CINCO SUPORTES // UMA ESTRUTURA RECORRENTE // SIGNIFICADO AINDA NÃO ATRIBUÍDO');else perform pani_private.eco_inv_fail('RELAÇÃO NOMEADA OU INCOMPLETA');end if;
 else raise exception 'invalid_inv_action';end if;return public.pani_eco_status(p_token);
end$$;

create or replace function public.pani_eco_ops_edit(p_token text,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path=pg_catalog,public,pani_private as $$
declare c text;s pani_private.eco_session%rowtype;a pani_private.eco_anchor%rowtype;st jsonb;cell text;target text;piece jsonb;returned jsonb;anchors jsonb;idx int;n int;r int;col int;
begin
 c:=pani_private.eco_auth_crew(p_token);if c<>'eklay' then raise exception 'anchor_not_assigned';end if;select * into s from pani_private.eco_session where session_id='W77-02' for update;select * into a from pani_private.eco_anchor where session_id='W77-02' and crew_id='eklay' for update;if not s.released then raise exception 'eco_not_released';end if;if s.paused then raise exception 'eco_paused';end if;if s.status<>'active' or a.locked or a.phase not in(1,2,3) then raise exception 'ops_edit_unavailable';end if;st:=a.public_state;n:=coalesce((st->>'gridSize')::int,0);cell:=p_payload->>'cell';if cell is null or cell!~'^[0-9]+,[0-9]+$' then raise exception 'invalid_cell';end if;r:=split_part(cell,',',1)::int;col:=split_part(cell,',',2)::int;if r<0 or col<0 or r>=n or col>=n then raise exception 'invalid_cell';end if;
 if p_action='ops_place' then if (st->'placed')?cell or cell=st->>'origin' then raise exception 'invalid_cell';end if;returned:=coalesce(st->'returned','[]');idx:=coalesce((st->>'queueIndex')::int,0);if jsonb_array_length(returned)>0 then piece:=jsonb_build_object('piece',returned->>0,'rot',0,'crossed',false);returned:=returned-0;st:=jsonb_set(st,'{returned}',returned,true);else if idx>=jsonb_array_length(st->'queue') then raise exception 'queue_empty';end if;piece:=jsonb_build_object('piece',st->'queue'->>idx,'rot',0,'crossed',false);st:=jsonb_set(st,'{queueIndex}',to_jsonb(idx+1));end if;st:=jsonb_set(st,array['placed',cell],piece,true);if a.phase in(2,3) and nullif(st->>'buildDeadline','') is null then st:=jsonb_set(st,'{buildDeadline}',to_jsonb(now()+interval '12 seconds'));end if;st:=st||jsonb_build_object('feedback','PEÇA POSICIONADA // PODE SER MOVIDA, GIRADA OU REMOVIDA','serverAck','REGISTRADO');
 elsif p_action='ops_rotate' then if not (st->'placed')?cell then raise exception 'piece_missing';end if;st:=jsonb_set(st,array['placed',cell,'rot'],to_jsonb((coalesce((st#>>array['placed',cell,'rot'])::int,0)+1)%4));st:=st||jsonb_build_object('feedback','ROTAÇÃO REGISTRADA','serverAck','REGISTRADO');
 elsif p_action='ops_remove' then if not (st->'placed')?cell then raise exception 'piece_missing';end if;piece:=st->'placed'->cell;returned:=jsonb_build_array(piece->>'piece')||coalesce(st->'returned','[]');st:=jsonb_set(st,'{placed}',(st->'placed')-cell);st:=jsonb_set(st,'{returned}',returned,true);anchors:=coalesce(st->'anchors','[]')-cell;st:=jsonb_set(st,'{anchors}',anchors,true);st:=st||jsonb_build_object('feedback','PEÇA REMOVIDA // DEVOLVIDA À FILA','serverAck','REGISTRADO');
 elsif p_action='ops_move' then target:=p_payload->>'target';if target is null or target!~'^[0-9]+,[0-9]+$' then raise exception 'invalid_cell';end if;r:=split_part(target,',',1)::int;col:=split_part(target,',',2)::int;if r<0 or col<0 or r>=n or col>=n or target=st->>'origin' or (st->'placed')?target then raise exception 'invalid_target';end if;if not (st->'placed')?cell then raise exception 'piece_missing';end if;piece:=st->'placed'->cell;st:=jsonb_set(st,'{placed}',(st->'placed')-cell);st:=jsonb_set(st,array['placed',target],piece,true);anchors:=coalesce(st->'anchors','[]');if anchors?cell then anchors:=(anchors-cell)||jsonb_build_array(target);end if;st:=jsonb_set(st,'{anchors}',anchors,true);st:=st||jsonb_build_object('feedback','PEÇA MOVIDA','serverAck','REGISTRADO');
 else raise exception 'invalid_ops_edit_action';end if;update pani_private.eco_anchor set public_state=st,revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id='eklay';perform pani_private.eco_log_write('eklay',p_action,coalesce(target,cell));return public.pani_eco_status(p_token);
end$$;

revoke all on function public.pani_eco_inv_input(text,text,jsonb),public.pani_eco_ops_edit(text,text,jsonb) from public,anon,authenticated;
revoke all on function pani_private.eco_inv_phase_public(integer),pani_private.eco_inv_phase_secret(integer),pani_private.eco_inv_fail(text,jsonb),pani_private.eco_inv_advance(text),pani_private.eco_inv_hint(integer,integer,jsonb,jsonb) from public,anon,authenticated;

-- Só migra o snapshot vazio da sessão real quando ela está selada.
update pani_private.eco_anchor a set public_state=pani_private.eco_inv_phase_public(1),secret_state=pani_private.eco_inv_phase_secret(1),revision=a.revision+1,updated_at=now()
from pani_private.eco_session s where a.session_id='W77-02' and a.crew_id='aliya' and a.phase=1 and not a.locked and s.session_id=a.session_id and not s.released and s.status='dormant';

comment on function public.pani_eco_inv_input(text,text,jsonb) is 'Ações server-authoritative da Cartografia das Contradições; gabarito privado.';
comment on function public.pani_eco_ops_edit(text,text,jsonb) is 'Edição persistente e reversível das peças de Paralaxe da âncora OPS.';

commit;
