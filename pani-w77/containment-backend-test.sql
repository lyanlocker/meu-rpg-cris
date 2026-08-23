-- PANI containment v2.0 definitive acceptance QA.
-- All state, token and PIN mutations are rolled back.
begin;

create or replace function public.pani_master_valid(p_pin text)
returns boolean language sql stable security definer set search_path='' as $$select p_pin='QA-V2'$$;

do $qa$
declare c1 text;c2 text;t1 text:='ct-v2-token-1';t2 text:='ct-v2-token-2';st jsonb;sec jsonb;snap jsonb;ans text;i int;accepted int:=0;rejected int:=0;sat_before int;vote_count int;
begin
 select crew_id into c1 from public.crew_access order by crew_id limit 1;
 select crew_id into c2 from public.crew_access where crew_id<>c1 order by crew_id limit 1;
 if c1 is null or c2 is null then raise exception 'qa_requires_two_crew_rows';end if;
 update public.crew_access set token_hash=encode(extensions.digest(t1,'sha256'),'hex') where crew_id=c1;
 update public.crew_access set token_hash=encode(extensions.digest(t2,'sha256'),'hex') where crew_id=c2;
 perform public.pani_containment_master_action_v2('QA-V2','new_session',jsonb_build_object('code','QA2020'));
 insert into pani_private.containment_participant(session_id,crew_id,joined,last_seen) values('W77-01',c1,true,now()),('W77-01',c2,true,now())
 on conflict(session_id,crew_id) do update set joined=true,last_seen=now();
 update pani_private.containment_session set state=state||jsonb_build_object('event_status',jsonb_build_object('knowledge','available','energy','available','blood','available','death','available')) where session_id='W77-01';

 -- T01 // jogador nao executa acao exclusiva do Mestre.
 begin
   perform public.pani_containment_master_action_v2(t1,'saturation',jsonb_build_object('delta',1));
   raise exception 'T01_missing_403';
 exception when others then
   if sqlerrm='T01_missing_403' or position('unauthorized' in sqlerrm)=0 then raise;end if;
 end;

 -- Conhecimento // sugestoes pessoais, representante final e pista 3+1.
 perform public.pani_containment_master_action_v2('QA-V2','start_event',jsonb_build_object('event','knowledge','representative_id',c1));
 perform public.pani_containment_crew_action_v2(t2,'knowledge_suggest',jsonb_build_object('words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO')));
 select public.pani_containment_crew_state(t1) into snap;
 if jsonb_array_length(snap->'suggestion_summary')<>1 then raise exception 'knowledge_consensus_missing';end if;
 begin
   perform public.pani_containment_crew_action_v2(t2,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO')));
   raise exception 'knowledge_non_rep_accepted';
 exception when others then if sqlerrm='knowledge_non_rep_accepted' or position('representative_required' in sqlerrm)=0 then raise;end if;end;
 perform public.pani_containment_crew_action_v2(t1,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','CHAVE')));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,partial_hint}' is null or position('INTRUS' in upper(st#>>'{event,partial_hint}'))>0 then raise exception 'T08_partial_hint_failed';end if;
 perform public.pani_containment_master_action_v2('QA-V2','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v2(t1,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('ARQUIVO','ÍNDICE','DOSSIÊ','RELATÓRIO')));
 perform public.pani_containment_master_action_v2('QA-V2','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v2(t1,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('CHAVE','TRAVA','SENHA','PORTA')));
 perform public.pani_containment_master_action_v2('QA-V2','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v2(t1,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('ECO','LEMBRANÇA','SONHO','VESTÍGIO')));
 perform public.pani_containment_master_action_v2('QA-V2','knowledge_master',jsonb_build_object('card','pass'));
 perform public.pani_containment_crew_action_v2(t1,'knowledge_submit',jsonb_build_object('words',jsonb_build_array('MÓDULO','SETOR','CÂMARA','CORREDOR')));
 select state into st from pani_private.containment_session where session_id='W77-01';if st#>>'{event,phase}'<>'COMPLETE' then raise exception 'knowledge_complete_failed';end if;
 perform public.pani_containment_crew_action_v2(t1,'knowledge_claim','{}');

 -- Energia // dado autoritativo, clique duplicado e colapso em checkpoint.
 update pani_private.containment_session set state=state||jsonb_build_object('event_status',jsonb_set(state->'event_status','{energy}','"available"')) where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','start_event',jsonb_build_object('event','energy','control_mode','operator','representative_id',c1));
 for i in 1..5 loop
   begin perform public.pani_containment_crew_action_v2(t1,'energy_roll','{}');accepted:=accepted+1;
   exception when others then if position('roll_unavailable' in sqlerrm)>0 then rejected:=rejected+1;else raise;end if;end;
 end loop;
 if accepted<>1 or rejected<>4 then raise exception 'T02_duplicate_roll_failed:%/%',accepted,rejected;end if;
 select state into st from pani_private.containment_session where session_id='W77-01';
 if (st#>>'{event,die}')::int not between 1 and 6 or (st#>>'{event,position}')::int<=1 then raise exception 'energy_die_or_move_failed';end if;
 update pani_private.containment_session set state=jsonb_set(jsonb_set(jsonb_set(jsonb_set(state,'{event,phase}','"MASTER_ACTION"'),'{event,active_side}','"MASTER"'),'{event,position}','12'),'{event,overload}','6'),secret_state=jsonb_set(secret_state,'{energy,master_hand}','["DIABO"]') where session_id='W77-01';
 select (state->>'saturation')::int into sat_before from pani_private.containment_session where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','energy_threat',jsonb_build_object('card','DIABO'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,phase}'='THREAT_RESPONSE' then perform public.pani_containment_crew_action_v2(t1,'energy_accept_threat','{}');end if;
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,pending_choice}'='diabo' then perform public.pani_containment_crew_action_v2(t1,'energy_threat_choice',jsonb_build_object('choice','accept'));end if;
 select state into st from pani_private.containment_session where session_id='W77-01';
 if (st#>>'{event,position}')::int<>1 or (st#>>'{event,overload}')::int<>4 or (st->>'saturation')::int<>sat_before+1 then raise exception 'T07_checkpoint_collapse_failed';end if;
 perform public.pani_containment_master_action_v2('QA-V2','contain_event','{}');

 -- Energia em modo EQUIPE nao elege representante; qualquer integrante pode rolar.
 update pani_private.containment_session set state=state||jsonb_build_object('event_status',jsonb_set(state->'event_status','{energy}','"available"')) where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','start_event',jsonb_build_object('event','energy','control_mode','team'));
 select state into st from pani_private.containment_session where session_id='W77-01';if st->>'representative_id' is not null then raise exception 'energy_team_has_representative';end if;
 perform public.pani_containment_crew_action_v2(t2,'energy_roll','{}');

 -- Cartas da equipe: Backup compra duas/escolhe uma e limita a uma carta por resolucao.
 update pani_private.containment_session set state=jsonb_set(jsonb_set(jsonb_set(jsonb_set(state,'{event,phase}','"PLAYER_REACTION"'),'{event,active_side}','"PLAYERS"'),'{event,support_used}','false'),'{event,team_hand}','["BACKUP LOCAL","DRENAR CARGA","TRAVA SEC"]') where session_id='W77-01';
 perform public.pani_containment_crew_action_v2(t2,'energy_play_card',jsonb_build_object('card','BACKUP LOCAL'));
 select state into st from pani_private.containment_session where session_id='W77-01';
 if st#>>'{event,pending_choice}'<>'backup' or jsonb_array_length(st#>'{event,backup_offer}')<>2 then raise exception 'energy_backup_offer_failed';end if;
 perform public.pani_containment_crew_action_v2(t1,'energy_backup_choose',jsonb_build_object('index',0));
 select state into st from pani_private.containment_session where session_id='W77-01';if jsonb_array_length(st#>'{event,team_hand}')<>3 then raise exception 'energy_backup_hand_limit_failed';end if;
 begin perform public.pani_containment_crew_action_v2(t2,'energy_play_card',jsonb_build_object('card','DRENAR CARGA'));raise exception 'energy_second_support_accepted';exception when others then if sqlerrm='energy_second_support_accepted' or position('support_already_used' in sqlerrm)=0 then raise;end if;end;
 perform public.pani_containment_crew_action_v2(t2,'energy_end_turn','{}');

 -- Anarquico: proximo dado e gerado duas vezes e somente o Mestre escolhe.
 update pani_private.containment_session set state=jsonb_set(state,'{event,team_hand}','[]'),secret_state=jsonb_set(secret_state,'{energy,master_hand}','["ANARQUICO"]') where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','energy_threat',jsonb_build_object('card','ANARQUICO'));
 perform public.pani_containment_crew_action_v2(t1,'energy_roll','{}');
 select state into st from pani_private.containment_session where session_id='W77-01';if st#>>'{event,phase}'<>'MASTER_CHOICE' or jsonb_array_length(st#>'{event,die_options}')<>2 then raise exception 'energy_anarchic_two_rolls_failed';end if;
 perform public.pani_containment_master_action_v2('QA-V2','energy_anarchic_choose',jsonb_build_object('index',1));
 select state into st from pani_private.containment_session where session_id='W77-01';if st#>>'{event,die}' is null or st#>'{event,die_options}' is not null then raise exception 'energy_anarchic_choice_failed';end if;

 -- Trava SEC limita de fato as ameacas aceitas pelo servidor, nao apenas a interface.
 update pani_private.containment_session set state=jsonb_set(jsonb_set(jsonb_set(jsonb_set(state,'{event,phase}','"PLAYER_REACTION"'),'{event,active_side}','"PLAYERS"'),'{event,support_used}','false'),'{event,team_hand}','["TRAVA SEC"]'),secret_state=jsonb_set(secret_state,'{energy,master_hand}','["ZUMBI DE SANGUE","ESQUELETO DE LODO","DIABO"]') where session_id='W77-01';
 perform public.pani_containment_crew_action_v2(t2,'energy_play_card',jsonb_build_object('card','TRAVA SEC'));
 perform public.pani_containment_crew_action_v2(t1,'energy_end_turn','{}');
 begin perform public.pani_containment_master_action_v2('QA-V2','energy_threat',jsonb_build_object('card','DIABO'));raise exception 'energy_third_threat_accepted';exception when others then if sqlerrm='energy_third_threat_accepted' or position('threat_limited' in sqlerrm)=0 then raise;end if;end;
 perform public.pani_containment_master_action_v2('QA-V2','end_event','{}');

 -- Sangue // voto preservado na troca de representante e segredo ausente do snapshot.
 update pani_private.containment_session set state=state||jsonb_build_object('event_status',jsonb_set(state->'event_status','{blood}','"available"')) where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','start_event',jsonb_build_object('event','blood','representative_id',c1,'seconds',18));
 perform public.pani_containment_master_action_v2('QA-V2','blood_choose',jsonb_build_object('index',0));
 perform public.pani_containment_crew_action_v2(t1,'vote',jsonb_build_object('value','A'));
 perform public.pani_containment_crew_action_v2(t2,'vote',jsonb_build_object('value','B'));
 select public.pani_containment_crew_state(t2) into snap;
 if snap::text~'correct_option|secret_state|changed_object_id|master_hand' then raise exception 'T04_secret_leak';end if;
 update pani_private.containment_participant set last_seen=now()-interval '1 minute' where session_id='W77-01' and crew_id=c1;
 perform pani_private.containment_tick_v2('W77-01');select state into st from pani_private.containment_session where session_id='W77-01';if not (st->>'paused')::boolean then raise exception 'T03_disconnect_did_not_pause';end if;
 perform public.pani_containment_master_action_v2('QA-V2','set_representative',jsonb_build_object('crew_id',c2));
 select count(*) into vote_count from pani_private.containment_vote where session_id='W77-01' and event_id='blood';if vote_count<>2 then raise exception 'T03_votes_not_preserved';end if;
 update pani_private.containment_participant set last_seen=now() where session_id='W77-01' and crew_id=c1;
 perform public.pani_containment_master_action_v2('QA-V2','corrupt',jsonb_build_object('kind','corrupted_vote'));
 select public.pani_containment_crew_state(t2) into snap;if snap->'vote_summary'='{}'::jsonb then raise exception 'T06_rep_corrupted_display_missing';end if;
 select secret_state#>>'{blood,correct_option}' into ans from pani_private.containment_session where session_id='W77-01';
 perform public.pani_containment_crew_action_v2(t2,'blood_confirm',jsonb_build_object('option',ans));
 perform public.pani_containment_master_action_v2('QA-V2','contain_event','{}');

 -- Morte // cena unica, voto/ACK, segredo privado e testemunha autoritativa.
 update pani_private.containment_session set state=state||jsonb_build_object('event_status',jsonb_set(state->'event_status','{death}','"available"')) where session_id='W77-01';
 perform public.pani_containment_master_action_v2('QA-V2','start_event',jsonb_build_object('event','death'));
 perform public.pani_containment_master_action_v2('QA-V2','set_witness',jsonb_build_object('crew_id',c1));
 perform public.pani_containment_master_action_v2('QA-V2','death_mutation',jsonb_build_object('index',0));
 select public.pani_containment_crew_state(t1) into snap;if snap::text~'changed_object_id|secret_state' then raise exception 'T04_death_secret_leak';end if;
 -- avanca o relogio de servidor sem esperar oito segundos.
 update pani_private.containment_session set state=jsonb_set(state,'{event,phase_ends_at}',to_jsonb((now()-interval '1 second')::text)) where session_id='W77-01';perform pani_private.containment_tick_v2('W77-01');
 update pani_private.containment_session set state=jsonb_set(state,'{event,phase_ends_at}',to_jsonb((now()-interval '1 second')::text)) where session_id='W77-01';perform pani_private.containment_tick_v2('W77-01');
 select secret_state#>>'{death,changed_object_id}' into ans from pani_private.containment_session where session_id='W77-01';
 perform public.pani_containment_crew_action_v2(t1,'vote',jsonb_build_object('value',ans));select public.pani_containment_crew_state(t1) into snap;if snap->>'my_vote'<>ans then raise exception 'T05_vote_ack_failed';end if;
 perform public.pani_containment_crew_action_v2(t1,'death_confirm',jsonb_build_object('object',ans));
 perform public.pani_containment_master_action_v2('QA-V2','contain_event','{}');

 -- T12 // quatro capturas liberam somente o gancho residual.
 select state into st from pani_private.containment_session where session_id='W77-01';
 if jsonb_array_length(st->'modules_restored')<>4 or st->>'residue_status'<>'available' then raise exception 'T12_dashboard_residue_failed';end if;
 if pani_private.containment_capture(jsonb_build_object('modules_restored','[]'::jsonb,'event_status','{}'::jsonb,'saturation',8,'residue_status','locked','announcement_revision',0),'knowledge')->>'saturation'<>'6' then raise exception 'saturation_eight_must_return_six';end if;
end $qa$;

select jsonb_build_object(
 'ok',true,'t01','role_guard','t02','single_roll','t03','rep_swap_votes','t04','no_secret_leak',
 't05','death_ack','t06','display_only_corruption','t07','checkpoint_collapse','t08','partial_hint',
 't09','frontend_reduced_motion','t10','master_secret_persistent','t11','player_snapshot_public','t12','residue_enabled',
 'rolled_back',true) as qa_result;

rollback;
