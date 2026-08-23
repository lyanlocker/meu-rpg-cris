-- ADUNATIO // PROTOCOLO PANI // EVENTOS DE CONTENCAO v1.2
-- Camada incremental sobre containment-v1.sql. Mantem sessoes e progresso existentes.

create or replace function pani_private.containment_conexo_solution()
returns jsonb language sql immutable set search_path='' as $$
  select jsonb_build_array(
    jsonb_build_object('name','REGISTRO','words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO')),
    jsonb_build_object('name','ACESSO','words',jsonb_build_array('CHAVE','TRAVA','SENHA','PORTA')),
    jsonb_build_object('name','MEMÓRIA','words',jsonb_build_array('ECO','LEMBRANÇA','SONHO','VESTÍGIO')),
    jsonb_build_object('name','ESTAÇÃO','words',jsonb_build_array('MÓDULO','SETOR','CÂMARA','CORREDOR'))
  )
$$;

create or replace function pani_private.containment_conexo_words()
returns jsonb language sql volatile set search_path='' as $$
  select jsonb_agg(word order by random()) from jsonb_array_elements_text(
    '["ARQUIVO","ÍNDICE","DOSSIÊ","RELATÓRIO","CHAVE","TRAVA","SENHA","PORTA","ECO","LEMBRANÇA","SONHO","VESTÍGIO","MÓDULO","SETOR","CÂMARA","CORREDOR"]'::jsonb) word
$$;

create or replace function pani_private.containment_blood_choices(p_beat integer)
returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_array(
   pani_private.containment_blood_case(p_beat),
   pani_private.containment_blood_case(p_beat+1),
   pani_private.containment_blood_case(p_beat+2))
$$;

create or replace function pani_private.containment_death_choices(p_cycle integer,p_anchor text default null)
returns jsonb language sql immutable set search_path='' as $$
 select jsonb_build_array(
   pani_private.containment_death_case(p_cycle,p_anchor),
   jsonb_build_object('answer',case when p_anchor is distinct from 'lamp' then 'lamp' else 'chair' end,
     'public',jsonb_build_object('scene_kind','alternate','changed_visuals',jsonb_build_array(case when p_anchor is distinct from 'lamp' then 'lamp' else 'chair' end))),
   jsonb_build_object('answer',case when p_anchor is distinct from 'clock' then 'clock' else 'door' end,
     'public',jsonb_build_object('scene_kind','temporal','changed_visuals',jsonb_build_array(case when p_anchor is distinct from 'clock' then 'clock' else 'door' end))))
$$;

-- Sangue v1.2 resolve o batimento e devolve a vez ao Mestre. Nenhum novo
-- desafio ou resposta nasce no cliente.
create or replace function pani_private.containment_tick(p_session text)
returns void language plpgsql volatile set search_path='' as $$
declare s pani_private.containment_session%rowtype; st jsonb; sec jsonb; ev jsonb;
 beat int; stab int; hemo int; picked text; answer text;
begin
 select * into s from pani_private.containment_session where session_id=p_session for update;
 if s.session_id is null then return; end if;
 st:=s.state; sec:=s.secret_state; ev:=coalesce(st->'event','{}'::jsonb);
 if st->>'active_event'<>'blood' or coalesce((st->>'paused')::boolean,false)
   or st->>'timer_end' is null or (st->>'timer_end')::timestamptz>now()
   or ev->>'phase'<>'beats' then return; end if;
 beat:=coalesce((ev->>'beat')::int,1); stab:=coalesce((ev->>'stabilization')::int,0);
 hemo:=coalesce((ev->>'hemorrhage')::int,0); picked:=ev->>'selected_valve'; answer:=sec#>>'{blood,answer}';
 if picked=answer then stab:=stab+1; else hemo:=hemo+1; end if;
 if hemo>=3 then stab:=2; hemo:=0; st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1))); end if;
 if stab>=4 then
   ev:=ev||jsonb_build_object('phase','final','active_side','PLAYERS','stabilization',4,'hemorrhage',hemo,'selected_valve',null,'representative_ready',false,'vote_phase','blood:seals');
 else
   beat:=beat+1;
   ev:=ev||jsonb_build_object('phase','master_prepare','active_side','MASTER','beat',beat,'stabilization',stab,'hemorrhage',hemo,'readings','[]'::jsonb,'selected_valve',null,'vote_phase',null,'one_may_lie',false);
   sec:=jsonb_set(sec,'{blood}',jsonb_build_object('beat_index',beat,'answer',null,'answer_locked',false,'choices',pani_private.containment_blood_choices(beat),'fake_votes',null),true);
 end if;
 st:=st||jsonb_build_object('event',ev,'timer_end',null,'timer_remaining',null);
 update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id=p_session;
 perform pani_private.containment_log_event(p_session,'PANI','blood_beat_resolved','beat='||beat||';picked='||coalesce(picked,'none'));
