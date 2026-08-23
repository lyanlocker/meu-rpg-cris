-- PANI containment v1.3 end-to-end QA.
-- Every mutation is rolled back, including the temporary token hashes and PIN validator.
begin;

create or replace function public.pani_master_valid(p_pin text)
returns boolean language sql stable security definer set search_path='' as $$select p_pin='QA'$$;

update public.crew_access set token_hash=encode(extensions.digest('ctqa-token-1','sha256'),'hex') where crew_id='ctqa_1';
update public.crew_access set token_hash=encode(extensions.digest('ctqa-token-2','sha256'),'hex') where crew_id='ctqa_2';

do $qa$
declare st jsonb; ans text; i int;
begin
 perform public.pani_containment_master_action_v12('QA','new_session',jsonb_build_object('code','QA1313'));
 insert into pani_private.containment_participant(session_id,crew_id,joined,last_seen) values
  ('W77-01','ctqa_1',true,now()),('W77-01','ctqa_2',true,now())
 on conflict(session_id,crew_id) do update set joined=true,last_seen=now();
 update pani_private.containment_session set state=state||jsonb_build_object(
  'event_status',jsonb_build_object('knowledge','available','energy','available','blood','available','death','available'),
  'active_event',null,'event','{}'::jsonb,'status','lobby') where session_id='W77-01';

 -- Energia coletiva: qualquer integrante pode movimentar.
 perform public.pani_containment_master_action_v12('QA','start_event',jsonb_build_object('event','energy','control_mode','team'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,control_mode}'<>'team' or st->>'representative_id' is not null then raise exception 'qa_team_mode_failed';end if;
 perform public.pani_containment_crew_action_v12('ctqa-token-2','energy_move',jsonb_build_object('route','stable'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,active_side}'<>'MASTER' or (st#>>'{event,player_position}')::int<1 then raise exception 'qa_team_move_failed';end if;

 -- O Mestre possui peça própria, movimento e vitória.
 update pani_private.containment_session set state=jsonb_set(jsonb_set(state,'{event,master_position}','18'::jsonb),'{event,master_pulse}','1'::jsonb) where session_id='W77-01';
 perform public.pani_containment_master_action_v12('QA','energy_threat',jsonb_build_object('card','PASSAR'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,winner}'<>'MASTER' or st#>>'{event,phase}'<>'finished' or (st#>>'{event,master_position}')::int<>19 then raise exception 'qa_master_victory_failed';end if;
 perform public.pani_containment_master_action_v12('QA','energy_rematch','{}'::jsonb);
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,phase}'<>'race' or (st#>>'{event,player_position}')::int<>0 or (st#>>'{event,master_position}')::int<>0 then raise exception 'qa_rematch_failed';end if;

 -- A Equipe também pode vencer e concluir a contenção.
 update pani_private.containment_session set state=jsonb_set(jsonb_set(state,'{event,player_position}','18'::jsonb),'{event,pulse}','1'::jsonb) where session_id='W77-01';
 perform public.pani_containment_crew_action_v12('ctqa-token-2','energy_move',jsonb_build_object('route','stable'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,winner}'<>'PLAYERS' or (st#>>'{event,player_position}')::int<>19 then raise exception 'qa_players_victory_failed';end if;
 perform public.pani_containment_crew_action_v12('ctqa-token-2','energy_claim','{}'::jsonb);
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st->>'active_event' is not null or st#>>'{event_status,energy}'<>'contained' or st->'event'<>'{}'::jsonb then raise exception 'qa_energy_capture_failed';end if;

 -- Energia por operador: outro jogador é rejeitado e pode assumir ao pular o ausente.
 update pani_private.containment_session set state=state||jsonb_build_object('active_event',null,'event','{}'::jsonb,'status','lobby','event_status',jsonb_set(state->'event_status','{energy}','"available"'::jsonb)) where session_id='W77-01';
 perform public.pani_containment_master_action_v12('QA','start_event',jsonb_build_object('event','energy','control_mode','operator','representative_id','ctqa_1'));
 begin
  perform public.pani_containment_crew_action_v12('ctqa-token-2','energy_move',jsonb_build_object('route','stable'));
  raise exception 'qa_expected_rejection_missing';
 exception when others then
  if sqlerrm='qa_expected_rejection_missing' or position('representative_required' in sqlerrm)=0 then raise;end if;
 end;
 perform public.pani_containment_crew_action_v12('ctqa-token-1','energy_move',jsonb_build_object('route','stable'));
 perform public.pani_containment_master_action_v12('QA','skip_player',jsonb_build_object('crew_id','ctqa_2'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st->>'representative_id'<>'ctqa_2' then raise exception 'qa_skip_operator_failed';end if;
 begin
  perform public.pani_containment_master_action_v12('QA','energy_threat',jsonb_build_object('card','CARTA INEXISTENTE'));
  raise exception 'qa_expected_card_rejection_missing';
 exception when others then
  if sqlerrm='qa_expected_card_rejection_missing' or position('invalid_threat' in sqlerrm)=0 then raise;end if;
 end;

 -- Conhecimento: todos participam, quatro grupos e estado limpo após conter.
 update pani_private.containment_session set state=state||jsonb_build_object('active_event',null,'event','{}'::jsonb,'status','lobby','representative_id',null,'event_status',jsonb_set(state->'event_status','{knowledge}','"available"'::jsonb)) where session_id='W77-01';
 perform public.pani_containment_master_action_v12('QA','start_event',jsonb_build_object('event','knowledge'));
 perform public.pani_containment_crew_action_v12('ctqa-token-2','knowledge_submit',jsonb_build_object('words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO')));
 perform public.pani_containment_master_action_v12('QA','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v12('ctqa-token-1','knowledge_submit',jsonb_build_object('words',jsonb_build_array('CHAVE','TRAVA','SENHA','PORTA')));
 perform public.pani_containment_master_action_v12('QA','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v12('ctqa-token-2','knowledge_submit',jsonb_build_object('words',jsonb_build_array('ECO','LEMBRANÇA','SONHO','VESTÍGIO')));
 perform public.pani_containment_master_action_v12('QA','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v12('ctqa-token-1','knowledge_submit',jsonb_build_object('words',jsonb_build_array('MÓDULO','SETOR','CÂMARA','CORREDOR')));
 perform public.pani_containment_crew_action_v12('ctqa-token-2','knowledge_contain','{}'::jsonb);
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event_status,knowledge}'<>'contained' or st->'event'<>'{}'::jsonb then raise exception 'qa_knowledge_flow_failed';end if;

 -- Sangue: quatro batimentos, operador e selo coletivo.
 update pani_private.containment_session set state=state||jsonb_build_object('active_event',null,'event','{}'::jsonb,'status','lobby','event_status',jsonb_set(state->'event_status','{blood}','"available"'::jsonb)) where session_id='W77-01';
 perform public.pani_containment_master_action_v12('QA','start_event',jsonb_build_object('event','blood','representative_id','ctqa_1','beat_seconds',15));
 for i in 1..4 loop
  perform public.pani_containment_master_action_v12('QA','blood_choose',jsonb_build_object('index',0));
  select secret_state#>>'{blood,answer}' into ans from pani_private.containment_session where session_id='W77-01';
  perform public.pani_containment_crew_action_v12('ctqa-token-1','blood_select',jsonb_build_object('valve',ans));
  update pani_private.containment_session set state=jsonb_set(state,'{timer_end}',to_jsonb((now()-interval '1 second')::text),true) where session_id='W77-01';
  perform pani_private.containment_tick('W77-01');
 end loop;
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,phase}'<>'final' or (st#>>'{event,stabilization}')::int<>4 then raise exception 'qa_blood_beats_failed';end if;
 perform public.pani_containment_crew_action_v12('ctqa-token-1','blood_contain','{}'::jsonb);
 perform public.pani_containment_crew_action_v12('ctqa-token-2','blood_seal',jsonb_build_object('seal','A'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event_status,blood}'<>'contained' then raise exception 'qa_blood_capture_failed';end if;

 -- Morte: quatro ciclos adversariais e confirmação simultânea final.
 update pani_private.containment_session set state=state||jsonb_build_object('active_event',null,'event','{}'::jsonb,'status','lobby','event_status',jsonb_set(state->'event_status','{death}','"available"'::jsonb)) where session_id='W77-01';
 perform public.pani_containment_master_action_v12('QA','start_event',jsonb_build_object('event','death'));
 for i in 1..4 loop
  perform public.pani_containment_master_action_v12('QA','set_witness',jsonb_build_object('crew_id',case when i%2=1 then 'ctqa_1' else 'ctqa_2' end));
  perform public.pani_containment_master_action_v12('QA','death_mutation',jsonb_build_object('index',0));
  select secret_state#>>'{death,answer}' into ans from pani_private.containment_session where session_id='W77-01';
  if i%2=1 then perform public.pani_containment_crew_action_v12('ctqa-token-1','death_confirm',jsonb_build_object('object',ans));
  else perform public.pani_containment_crew_action_v12('ctqa-token-2','death_confirm',jsonb_build_object('object',ans));end if;
 end loop;
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,phase}'<>'final' or (st#>>'{event,cycle}')::int<>4 then raise exception 'qa_death_cycles_failed';end if;
 perform public.pani_containment_crew_action_v12('ctqa-token-1','death_hold','{}'::jsonb);
 perform public.pani_containment_crew_action_v12('ctqa-token-2','death_hold','{}'::jsonb);
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event_status,death}'<>'contained' then raise exception 'qa_death_capture_failed';end if;
end
$qa$;

select jsonb_build_object(
 'ok',true,
 'energy','team_operator_master_players_rematch_pass',
 'knowledge','four_groups_pass',
 'blood','four_beats_and_seal_pass',
 'death','four_cycles_and_hold_pass',
 'rolled_back',true
) as qa_result;

rollback;