end $$;

-- O snapshot publico nunca inclui masterSecretState. O representante de Conexo
-- recebe somente o consenso, nunca a solucao.
create or replace function public.pani_containment_crew_state(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.crew_access%rowtype; s pani_private.containment_session%rowtype; joined boolean:=false;
 players jsonb:='[]'; summary jsonb:='{}'; my_vote text; role_name text:='spectator'; phase text; active_event text;
begin
 select * into c from public.crew_access where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');
 if c.crew_id is null then raise exception 'unauthorized'; end if;
 perform pani_private.containment_tick('W77-01'); select * into s from pani_private.containment_session where session_id='W77-01';
 select coalesce(p.joined,false) into joined from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=c.crew_id;
 if joined then update pani_private.containment_participant set last_seen=now() where session_id='W77-01' and crew_id=c.crew_id; end if;
 select coalesce(jsonb_agg(jsonb_build_object('crew_id',p.crew_id,'display_name',ca.display_name,'module',ca.module,'connected',p.last_seen>now()-interval '12 seconds','last_seen',p.last_seen) order by ca.display_name),'[]') into players
 from pani_private.containment_participant p join public.crew_access ca on ca.crew_id=p.crew_id where p.session_id='W77-01' and p.joined;
 active_event:=s.state->>'active_event'; phase:=s.state#>>'{event,vote_phase}';
 if c.crew_id=s.state->>'representative_id' then role_name:='representative'; end if;
 if c.crew_id=s.state->>'witness_id' then role_name:='witness'; end if;
 if active_event is not null and phase is not null then
   select v.value into my_vote from pani_private.containment_vote v where v.session_id='W77-01' and v.event_id=active_event and v.phase_key=phase and v.crew_id=c.crew_id;
   if active_event='knowledge' or (active_event='death' and role_name='witness') or (active_event in ('energy','blood') and role_name='representative') then
     summary:=pani_private.containment_vote_summary('W77-01',active_event,phase);
     if active_event='blood' and role_name='representative' and s.secret_state#>'{blood,fake_votes}' is not null and s.secret_state#>'{blood,fake_votes}'<>'null'::jsonb then summary:=s.secret_state#>'{blood,fake_votes}'; end if;
   end if;
 end if;
 return jsonb_build_object('session_id','W77-01','released',coalesce((s.state->>'released')::boolean,false),'joined',joined,'state',s.state,'revision',s.revision,'server_time',now(),
  'player',jsonb_build_object('crew_id',c.crew_id,'display_name',c.display_name,'module',c.module,'role',role_name),'players',players,'vote_summary',summary,'my_vote',my_vote);
end $$;

create or replace function public.pani_containment_crew_action_v12(p_token text,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.crew_access%rowtype; s pani_private.containment_session%rowtype; st jsonb; sec jsonb; ev jsonb;
 active_event text; side text; rep text; witness text; value text; phase text; selected jsonb; group_row jsonb; groups jsonb; solved jsonb; matched jsonb:=null;
 coherence int; pos int; pulse int; overload int; cycle int; answer text; choices jsonb;
begin
 select * into c from public.crew_access where token_hash=encode(extensions.digest(p_token,'sha256'),'hex'); if c.crew_id is null then raise exception 'unauthorized'; end if;
 perform pani_private.containment_tick('W77-01'); select * into s from pani_private.containment_session where session_id='W77-01' for update;
 if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=c.crew_id and p.joined) then raise exception 'not_joined'; end if;
 update pani_private.containment_participant set last_seen=now() where session_id='W77-01' and crew_id=c.crew_id;
 st:=s.state;sec:=s.secret_state;ev:=coalesce(st->'event','{}');active_event:=st->>'active_event';side:=coalesce(ev->>'active_side','PLAYERS');rep:=st->>'representative_id';witness:=st->>'witness_id';phase:=ev->>'vote_phase';
 if side<>'PLAYERS' then raise exception 'master_turn'; end if;
 if p_action='vote' then
   value:=left(trim(coalesce(p_payload->>'value','')),40); if phase is null or value='' then raise exception 'vote_unavailable'; end if;
   if active_event='knowledge' and not (ev->'words' @> jsonb_build_array(value)) then raise exception 'invalid_vote'; end if;
   if active_event='energy' and value not in ('advance','stable','volatile') then raise exception 'invalid_vote'; end if;
   if active_event='blood' and value not in ('A','B','C') then raise exception 'invalid_vote'; end if;
   if active_event='death' and value not in ('clock','lamp','door','sample','chair','mirror') then raise exception 'invalid_vote'; end if;
   insert into pani_private.containment_vote(session_id,event_id,phase_key,crew_id,value,updated_at) values('W77-01',active_event,phase,c.crew_id,value,now()) on conflict(session_id,event_id,phase_key,crew_id) do update set value=excluded.value,updated_at=now();
 elsif p_action='knowledge_submit' then
   if active_event<>'knowledge' then raise exception 'knowledge_unavailable'; end if;
   selected:=coalesce(p_payload->'words','[]'::jsonb); if jsonb_typeof(selected)<>'array' or jsonb_array_length(selected)<>4 or (select count(distinct x) from jsonb_array_elements_text(selected)x)<>4 then raise exception 'four_unique_words_required'; end if;
   if not (ev->'words' @> selected) then raise exception 'invalid_group'; end if;
   groups:=sec#>'{knowledge,solution}'; solved:=coalesce(ev->'solved','[]'::jsonb);
   for group_row in select g.item from jsonb_array_elements(groups) as g(item) loop if ((group_row->'words') @> selected) and (selected @> (group_row->'words')) then matched:=group_row;exit;end if;end loop;
   coherence:=coalesce((ev->>'coherence')::int,4);
   if matched is not null and not (solved @> jsonb_build_array(matched->>'name')) then
     solved:=solved||jsonb_build_array(matched->>'name'); ev:=ev||jsonb_build_object('solved',solved,'solved_groups',coalesce(ev->'solved_groups','[]'::jsonb)||jsonb_build_array(matched));
     ev:=jsonb_set(ev,'{words}',(select coalesce(jsonb_agg(x),'[]') from jsonb_array_elements_text(ev->'words')x where not (matched->'words' @> jsonb_build_array(x))),true);
   else coherence:=coherence-1;ev:=ev||jsonb_build_object('coherence',coherence,'partial',exists(select 1 from jsonb_array_elements(groups)g where (select count(*) from jsonb_array_elements_text(selected)x where (g->'words') @> jsonb_build_array(x))=3)); end if;
   if jsonb_array_length(solved)>=4 then ev:=ev||jsonb_build_object('phase','final','active_side','PLAYERS','vote_phase','knowledge:contain'); else ev:=ev||jsonb_build_object('active_side','MASTER','vote_phase',null); end if;
   if coherence<=0 and jsonb_array_length(solved)<4 then ev:=ev||jsonb_build_object('coherence',2,'hint','A PANI isolou uma relação parcial; compare pares antes de fechar o grupo.');st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)));end if;
   delete from pani_private.containment_vote where session_id='W77-01' and event_id='knowledge';
 elsif p_action='knowledge_contain' then
   if active_event<>'knowledge' or ev->>'phase'<>'final' then raise exception 'knowledge_unavailable'; end if;st:=pani_private.containment_capture(st,'knowledge');
 elsif p_action='energy_move' then
   if active_event<>'energy' or c.crew_id<>rep then raise exception 'representative_required'; end if;
   pos:=coalesce((ev->>'position')::int,0);pulse:=greatest(1,least(6,coalesce((ev->>'pulse')::int,1)));overload:=coalesce((ev->>'overload')::int,0);value:=coalesce(p_payload->>'route','advance');
   if pos in(3,9,15) and value not in('stable','volatile') then raise exception 'route_required';end if;if pos in(3,9,15) and value='volatile' then pulse:=pulse+1;overload:=overload+1;end if;
   pos:=least(19,pos+pulse);if pos>=19 then st:=pani_private.containment_capture(st,'energy');else
     choices:=sec#>'{energy,deck}'; choices:=jsonb_build_array(choices->((coalesce((sec#>>'{energy,index}')::int,0))%jsonb_array_length(choices)),choices->((coalesce((sec#>>'{energy,index}')::int,0)+1)%jsonb_array_length(choices)),choices->((coalesce((sec#>>'{energy,index}')::int,0)+2)%jsonb_array_length(choices)));
     sec:=jsonb_set(sec,'{energy,hand}',choices,true);ev:=ev||jsonb_build_object('position',pos,'overload',overload,'active_side','MASTER','phase','master_threat','vote_phase',null,'last_effect','A entidade seleciona uma ameaça.');end if;
   delete from pani_private.containment_vote where session_id='W77-01' and event_id='energy';
 elsif p_action='blood_select' then
   if active_event<>'blood' or c.crew_id<>rep or ev->>'phase'<>'beats' then raise exception 'representative_required';end if;value:=upper(coalesce(p_payload->>'valve',''));if value not in('A','B','C') then raise exception 'invalid_valve';end if;ev:=ev||jsonb_build_object('selected_valve',value);
 elsif p_action='death_confirm' then
   if active_event<>'death' or c.crew_id<>witness or ev->>'phase'<>'cycles' then raise exception 'witness_required';end if;value:=coalesce(p_payload->>'object','');answer:=sec#>>'{death,answer}';
   if value=answer then cycle:=coalesce((ev->>'cycle')::int,1)+1;if cycle>4 then ev:=ev||jsonb_build_object('phase','final','active_side','PLAYERS','cycle',4,'vote_phase','death:hold');st:=st||jsonb_build_object('witness_id',null);else ev:=ev||jsonb_build_object('cycle',cycle,'phase','master_prepare','active_side','MASTER','changed_visuals','[]'::jsonb,'vote_phase',null,'previous_witness',witness);sec:=jsonb_set(sec,'{death}',jsonb_build_object('cycle',cycle,'answer',null,'choices',pani_private.containment_death_choices(cycle,ev->>'anchor')),true);st:=jsonb_set(st,'{witness_id}','null'::jsonb,true);end if;else ev:=ev||jsonb_build_object('attempts',coalesce((ev->>'attempts')::int,0)+1);st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)));end if;
   delete from pani_private.containment_vote where session_id='W77-01' and event_id='death';
 else return public.pani_containment_crew_action(p_token,p_action,p_payload); end if;
 st:=jsonb_set(st,'{event}',ev,true);update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';perform pani_private.containment_log_event('W77-01',c.display_name,p_action,active_event);return public.pani_containment_crew_state(p_token);
end $$;

create or replace function public.pani_containment_master_action_v12(p_pin text,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s pani_private.containment_session%rowtype;st jsonb;sec jsonb;ev jsonb;target text;rep text;statuses jsonb;deck jsonb;idx int;card text;effect text;pos int;overload int;choice jsonb;beat int;seconds int;cycle int;answer text;
begin
 if not public.pani_master_valid(p_pin) then raise exception 'unauthorized';end if;perform pani_private.containment_tick('W77-01');select * into s from pani_private.containment_session where session_id='W77-01' for update;st:=s.state;sec:=s.secret_state;ev:=coalesce(st->'event','{}');
 if p_action in('new_session','close_session') then perform public.pani_containment_master_action(p_pin,p_action,p_payload);update pani_private.containment_session set state=jsonb_set(state,'{protocol_version}','"containment_v1_2"',true),revision=revision+1 where session_id='W77-01';return public.pani_containment_master_state(p_pin);end if;
 if p_action='start_event' then
   target:=coalesce(p_payload->>'event','');rep:=coalesce(p_payload->>'representative_id','');if target not in('knowledge','energy','blood','death') then raise exception 'invalid_event';end if;if st->>'active_event' is not null then raise exception 'event_in_progress';end if;if st#>>array['event_status',target]<>'available' then raise exception 'event_unavailable';end if;
   if target in('energy','blood') and not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=rep and p.joined) then raise exception 'representative_unavailable';end if;if target in('knowledge','death') then rep:=null;end if;
   statuses:=jsonb_set(st->'event_status',array[target],'"in_progress"',true);st:=st||jsonb_build_object('protocol_version','containment_v1_2','status','active','active_event',target,'event_status',statuses,'representative_id',rep,'witness_id',null,'paused',false,'timer_end',null,'corruption_charges',2);
   delete from pani_private.containment_vote where session_id='W77-01' and event_id=target;
   if target='knowledge' then ev:=jsonb_build_object('phase','groups','active_side','PLAYERS','words',pani_private.containment_conexo_words(),'solved','[]'::jsonb,'solved_groups','[]'::jsonb,'coherence',4,'partial',false,'hint',null,'vote_phase','knowledge:g1');sec:=jsonb_set(sec,'{knowledge}',jsonb_build_object('solution',pani_private.containment_conexo_solution(),'corruption_hand',jsonb_build_array('shuffle','ghost_connection','unstable_word','index_block')),true);
   elsif target='energy' then deck:=jsonb_build_array('ZUMBI DE SANGUE','ESQUELETO DE LODO','ANÁRQUICO','EXISTIDO','ENRAIZADO','MARIONETE','VIAJANTE','CARNIÇAL PRETO DA MORTE','ENPAP-X','DEGOLIFICADA','MAGISTRADA','DEUS DA MORTE','DIABO','ANFITRIÃO');ev:=jsonb_build_object('phase','trail','active_side','PLAYERS','position',0,'overload',0,'pulse',1+floor(random()*4)::int,'turn',1,'checkpoints',jsonb_build_array(6,13),'forks',jsonb_build_array(3,9,15),'last_card',null,'last_effect','Aguardando pulso.','vote_phase','energy:t1');sec:=jsonb_set(sec,'{energy}',jsonb_build_object('deck',deck,'index',0,'hand','[]'::jsonb),true);
   elsif target='blood' then seconds:=greatest(12,least(18,coalesce((p_payload->>'beat_seconds')::int,15)));ev:=jsonb_build_object('phase','master_prepare','active_side','MASTER','beat',1,'beat_seconds',seconds,'stabilization',0,'hemorrhage',0,'readings','[]'::jsonb,'selected_valve',null,'vote_phase',null);sec:=jsonb_set(sec,'{blood}',jsonb_build_object('beat_index',1,'answer',null,'answer_locked',false,'choices',pani_private.containment_blood_choices(1),'fake_votes',null),true);
   else ev:=jsonb_build_object('phase','master_prepare','active_side','MASTER','cycle',1,'anchor',null,'attempts',0,'changed_visuals','[]'::jsonb,'vote_phase',null);sec:=jsonb_set(sec,'{death}',jsonb_build_object('cycle',1,'answer',null,'choices',pani_private.containment_death_choices(1,null)),true);end if;
   st:=jsonb_set(st,'{event}',ev,true);
 elsif p_action='set_representative' then rep:=coalesce(p_payload->>'crew_id','');if st->>'active_event' not in('energy','blood') then raise exception 'representative_not_required';end if;if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=rep and p.joined) then raise exception 'representative_unavailable';end if;st:=jsonb_set(st,'{representative_id}',to_jsonb(rep),true);
 elsif p_action='skip_player' then rep:=coalesce(p_payload->>'crew_id','');if rep='' or rep=st->>'representative_id' then raise exception 'select_next_player';end if;if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=rep and p.joined) then raise exception 'representative_unavailable';end if;st:=jsonb_set(st,'{representative_id}',to_jsonb(rep),true);
 elsif p_action='knowledge_master' then if st->>'active_event'<>'knowledge' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;card:=coalesce(p_payload->>'card','pass');if card='shuffle' then ev:=jsonb_set(ev,'{words}',(select jsonb_agg(x order by random()) from jsonb_array_elements(ev->'words')x),true);elsif card='ghost_connection' then ev:=ev||jsonb_build_object('ghost_words',(select jsonb_agg(x) from (select x from jsonb_array_elements_text(ev->'words')x limit 4)q));elsif card='unstable_word' then ev:=ev||jsonb_build_object('unstable_word',ev#>>'{words,0}');elsif card='index_block' then ev:=ev||jsonb_build_object('blocked_word',ev#>>'{words,0}');elsif card<>'pass' then raise exception 'invalid_corruption';end if;ev:=ev||jsonb_build_object('active_side','PLAYERS','vote_phase','knowledge:g'||(jsonb_array_length(coalesce(ev->'solved','[]'::jsonb))+1));
 elsif p_action='energy_threat' then if st->>'active_event'<>'energy' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;card:=upper(coalesce(p_payload->>'card','PASSAR'));if card<>'PASSAR' and not (sec#>'{energy,hand}' @> jsonb_build_array(card)) then raise exception 'invalid_threat';end if;pos:=coalesce((ev->>'position')::int,0);overload:=coalesce((ev->>'overload')::int,0);effect:='A entidade passou.';if card='ZUMBI DE SANGUE' then pos:=greatest(0,pos-2);effect:='Recuo 2.';elsif card='ESQUELETO DE LODO' then pos:=greatest(0,pos-1);effect:='Retorno de lodo: recuo 1.';elsif card='ANÁRQUICO' then pos:=greatest(0,pos-2);effect:='Caos: recuo 2.';elsif card in('EXISTIDO','ENRAIZADO','MARIONETE','VIAJANTE') then overload:=overload+1;effect:=card||': +1 sobrecarga.';elsif card in('CARNIÇAL PRETO DA MORTE','DIABO') then overload:=overload+2;pos:=greatest(0,pos-1);effect:=card||': +2 sobrecarga e recuo 1.';elsif card<>'PASSAR' then overload:=overload+1;effect:=card||': +1 sobrecarga.';end if;if overload>=7 then pos:=case when pos>=13 then 13 when pos>=6 then 6 else 0 end;overload:=4;st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)));end if;idx:=coalesce((sec#>>'{energy,index}')::int,0)+3;sec:=jsonb_set(sec,'{energy,index}',to_jsonb(idx),true);sec:=jsonb_set(sec,'{energy,hand}','[]'::jsonb,true);ev:=ev||jsonb_build_object('phase','trail','active_side','PLAYERS','position',pos,'overload',overload,'pulse',1+floor(random()*4)::int,'turn',coalesce((ev->>'turn')::int,1)+1,'last_card',card,'last_effect',effect,'vote_phase','energy:t'||(coalesce((ev->>'turn')::int,1)+1));
 elsif p_action='blood_choose' then if st->>'active_event'<>'blood' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;idx:=greatest(0,least(2,coalesce((p_payload->>'index')::int,0)));choice:=sec#>'{blood,choices}'->idx;if choice is null then raise exception 'invalid_challenge';end if;answer:=choice->>'answer';sec:=jsonb_set(sec,'{blood,answer}',to_jsonb(answer),true);sec:=jsonb_set(sec,'{blood,answer_locked}','true',true);ev:=ev||jsonb_build_object('phase','beats','active_side','PLAYERS','readings',choice->'readings','selected_valve',null,'vote_phase','blood:beat'||coalesce(ev->>'beat','1'));seconds:=coalesce((ev->>'beat_seconds')::int,15);st:=st||jsonb_build_object('timer_end',(now()+make_interval(secs=>seconds))::text);
 elsif p_action='death_mutation' then if st->>'active_event'<>'death' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;idx:=greatest(0,least(2,coalesce((p_payload->>'index')::int,0)));choice:=sec#>'{death,choices}'->idx;if choice is null then raise exception 'invalid_mutation';end if;answer:=choice->>'answer';if answer=ev->>'anchor' then raise exception 'anchor_protected';end if;sec:=jsonb_set(sec,'{death,answer}',to_jsonb(answer),true);ev:=ev||jsonb_build_object('phase','cycles','active_side','PLAYERS','scene_kind',choice#>>'{public,scene_kind}','changed_visuals',choice#>'{public,changed_visuals}','vote_phase','death:c'||coalesce(ev->>'cycle','1')); 
 else return public.pani_containment_master_action(p_pin,p_action,p_payload);end if;
 st:=jsonb_set(st,'{event}',ev,true);update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';perform pani_private.containment_log_event('W77-01','MASTER',p_action,st->>'active_event');return public.pani_containment_master_state(p_pin);
end $$;

revoke execute on function public.pani_containment_crew_action_v12(text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.pani_containment_master_action_v12(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_containment_crew_action_v12(text,text,jsonb) to anon,authenticated,service_role;
grant execute on function public.pani_containment_master_action_v12(text,text,jsonb) to anon,authenticated,service_role;
comment on function public.pani_containment_crew_action_v12(text,text,jsonb) is 'Acoes da equipe v1.2 com active_side, Conexo e validacao server-side.';
comment on function public.pani_containment_master_action_v12(text,text,jsonb) is 'Acoes adversariais exclusivas do Mestre v1.2.';
