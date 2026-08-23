-- ADUNATIO // PROTOCOLO PANI // EVENTOS DE CONTENCAO v2.0 DEFINITIVO
-- Migracao incremental sobre containment-v1.sql e containment-v1-2.sql.
-- O servidor permanece autoritativo; snapshots de jogador nunca contem respostas.

alter table pani_private.containment_vote drop constraint if exists containment_vote_value_check;
alter table pani_private.containment_vote
  add constraint containment_vote_value_check check (char_length(value) between 1 and 240);

create or replace function pani_private.containment_default_state()
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object(
    'protocol_version','containment_v2_0','released',false,'status','dormant',
    'active_event',null,'saturation',0,'modules_restored','[]'::jsonb,
    'event_status',jsonb_build_object('knowledge','detected','energy','detected','blood','detected','death','detected'),
    'representative_id',null,'witness_id',null,'corruption_charges',2,
    'paused',false,'pause_reason',null,'timer_remaining',null,
    'glitch',jsonb_build_object('revision',0,'duration_ms',0,'at',null),
    'announcement',null,'announcement_revision',0,'residue_status','locked','event','{}'::jsonb)
$$;

create or replace function pani_private.containment_default_secret()
returns jsonb language sql stable set search_path='' as $$
  select jsonb_build_object('knowledge','{}'::jsonb,'energy','{}'::jsonb,'blood','{}'::jsonb,'death','{}'::jsonb,'corruption',null)
$$;

create or replace function pani_private.containment_capture(p_state jsonb,p_event text)
returns jsonb language plpgsql immutable set search_path='' as $$
declare st jsonb:=p_state;mods jsonb;statuses jsonb;n int;sat int;
begin
 mods:=coalesce(st->'modules_restored','[]');if not mods @> jsonb_build_array(p_event) then mods:=mods||jsonb_build_array(p_event);end if;
 statuses:=jsonb_set(coalesce(st->'event_status','{}'),array[p_event],'"contained"',true);n:=jsonb_array_length(mods);sat:=coalesce((st->>'saturation')::int,0);sat:=case when sat>=8 then 6 else greatest(0,sat-1) end;
 return st||jsonb_build_object('modules_restored',mods,'event_status',statuses,'active_event',null,'status',case when n=4 then 'contained' else 'lobby' end,'representative_id',null,'witness_id',null,'paused',false,'timer_end',null,'timer_remaining',null,'saturation',sat,'event','{}'::jsonb,'residue_status',case when n=4 then 'available' else coalesce(st->>'residue_status','locked') end,'announcement',case when n=4 then 'QUATRO ASSINATURAS RECAPTURADAS. VARREDURA LIMPA DISPONIVEL.' else 'ASSINATURA RECAPTURADA. MODULO PANI RESTAURADO.' end,'announcement_revision',coalesce((st->>'announcement_revision')::int,0)+1);
end $$;

create or replace function pani_private.containment_v2_team_deck()
returns jsonb language sql immutable set search_path='' as $$
 select '["RECALIBRAR","ESCUDO PANI","ATALHO DE MANUTENCAO","ROTA SEGURA","BACKUP LOCAL","DRENAR CARGA","IMPULSO CRT","TRAVA SEC","SCAN DE ROTA","BATERIA AUXILIAR","DESVIO","REDE ESTAVEL"]'::jsonb
$$;

create or replace function pani_private.containment_v2_threat_deck()
returns jsonb language sql immutable set search_path='' as $$
 select '["ZUMBI DE SANGUE","ESQUELETO DE LODO","ANARQUICO","EXISTIDO","ENRAIZADO","MARIONETE","VIAJANTE","CARNICAL PRETO DA MORTE","ENPAP-X","DEGOLIFICADA","MAGISTRADA","DEUS DA MORTE","DIABO","ANFITRIAO"]'::jsonb
$$;

create or replace function pani_private.containment_v2_board()
returns jsonb language sql immutable set search_path='' as $$
 select '[
  {"n":1,"type":"start","label":"INICIO"},{"n":2,"type":"draw","label":"CARTA PANI"},
  {"n":3,"type":"back","value":1,"label":"RECUAR 1"},{"n":4,"type":"neutral","label":"NEUTRA"},
  {"n":5,"type":"overload","value":1,"label":"SOBRECARGA +1"},{"n":6,"type":"draw","label":"CARTA PANI"},
  {"n":7,"type":"advance","value":1,"label":"AVANCAR 1"},{"n":8,"type":"neutral","label":"NEUTRA"},
  {"n":9,"type":"checkpoint","label":"CHECKPOINT A"},{"n":10,"type":"draw","label":"CARTA PANI"},
  {"n":11,"type":"back","value":2,"label":"RECUAR 2"},{"n":12,"type":"roll_again","label":"ROLAR DE NOVO"},
  {"n":13,"type":"neutral","label":"NEUTRA"},{"n":14,"type":"draw","label":"CARTA PANI"},
  {"n":15,"type":"overload","value":1,"label":"SOBRECARGA +1"},{"n":16,"type":"advance","value":2,"label":"AVANCAR 2"},
  {"n":17,"type":"stabilize","value":1,"label":"ESTABILIZAR -1"},{"n":18,"type":"checkpoint","label":"CHECKPOINT B"},
  {"n":19,"type":"draw","label":"CARTA PANI"},{"n":20,"type":"shortcut","label":"ATALHO ARRISCADO"},
  {"n":21,"type":"back","value":1,"label":"RECUAR 1"},{"n":22,"type":"draw","label":"CARTA PANI"},
  {"n":23,"type":"overload","value":1,"label":"SOBRECARGA +1"},{"n":24,"type":"finish","label":"CONTENCAO"}
 ]'::jsonb
$$;

create or replace function pani_private.containment_v2_blood_challenges(p_round integer)
returns jsonb language sql immutable set search_path='' as $$
 select case ((greatest(p_round,1)-1)%4)+1
 when 1 then '[
  {"title":"RITMO FRATURADO","target":[2,5,2,8,2,5,2],"options":{"A":[2,5,2,7,2,5,2],"B":[2,5,2,8,2,5,2],"C":[2,7,2,7,2,7,2]},"correct":"B","rule":"ritmo"},
  {"title":"AMPLITUDE DUPLA","target":[2,8,2,4,2,8,2],"options":{"A":[2,8,2,4,2,8,2],"B":[2,6,2,6,2,6,2],"C":[2,4,2,8,2,4,2]},"correct":"A","rule":"amplitude"},
  {"title":"INTERVALO CEGO","target":[2,7,2,2,2,7,2],"options":{"A":[2,7,2,3,2,7,2],"B":[2,7,2,7,2,7,2],"C":[2,7,2,2,2,7,2]},"correct":"C","rule":"intervalo"}
 ]'::jsonb
 when 2 then '[
  {"title":"ECO TRIPLO","target":[3,7,3,7,3,7,3],"options":{"A":[3,7,3,7,3,7,3],"B":[3,7,3,4,3,7,3],"C":[3,5,3,7,3,5,3]},"correct":"A","rule":"repeticao"},
  {"title":"PULSO INVERTIDO","target":[7,2,7,4,7,2,7],"options":{"A":[2,7,2,4,2,7,2],"B":[7,2,7,4,7,2,7],"C":[7,3,7,3,7,3,7]},"correct":"B","rule":"hibrido"},
  {"title":"QUEDA ASSIMETRICA","target":[2,8,3,6,2,4,2],"options":{"A":[2,8,2,6,2,4,2],"B":[2,4,2,6,3,8,2],"C":[2,8,3,6,2,4,2]},"correct":"C","rule":"amplitude"}
 ]'::jsonb
 when 3 then '[
  {"title":"CADEIA 13","target":[2,6,4,8,4,6,2],"options":{"A":[2,6,4,8,4,6,2],"B":[2,6,2,8,2,6,2],"C":[4,6,4,6,4,6,4]},"correct":"A","rule":"hibrido"},
  {"title":"DENTE AUSENTE","target":[2,8,2,2,2,8,2],"options":{"A":[2,8,2,8,2,8,2],"B":[2,8,2,2,2,8,2],"C":[2,6,2,2,2,6,2]},"correct":"B","rule":"intervalo"},
  {"title":"RESSONANCIA","target":[3,7,2,7,3,7,2],"options":{"A":[3,7,3,7,3,7,3],"B":[2,7,2,7,2,7,2],"C":[3,7,2,7,3,7,2]},"correct":"C","rule":"repeticao"}
 ]'::jsonb
 else '[
  {"title":"PULSO DE CONTENCAO","target":[2,8,3,5,2,8,3],"options":{"A":[2,8,3,5,2,8,3],"B":[2,8,2,5,2,8,2],"C":[3,8,2,5,3,8,2]},"correct":"A","rule":"hibrido"},
  {"title":"RITMO RESIDUAL","target":[2,5,2,8,2,5,2],"options":{"A":[2,5,2,5,2,5,2],"B":[2,5,2,8,2,5,2],"C":[2,8,2,5,2,8,2]},"correct":"B","rule":"ritmo"},
  {"title":"ULTIMA LEITURA","target":[3,8,2,4,3,8,2],"options":{"A":[3,8,3,4,3,8,3],"B":[2,8,2,4,2,8,2],"C":[3,8,2,4,3,8,2]},"correct":"C","rule":"hibrido"}
 ]'::jsonb end
$$;

create or replace function pani_private.containment_v2_death_choices(p_cycle integer)
returns jsonb language sql immutable set search_path='' as $$
 select case greatest(1,least(4,p_cycle))
 when 1 then '[
  {"scene_id":"lab","changed_object_id":"clock","variant":"clock_stopped","label":"O relogio para"},
  {"scene_id":"lab","changed_object_id":"door","variant":"door_open","label":"A porta abre"},
  {"scene_id":"lab","changed_object_id":"desk_lamp","variant":"lamp_off","label":"A luminaria apaga"}]'::jsonb
 when 2 then '[
  {"scene_id":"archive","changed_object_id":"sample","variant":"sample_red","label":"A amostra muda de cor"},
  {"scene_id":"archive","changed_object_id":"monitor","variant":"monitor_static","label":"O monitor perde o sinal"},
  {"scene_id":"archive","changed_object_id":"chair","variant":"chair_shift","label":"A cadeira se desloca"}]'::jsonb
 when 3 then '[
  {"scene_id":"security","changed_object_id":"clipboard","variant":"clipboard_marked","label":"A prancheta recebe um registro"},
  {"scene_id":"security","changed_object_id":"crate","variant":"crate_open","label":"A caixa e aberta"},
  {"scene_id":"security","changed_object_id":"camera","variant":"camera_turn","label":"A camera gira"}]'::jsonb
 else '[
  {"scene_id":"maintenance","changed_object_id":"clock","variant":"clock_1313","label":"O horario muda"},
  {"scene_id":"maintenance","changed_object_id":"terminal","variant":"terminal_code","label":"O terminal troca o codigo"},
  {"scene_id":"maintenance","changed_object_id":"mug","variant":"mug_missing","label":"A caneca desaparece"}]'::jsonb end
$$;

create or replace function pani_private.containment_v2_death_objects()
returns jsonb language sql immutable set search_path='' as $$
 select '["clock","monitor","terminal","keyboard","desk_lamp","chair","mug","sample","microscope","server_rack","cabinet","door","camera","intercom","clipboard","crate","pipe"]'::jsonb
$$;

create or replace function pani_private.containment_v2_energy_resolve(p_state jsonb,p_secret jsonb,p_die integer)
returns jsonb language plpgsql volatile set search_path='' as $$
declare st jsonb:=p_state;sec jsonb:=p_secret;ev jsonb:=coalesce(p_state->'event','{}');board jsonb:=pani_private.containment_v2_board();
 pos int;origin int;overload int;checkpoint int;cell jsonb;ctype text;amount int;hand jsonb;deck jsonb;idx int;draw text;description text;roll_again boolean:=false;
begin
 origin:=greatest(1,least(24,coalesce((ev->>'position')::int,1)));
 overload:=greatest(0,coalesce((ev->>'overload')::int,0));checkpoint:=greatest(1,coalesce((ev->>'last_checkpoint')::int,1));
 pos:=least(24,origin+greatest(1,least(6,p_die)));
 cell:=board->(pos-1);ctype:=cell->>'type';amount:=coalesce((cell->>'value')::int,0);description:=cell->>'label';
 ev:=ev||jsonb_build_object('die',p_die,'roll_origin_position',origin,'roll_origin_overload',overload,'position',pos,'last_space',pos,'last_space_type',ctype,'last_effect',description,'pending_choice',null,'support_used',false,'scan_cells','[]'::jsonb);
 if coalesce((ev->>'neutralize_next_positive')::boolean,false) and ctype in('advance','stabilize','draw') then ev:=ev-'neutralize_next_positive';description:='ENPAP-X: EFEITO POSITIVO NEUTRALIZADO';
 elsif ctype='back' then pos:=greatest(1,pos-amount);description:=description||' // PECA NA CASA '||pos;ev:=jsonb_set(ev,'{last_negative}','"back"',true);
 elsif ctype='advance' then pos:=least(24,pos+amount);description:=description||' // PECA NA CASA '||pos;
 elsif ctype='overload' then overload:=overload+amount;ev:=jsonb_set(ev,'{last_negative}','"overload"',true);
 elsif ctype='stabilize' then overload:=greatest(0,overload-amount);
 elsif ctype='checkpoint' then checkpoint:=pos;description:=description||' REGISTRADO';
 elsif ctype='draw' then
   hand:=coalesce(ev->'team_hand','[]'::jsonb);deck:=coalesce(sec#>'{energy,team_deck}',pani_private.containment_v2_team_deck());idx:=coalesce((sec#>>'{energy,team_index}')::int,0);
   draw:=deck->>(idx%jsonb_array_length(deck));hand:=hand||jsonb_build_array(draw);description:=description||' // '||draw;
   if jsonb_array_length(hand)>3 then ev:=ev||jsonb_build_object('pending_choice','discard','drawn_card',draw);description:=description||' // ESCOLHA UMA CARTA PARA DESCARTAR';end if;
   ev:=jsonb_set(ev,'{team_hand}',hand,true);sec:=jsonb_set(sec,'{energy,team_index}',to_jsonb(idx+1),true);
 elsif ctype='roll_again' then roll_again:=true;
 elsif ctype='shortcut' then ev:=ev||jsonb_build_object('pending_choice','shortcut');
 end if;
 if ev->>'return_mark' is not null then pos:=greatest(1,(ev->>'return_mark')::int);description:=description||' // ESQUELETO DE LODO: RETORNO A CASA '||pos;ev:=ev-'return_mark';end if;
 ev:=ev||jsonb_build_object('position',pos,'overload',overload,'last_checkpoint',checkpoint,'last_effect',description);
 if overload>=7 then
   st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);
   ev:=ev||jsonb_build_object('position',checkpoint,'overload',4,'collapse',true,'last_effect',description||' // COLAPSO: RETORNO AO CHECKPOINT, SOBRECARGA 4/7');
 end if;
 if coalesce((ev->>'position')::int,0)>=24 then ev:=ev||jsonb_build_object('position',24,'phase','COMPLETE','active_side','PLAYERS','winner','PLAYERS','vote_phase',null);
 elsif ev->>'pending_choice' in('shortcut','discard') then ev:=ev||jsonb_build_object('phase','PLAYER_CHOICE','active_side','PLAYERS','vote_phase',null);
 elsif roll_again then ev:=ev||jsonb_build_object('phase','PLAYER_ACTION','active_side','PLAYERS','roll_again',true,'vote_phase',null);
 else ev:=ev||jsonb_build_object('phase','PLAYER_REACTION','active_side','PLAYERS','roll_again',false,'vote_phase','energy:t'||coalesce(ev->>'turn','1'));end if;
 st:=jsonb_set(st,'{event}',ev,true);return jsonb_build_object('state',st,'secret',sec);
end $$;

create or replace function pani_private.containment_v2_apply_threat(p_state jsonb,p_secret jsonb,p_card text)
returns jsonb language plpgsql volatile set search_path='' as $$
declare st jsonb:=p_state;sec jsonb:=p_secret;ev jsonb:=coalesce(st->'event','{}');card text:=upper(p_card);pos int;overload int;overload_before int;checkpoint int;effect text;lastneg text;hand jsonb;deck jsonb;idx int;draw text;
begin
 pos:=coalesce((ev->>'position')::int,1);overload:=coalesce((ev->>'overload')::int,0);overload_before:=overload;checkpoint:=coalesce((ev->>'last_checkpoint')::int,1);effect:=card;
 if card='ZUMBI DE SANGUE' then pos:=greatest(1,pos-1);effect:=card||': equipe recua 1.';
 elsif card='ESQUELETO DE LODO' then ev:=ev||jsonb_build_object('return_mark',pos);effect:=card||': retorno marcado na casa '||pos||'.';
 elsif card='ANARQUICO' then ev:=ev||jsonb_build_object('anarchic_next_roll',true);effect:=card||': o proximo dado sera rolado duas vezes para escolha do Mestre.';
 elsif card='EXISTIDO' then ev:=ev||jsonb_build_object('cards_blocked',true);effect:=card||': cartas PANI bloqueadas no proximo turno.';
 elsif card='ENRAIZADO' then ev:=ev||jsonb_build_object('move_cap',3);effect:=card||': proximo dado limitado a 3.';
 elsif card='MARIONETE' then lastneg:=coalesce(ev->>'last_negative','back1');if lastneg='overload' then overload:=overload+1;else pos:=greatest(1,pos-1);end if;effect:=card||': ultimo efeito negativo repetido.';
 elsif card='VIAJANTE' then ev:=ev||jsonb_build_object('hidden_cells',3);effect:=card||': tres efeitos adiante ocultos.';
 elsif card='CARNICAL PRETO DA MORTE' then ev:=ev||jsonb_build_object('pending_choice','carnical');effect:=card||': equipe escolhe recuo 2 ou Sobrecarga +1.';
 elsif card='ENPAP-X' then ev:=ev||jsonb_build_object('neutralize_next_positive',true);effect:=card||': proximo efeito positivo sera neutro.';
 elsif card='DEGOLIFICADA' then sec:=jsonb_set(sec,'{energy,sealed_consequences}',case when random()<.5 then jsonb_build_array('back1','overload1') else jsonb_build_array('overload1','back1') end,true);ev:=ev||jsonb_build_object('pending_choice','degolificada');effect:=card||': duas consequencias fechadas aguardam escolha.';
 elsif card='MAGISTRADA' then if overload>=5 then overload:=greatest(0,overload-1);effect:=card||': Sobrecarga -1, sem movimento.';elsif pos>=18 then pos:=greatest(1,pos-2);effect:=card||': equipe a frente, recuo 2.';else effect:=card||': equilibrio sem alteracao.';end if;
 elsif card='DEUS DA MORTE' then pos:=checkpoint;overload:=greatest(0,overload-2);effect:=card||': retorno ao checkpoint, sobrecarga -2.';
 elsif card='DIABO' then ev:=ev||jsonb_build_object('pending_choice','diabo');effect:=card||': barganha +4 casas por Sobrecarga +2 aguarda decisao.';
 elsif card='ANFITRIAO' then
   case floor(random()*6)::int when 0 then pos:=greatest(1,pos-2);effect:=card||': roleta -2 casas.';when 1 then pos:=greatest(1,pos-1);effect:=card||': roleta -1 casa.';when 2 then pos:=least(24,pos+1);effect:=card||': roleta +1 casa.';when 3 then pos:=least(24,pos+2);effect:=card||': roleta +2 casas.';when 4 then effect:=card||': roleta compra 1 carta da equipe.';ev:=ev||jsonb_build_object('host_draw',true);else overload:=overload+1;effect:=card||': roleta Sobrecarga +1.';end case;
 else effect:='O Mestre passou sem jogar uma ameaca.';end if;
 if coalesce((ev->>'stable_network')::boolean,false) and overload>overload_before then overload:=overload_before;effect:=effect||' REDE ESTAVEL bloqueou o aumento de sobrecarga.';end if;
 if coalesce((ev->>'host_draw')::boolean,false) then hand:=coalesce(ev->'team_hand','[]');deck:=sec#>'{energy,team_deck}';idx:=coalesce((sec#>>'{energy,team_index}')::int,0);draw:=deck->>(idx%jsonb_array_length(deck));hand:=hand||jsonb_build_array(draw);ev:=jsonb_set(ev,'{team_hand}',hand,true);sec:=jsonb_set(sec,'{energy,team_index}',to_jsonb(idx+1),true);effect:=effect||' CARTA: '||draw;ev:=ev-'host_draw';if jsonb_array_length(hand)>3 then ev:=ev||jsonb_build_object('pending_choice','discard','drawn_card',draw);end if;end if;
 ev:=(ev-'stable_network')||jsonb_build_object('position',pos,'overload',overload,'last_threat',card,'last_effect',effect,'pending_threat',null,'active_side','PLAYERS','phase',case when ev->>'pending_choice' is not null then 'PLAYER_CHOICE' else 'PLAYER_ACTION' end,'turn',coalesce((ev->>'turn')::int,1)+1,'vote_phase',null);
 if overload>=7 then st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('position',checkpoint,'overload',4,'collapse',true,'last_effect',effect||' COLAPSO: retorno ao checkpoint com 4/7.');end if;
 if pos>=24 then ev:=ev||jsonb_build_object('position',24,'phase','COMPLETE','active_side','PLAYERS','winner','PLAYERS');end if;
 st:=jsonb_set(st,'{event}',ev,true);return jsonb_build_object('state',st,'secret',sec);
end $$;

create or replace function pani_private.containment_tick_v2(p_session text)
returns void language plpgsql volatile set search_path='' as $$
declare s pani_private.containment_session%rowtype;st jsonb;sec jsonb;ev jsonb;active text;phase text;rep text;deadline timestamptz;selected jsonb;
begin
 select * into s from pani_private.containment_session where session_id=p_session for update;if s.session_id is null then return;end if;
 st:=s.state;sec:=s.secret_state;ev:=coalesce(st->'event','{}');active:=st->>'active_event';phase:=ev->>'phase';rep:=case when active='death' then st->>'witness_id' else st->>'representative_id' end;
 if active is not null and not coalesce((st->>'paused')::boolean,false) and ((active in('knowledge','blood')) or (active='energy' and ev->>'control_mode'='operator') or active='death') and rep is not null and not exists(
   select 1 from pani_private.containment_participant p where p.session_id=p_session and p.crew_id=rep and p.joined and p.last_seen>now()-interval '25 seconds') then
   st:=st||jsonb_build_object('paused',true,'pause_reason',case when active='death' then 'witness_offline' else 'representative_offline' end);
   if ev->>'phase_ends_at' is not null then st:=jsonb_set(st,'{timer_remaining}',to_jsonb(greatest(0,extract(epoch from ((ev->>'phase_ends_at')::timestamptz-now()))::int)),true);ev:=ev-'phase_ends_at';st:=jsonb_set(st,'{event}',ev,true);end if;
 end if;
 if coalesce((st->>'paused')::boolean,false) then update pani_private.containment_session set state=st,revision=revision+case when st is distinct from s.state then 1 else 0 end,updated_at=now() where session_id=p_session;return;end if;
 if ev->>'phase_ends_at' is null then return;end if;deadline:=(ev->>'phase_ends_at')::timestamptz;if deadline>now() then return;end if;
 if active='death' and phase='OBSERVE' then ev:=ev||jsonb_build_object('phase','BLACKOUT','active_side','SYSTEM','phase_started_at',now(),'phase_ends_at',now()+interval '1.3 seconds');
 elsif active='death' and phase='BLACKOUT' then selected:=sec#>'{death,selected}';ev:=ev||jsonb_build_object('phase','VOTE','active_side','PLAYERS','current_variant',selected->>'variant','scene_id',selected->>'scene_id','phase_started_at',now(),'phase_ends_at',null,'vote_phase','death:c'||coalesce(ev->>'cycle','1'));
 elsif active='blood' and phase='PLAYER_ACTION' then
   ev:=ev||jsonb_build_object('last_result','TIMEOUT','last_answer',null,'errors',coalesce((ev->>'errors')::int,0)+1,'active_side','MASTER','phase','MASTER_ACTION','phase_ends_at',null,'vote_phase',null);
   if coalesce((ev->>'errors')::int,0)>=3 then ev:=ev||jsonb_build_object('hits',2,'errors',0,'last_result','COLLAPSE');st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);end if;
 end if;
 st:=jsonb_set(st,'{event}',ev,true);update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id=p_session;
end $$;

create or replace function public.pani_containment_crew_state(p_token text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.crew_access%rowtype;s pani_private.containment_session%rowtype;joined boolean:=false;players jsonb:='[]';summary jsonb:='{}';my_vote text;role_name text:='spectator';active text;phase text;my_suggestion jsonb:='[]';suggestions jsonb:='[]';
begin
 select * into c from public.crew_access where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');if c.crew_id is null then raise exception 'unauthorized';end if;
 perform pani_private.containment_tick_v2('W77-01');select * into s from pani_private.containment_session where session_id='W77-01';
 select coalesce(p.joined,false) into joined from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=c.crew_id;
 if joined then update pani_private.containment_participant set last_seen=now() where session_id='W77-01' and crew_id=c.crew_id;end if;
 select coalesce(jsonb_agg(jsonb_build_object('crew_id',p.crew_id,'display_name',ca.display_name,'module',ca.module,'connected',p.last_seen>now()-interval '25 seconds','last_seen',p.last_seen) order by ca.display_name),'[]') into players from pani_private.containment_participant p join public.crew_access ca on ca.crew_id=p.crew_id where p.session_id='W77-01' and p.joined;
 active:=s.state->>'active_event';phase:=s.state#>>'{event,vote_phase}';if c.crew_id=s.state->>'representative_id' then role_name:='representative';end if;if c.crew_id=s.state->>'witness_id' then role_name:='witness';end if;
 if active is not null and phase is not null then
   select v.value into my_vote from pani_private.containment_vote v where v.session_id='W77-01' and v.event_id=active and v.phase_key=phase and v.crew_id=c.crew_id;
   if (active in('knowledge','blood') and role_name='representative') or (active='death' and role_name='witness') then summary:=pani_private.containment_vote_summary('W77-01',active,phase);end if;
   if active='blood' and role_name='representative' and s.secret_state#>'{blood,fake_votes}' is not null and s.secret_state#>'{blood,fake_votes}'<>'null'::jsonb then summary:=s.secret_state#>'{blood,fake_votes}';end if;
 end if;
 if active='knowledge' then
   select coalesce(to_jsonb(string_to_array(v.value,'|')),'[]') into my_suggestion from pani_private.containment_vote v where v.session_id='W77-01' and v.event_id='knowledge' and v.phase_key=phase and v.crew_id=c.crew_id;
   if role_name='representative' then select coalesce(jsonb_agg(jsonb_build_object('words',string_to_array(q.value,'|'),'count',q.total,'voters',q.voters) order by q.total desc),'[]') into suggestions from (select v.value,count(*)::int total,jsonb_agg(ca.display_name order by ca.display_name) voters from pani_private.containment_vote v join public.crew_access ca on ca.crew_id=v.crew_id where v.session_id='W77-01' and v.event_id='knowledge' and v.phase_key=phase group by v.value)q;end if;
 end if;
 return jsonb_build_object('session_id','W77-01','released',coalesce((s.state->>'released')::boolean,false),'joined',joined,'state',s.state,'revision',s.revision,'server_time',now(),'player',jsonb_build_object('crew_id',c.crew_id,'display_name',c.display_name,'module',c.module,'role',role_name),'players',players,'vote_summary',summary,'my_vote',my_vote,'my_suggestion',my_suggestion,'suggestion_summary',suggestions);
end $$;

create or replace function public.pani_containment_master_state(p_pin text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s pani_private.containment_session%rowtype;players jsonb;votes jsonb;logs jsonb;
begin
 if not public.pani_master_valid(p_pin) then raise exception 'unauthorized';end if;perform pani_private.containment_tick_v2('W77-01');select * into s from pani_private.containment_session where session_id='W77-01';
 select coalesce(jsonb_agg(jsonb_build_object('crew_id',ca.crew_id,'display_name',ca.display_name,'module',ca.module,'joined',coalesce(p.joined,false),'connected',coalesce(p.last_seen>now()-interval '25 seconds',false),'last_seen',p.last_seen) order by ca.display_name),'[]') into players from public.crew_access ca left join pani_private.containment_participant p on p.crew_id=ca.crew_id and p.session_id='W77-01';
 select coalesce(jsonb_agg(jsonb_build_object('event_id',v.event_id,'phase_key',v.phase_key,'crew_id',v.crew_id,'display_name',ca.display_name,'value',v.value,'updated_at',v.updated_at) order by v.updated_at),'[]') into votes from pani_private.containment_vote v join public.crew_access ca on ca.crew_id=v.crew_id where v.session_id='W77-01';
 select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]') into logs from (select id,actor,event_type,detail,created_at from pani_private.containment_log where session_id='W77-01' order by created_at desc limit 100)x;
 return jsonb_build_object('session_id','W77-01','join_code',s.join_code,'state',s.state,'secret_state',s.secret_state,'revision',s.revision,'server_time',now(),'players',players,'votes',votes,'logs',logs);
end $$;

create or replace function public.pani_containment_crew_action_v2(p_token text,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare c public.crew_access%rowtype;s pani_private.containment_session%rowtype;st jsonb;sec jsonb;ev jsonb;active text;side text;phase text;rep text;witness text;value text;selected jsonb;groups jsonb;g jsonb;matched jsonb:=null;solved jsonb;coherence int;result jsonb;hand jsonb;deck jsonb;card text;draw text;pos int;overload int;answer text;hits int;errors int;cycle int;idx int;required text[];choice text;
begin
 select * into c from public.crew_access where token_hash=encode(extensions.digest(p_token,'sha256'),'hex');if c.crew_id is null then raise exception 'unauthorized';end if;
 perform pani_private.containment_tick_v2('W77-01');select * into s from pani_private.containment_session where session_id='W77-01' for update;if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=c.crew_id and p.joined) then raise exception 'not_joined';end if;
 update pani_private.containment_participant set last_seen=now() where session_id='W77-01' and crew_id=c.crew_id;
 st:=s.state;sec:=s.secret_state;ev:=coalesce(st->'event','{}');active:=st->>'active_event';side:=coalesce(ev->>'active_side','PLAYERS');phase:=ev->>'phase';rep:=st->>'representative_id';witness:=st->>'witness_id';
 if coalesce((st->>'paused')::boolean,false) then raise exception 'session_paused';end if;
 if p_action='vote' then
   if side<>'PLAYERS' or ev->>'vote_phase' is null then raise exception 'vote_unavailable';end if;value:=left(trim(coalesce(p_payload->>'value','')),240);
   if active='blood' and value not in('A','B','C','D') then raise exception 'invalid_vote';end if;if active='death' and not (pani_private.containment_v2_death_objects() @> jsonb_build_array(value)) then raise exception 'invalid_vote';end if;
   insert into pani_private.containment_vote(session_id,event_id,phase_key,crew_id,value,updated_at) values('W77-01',active,ev->>'vote_phase',c.crew_id,value,now()) on conflict(session_id,event_id,phase_key,crew_id) do update set value=excluded.value,updated_at=now();
 elsif p_action='knowledge_suggest' then
   if active<>'knowledge' or side<>'PLAYERS' or phase<>'PLAYER_ACTION' then raise exception 'knowledge_unavailable';end if;selected:=coalesce(p_payload->'words','[]');if jsonb_typeof(selected)<>'array' or jsonb_array_length(selected)<>4 or (select count(distinct x) from jsonb_array_elements_text(selected)x)<>4 then raise exception 'four_unique_words_required';end if;if not((ev->'words') @> selected) then raise exception 'invalid_group';end if;
   value:=(select string_agg(x,'|' order by x) from jsonb_array_elements_text(selected)x);insert into pani_private.containment_vote(session_id,event_id,phase_key,crew_id,value,updated_at) values('W77-01','knowledge',ev->>'vote_phase',c.crew_id,value,now()) on conflict(session_id,event_id,phase_key,crew_id) do update set value=excluded.value,updated_at=now();
 elsif p_action='knowledge_submit' then
   if active<>'knowledge' or side<>'PLAYERS' or phase<>'PLAYER_ACTION' or c.crew_id<>rep then raise exception 'representative_required';end if;selected:=coalesce(p_payload->'words','[]');if jsonb_typeof(selected)<>'array' or jsonb_array_length(selected)<>4 or (select count(distinct x) from jsonb_array_elements_text(selected)x)<>4 then raise exception 'four_unique_words_required';end if;if not((ev->'words') @> selected) then raise exception 'invalid_group';end if;
   groups:=sec#>'{knowledge,solution}';solved:=coalesce(ev->'solved_groups','[]');for g in select item from jsonb_array_elements(groups)item loop if ((g->'words') @> selected) and (selected @> (g->'words')) then matched:=g;exit;end if;end loop;coherence:=coalesce((ev->>'coherence')::int,4);
   if matched is not null then solved:=solved||jsonb_build_array(matched);ev:=ev||jsonb_build_object('solved_groups',solved,'words',(select coalesce(jsonb_agg(x),'[]') from jsonb_array_elements_text(ev->'words')x where not((matched->'words') @> jsonb_build_array(x))),'last_result','CORRECT','partial_hint',null);
   else coherence:=coherence-1;ev:=ev||jsonb_build_object('coherence',coherence,'last_result','WRONG','partial_hint',case when exists(select 1 from jsonb_array_elements(groups)gg where (select count(*) from jsonb_array_elements_text(selected)x where (gg->'words') @> jsonb_build_array(x))=3) then '3 DE 4 PERTENCEM AO MESMO GRUPO' else null end);end if;
   if matched is null and coherence<=0 then st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('coherence',2,'hint','A PANI detectou uma relacao parcial. Compare os pares mais recorrentes.','collapse',true);end if;
   ev:=ev-'ghost_words'-'ghost_connection'-'unstable_word'-'echo_word';delete from pani_private.containment_vote where session_id='W77-01' and event_id='knowledge';
   if jsonb_array_length(solved)>=4 then ev:=ev||jsonb_build_object('phase','COMPLETE','active_side','PLAYERS','vote_phase',null);else ev:=ev||jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','vote_phase',null);end if;
 elsif p_action='knowledge_claim' then
   if active<>'knowledge' or phase<>'COMPLETE' or c.crew_id<>rep then raise exception 'representative_required';end if;st:=pani_private.containment_capture(st,'knowledge');ev:='{}';
 elsif p_action='energy_roll' then
   if active<>'energy' or side<>'PLAYERS' or phase<>'PLAYER_ACTION' then raise exception 'roll_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;
   if coalesce((ev->>'anarchic_next_roll')::boolean,false) then ev:=(ev-'anarchic_next_roll')||jsonb_build_object('phase','MASTER_CHOICE','active_side','MASTER','die_options',jsonb_build_array(1+floor(random()*6)::int,1+floor(random()*6)::int),'last_effect','ANARQUICO: dois resultados aguardam a escolha do Mestre.');
   else result:=pani_private.containment_v2_energy_resolve(st,sec,case when ev->>'move_cap' is not null then least((ev->>'move_cap')::int,1+floor(random()*6)::int) else 1+floor(random()*6)::int end);st:=result->'state';sec:=result->'secret';ev:=(st->'event')-'move_cap'-'hidden_cells';end if;
 elsif p_action='energy_shortcut' then
   if active<>'energy' or phase<>'PLAYER_CHOICE' or ev->>'pending_choice'<>'shortcut' then raise exception 'choice_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;choice:=coalesce(p_payload->>'choice','stay');pos:=coalesce((ev->>'position')::int,20);overload:=coalesce((ev->>'overload')::int,0);if choice='advance' then pos:=least(24,pos+2);overload:=overload+1;end if;ev:=ev||jsonb_build_object('position',pos,'overload',overload,'pending_choice',null,'phase',case when pos>=24 then 'COMPLETE' else 'PLAYER_REACTION' end,'active_side','PLAYERS','last_effect',case when choice='advance' then 'ATALHO: avance 2 e sobrecarga +1.' else 'ATALHO RECUSADO: permaneca.' end);if overload>=7 then st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('position',coalesce((ev->>'last_checkpoint')::int,1),'overload',4,'collapse',true,'phase','PLAYER_REACTION','last_effect','ATALHO // COLAPSO: retorno ao checkpoint com 4/7.');end if;
 elsif p_action='energy_discard' then
   if active<>'energy' or phase<>'PLAYER_CHOICE' or ev->>'pending_choice'<>'discard' then raise exception 'choice_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;hand:=coalesce(ev->'team_hand','[]');idx:=case when coalesce(p_payload->>'index','')~'^\d+$' then (p_payload->>'index')::int else -1 end;if idx<0 or idx>=jsonb_array_length(hand) then raise exception 'invalid_choice';end if;card:=hand->>idx;hand:=(select coalesce(jsonb_agg(x.value order by x.ordinality),'[]') from jsonb_array_elements_text(hand) with ordinality x(value,ordinality) where x.ordinality<>idx+1);ev:=ev||jsonb_build_object('team_hand',hand,'pending_choice',null,'drawn_card',null,'phase','PLAYER_REACTION','last_effect','MAO AJUSTADA: '||card||' descartada.');
 elsif p_action='energy_backup_choose' then
   if active<>'energy' or phase<>'PLAYER_CHOICE' or ev->>'pending_choice'<>'backup' then raise exception 'choice_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;idx:=case when coalesce(p_payload->>'index','')~'^[01]$' then (p_payload->>'index')::int else -1 end;if idx not in(0,1) or jsonb_array_length(coalesce(ev->'backup_offer','[]'))<>2 then raise exception 'invalid_choice';end if;card:=ev#>>array['backup_offer',idx::text];hand:=coalesce(ev->'team_hand','[]')||jsonb_build_array(card);ev:=ev||jsonb_build_object('team_hand',hand,'pending_choice',null,'backup_offer',null,'phase','PLAYER_REACTION','last_effect','BACKUP LOCAL: '||card||' mantida; a outra carta foi descartada.');
 elsif p_action='energy_threat_choice' then
   if active<>'energy' or phase<>'PLAYER_CHOICE' or ev->>'pending_choice' not in('carnical','degolificada','diabo') then raise exception 'choice_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;choice:=lower(coalesce(p_payload->>'choice',''));pos:=coalesce((ev->>'position')::int,1);overload:=coalesce((ev->>'overload')::int,0);
   if ev->>'pending_choice'='carnical' then if choice='back' then pos:=greatest(1,pos-2);value:='CARNICAL: equipe voltou 2 casas.';elsif choice='overload' then overload:=overload+1;value:='CARNICAL: Sobrecarga +1.';else raise exception 'invalid_choice';end if;
   elsif ev->>'pending_choice'='diabo' then if choice='accept' then pos:=least(24,pos+4);overload:=overload+2;value:='DIABO: barganha aceita, +4 casas e Sobrecarga +2.';elsif choice='refuse' then value:='DIABO: barganha recusada.';else raise exception 'invalid_choice';end if;
   else if choice!~'^[01]$' then raise exception 'invalid_choice';end if;idx:=choice::int;answer:=sec#>>array['energy','sealed_consequences',idx::text];if answer='back1' then pos:=greatest(1,pos-1);value:='DEGOLIFICADA: face revelada, recuo 1.';else overload:=overload+1;value:='DEGOLIFICADA: face revelada, Sobrecarga +1.';end if;sec:=jsonb_set(sec,'{energy,sealed_consequences}','null',true);end if;
   ev:=ev||jsonb_build_object('position',pos,'overload',overload,'pending_choice',null,'phase',case when pos>=24 then 'COMPLETE' else 'PLAYER_ACTION' end,'active_side','PLAYERS','last_effect',value);if overload>=7 then st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('position',coalesce((ev->>'last_checkpoint')::int,1),'overload',4,'collapse',true,'phase','PLAYER_ACTION','last_effect',value||' COLAPSO: retorno ao checkpoint com 4/7.');end if;
 elsif p_action='energy_play_card' then
   if active<>'energy' or side<>'PLAYERS' or phase not in('PLAYER_REACTION','THREAT_RESPONSE') then raise exception 'card_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;if coalesce((ev->>'cards_blocked')::boolean,false) then raise exception 'cards_blocked';end if;if coalesce((ev->>'support_used')::boolean,false) then raise exception 'support_already_used';end if;card:=upper(coalesce(p_payload->>'card',''));hand:=coalesce(ev->'team_hand','[]');if not(hand @> jsonb_build_array(card)) then raise exception 'card_unavailable';end if;select ordinality-1 into idx from jsonb_array_elements_text(hand) with ordinality x(value,ordinality) where x.value=card limit 1;hand:=hand-idx;ev:=jsonb_set(ev,'{team_hand}',hand,true);ev:=jsonb_set(ev,'{support_used}','true',true);pos:=coalesce((ev->>'position')::int,1);overload:=coalesce((ev->>'overload')::int,0);
   if phase='THREAT_RESPONSE' and card<>'ESCUDO PANI' then raise exception 'card_wrong_window';end if;if phase='PLAYER_REACTION' and card='ESCUDO PANI' then raise exception 'card_wrong_window';end if;
   if card='ESCUDO PANI' and phase='THREAT_RESPONSE' then ev:=ev||jsonb_build_object('pending_threat',null,'phase','PLAYER_ACTION','active_side','PLAYERS','last_effect','ESCUDO PANI: ameaca cancelada.','turn',coalesce((ev->>'turn')::int,1)+1);
   elsif card='RECALIBRAR' then ev:=ev||jsonb_build_object('position',coalesce((ev->>'roll_origin_position')::int,pos),'overload',coalesce((ev->>'roll_origin_overload')::int,overload));st:=jsonb_set(st,'{event}',ev,true);result:=pani_private.containment_v2_energy_resolve(st,sec,1+floor(random()*6)::int);st:=result->'state';sec:=result->'secret';ev:=(st->'event')||jsonb_build_object('support_used',true,'last_effect','RECALIBRAR: novo dado '||(st#>>'{event,die}')||'. '||coalesce(st#>>'{event,last_effect}',''));
   elsif card='ROTA SEGURA' then if ev->>'last_space_type' not in('back','overload') then raise exception 'card_wrong_window';end if;ev:=ev||jsonb_build_object('position',greatest(pos,coalesce((ev->>'roll_origin_position')::int,pos)+coalesce((ev->>'die')::int,0)),'overload',coalesce((ev->>'roll_origin_overload')::int,overload),'last_effect','ROTA SEGURA: recuo e sobrecarga ignorados.');
   elsif card in('ATALHO DE MANUTENCAO','IMPULSO CRT') then ev:=ev||jsonb_build_object('position',least(24,pos+case when card='ATALHO DE MANUTENCAO' then 2 else 1 end),'last_effect',card||': movimento adicional aplicado.');
   elsif card='BATERIA AUXILIAR' then if ev->>'last_space_type' not in('back','overload') then raise exception 'card_wrong_window';end if;ev:=ev||jsonb_build_object('position',least(24,pos+1),'last_effect','BATERIA AUXILIAR: efeito negativo compensado com avanco 1.');
   elsif card='DRENAR CARGA' then ev:=ev||jsonb_build_object('overload',greatest(0,overload-1),'last_effect','DRENAR CARGA: sobrecarga -1.');
   elsif card='DESVIO' then if ev->>'last_space_type'<>'back' then raise exception 'card_wrong_window';end if;ev:=ev||jsonb_build_object('position',least(24,coalesce((ev->>'roll_origin_position')::int,pos)+coalesce((ev->>'die')::int,0)+1),'last_effect','DESVIO: recuo convertido em avanco 1.');
   elsif card='TRAVA SEC' then ev:=ev||jsonb_build_object('threat_choice_limit',2,'last_effect','TRAVA SEC: o Mestre tera apenas duas ameacas.');
   elsif card='SCAN DE ROTA' then ev:=ev||jsonb_build_object('scan_cells',(select jsonb_agg(x) from jsonb_array_elements(pani_private.containment_v2_board())x where (x->>'n')::int between pos+1 and least(24,pos+4)),'last_effect','SCAN DE ROTA: proximas quatro casas reveladas.');
   elsif card='REDE ESTAVEL' then ev:=ev||jsonb_build_object('stable_network',true,'last_effect','REDE ESTAVEL: ameacas nao aumentam sobrecarga nesta rodada.');
   elsif card='BACKUP LOCAL' then deck:=sec#>'{energy,team_deck}';idx:=coalesce((sec#>>'{energy,team_index}')::int,0);ev:=ev||jsonb_build_object('backup_offer',jsonb_build_array(deck->>(idx%jsonb_array_length(deck)),deck->>((idx+1)%jsonb_array_length(deck))),'pending_choice','backup','phase','PLAYER_CHOICE','last_effect','BACKUP LOCAL: escolha uma de duas cartas.');sec:=jsonb_set(sec,'{energy,team_index}',to_jsonb(idx+2),true);
   else raise exception 'card_wrong_window';end if;
   if coalesce((ev->>'position')::int,0)>=24 then ev:=ev||jsonb_build_object('position',24,'phase','COMPLETE','winner','PLAYERS');end if;
 elsif p_action='energy_accept_threat' then
   if active<>'energy' or phase<>'THREAT_RESPONSE' then raise exception 'threat_unavailable';end if;result:=pani_private.containment_v2_apply_threat(st,sec,ev#>>'{pending_threat,card}');st:=result->'state';sec:=result->'secret';ev:=st->'event';
 elsif p_action='energy_end_turn' then
   if active<>'energy' or side<>'PLAYERS' or phase<>'PLAYER_REACTION' then raise exception 'turn_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;ev:=(ev-'cards_blocked')||jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','vote_phase',null);
 elsif p_action='energy_claim' then
   if active<>'energy' or phase<>'COMPLETE' then raise exception 'energy_unavailable';end if;if ev->>'control_mode'='operator' and c.crew_id<>rep then raise exception 'representative_required';end if;st:=pani_private.containment_capture(st,'energy');ev:='{}';
 elsif p_action='blood_confirm' then
   if active<>'blood' or phase<>'PLAYER_ACTION' or c.crew_id<>rep then raise exception 'representative_required';end if;value:=upper(coalesce(p_payload->>'option',''));if value not in('A','B','C','D') then raise exception 'invalid_vote';end if;answer:=sec#>>'{blood,correct_option}';hits:=coalesce((ev->>'hits')::int,0);errors:=coalesce((ev->>'errors')::int,0);if value=answer then hits:=hits+1;else errors:=errors+1;end if;
   ev:=ev||jsonb_build_object('hits',hits,'errors',errors,'last_answer',value,'last_result',case when value=answer then 'CORRECT' else 'WRONG' end,'phase_ends_at',null,'vote_phase',null);delete from pani_private.containment_vote where session_id='W77-01' and event_id='blood';
   if errors>=3 then hits:=2;errors:=0;st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('hits',hits,'errors',errors,'last_result','COLLAPSE');end if;
   if hits>=4 then ev:=ev||jsonb_build_object('phase','COMPLETE','active_side','PLAYERS');else ev:=ev||jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','round',coalesce((ev->>'round')::int,1)+1);sec:=jsonb_set(sec,'{blood,choices}',pani_private.containment_v2_blood_challenges(coalesce((ev->>'round')::int,1)+1),true);end if;
 elsif p_action='blood_claim' then
   if active<>'blood' or phase<>'COMPLETE' or c.crew_id<>rep then raise exception 'representative_required';end if;st:=pani_private.containment_capture(st,'blood');ev:='{}';
 elsif p_action='death_confirm' then
   if active<>'death' or phase<>'VOTE' or c.crew_id<>witness then raise exception 'witness_required';end if;value:=coalesce(p_payload->>'object','');if not(pani_private.containment_v2_death_objects() @> jsonb_build_array(value)) then raise exception 'invalid_vote';end if;answer:=sec#>>'{death,changed_object_id}';delete from pani_private.containment_vote where session_id='W77-01' and event_id='death';
   if value=answer then cycle:=coalesce((ev->>'cycle')::int,1)+1;if cycle>4 then ev:=ev||jsonb_build_object('phase','COMPLETE','active_side','PLAYERS','last_result','CORRECT','cycle',4,'vote_phase',null);else ev:=jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','cycle',cycle,'scene_id',null,'base_variant','base','current_variant',null,'vote_phase',null,'last_result','CORRECT','attempts',coalesce((ev->>'attempts')::int,0));sec:=jsonb_set(sec,'{death}',jsonb_build_object('choices',pani_private.containment_v2_death_choices(cycle),'changed_object_id',null,'selected',null),true);end if;
   else st:=jsonb_set(st,'{saturation}',to_jsonb(least(8,coalesce((st->>'saturation')::int,0)+1)),true);ev:=ev||jsonb_build_object('last_result','WRONG','attempts',coalesce((ev->>'attempts')::int,0)+1);end if;
 elsif p_action='death_claim' then
   if active<>'death' or phase<>'COMPLETE' or c.crew_id<>witness then raise exception 'witness_required';end if;st:=pani_private.containment_capture(st,'death');ev:='{}';
 else raise exception 'unknown_action';end if;
 if st->>'active_event' is not null then st:=jsonb_set(st,'{event}',ev,true);end if;update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';perform pani_private.containment_log_event('W77-01',c.display_name,p_action,active);return public.pani_containment_crew_state(p_token);
end $$;

create or replace function public.pani_containment_master_action_v2(p_pin text,p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s pani_private.containment_session%rowtype;st jsonb;sec jsonb;ev jsonb;active text;target text;code text;rep text;witness text;statuses jsonb;mode text;solution jsonb;teamdeck jsonb;threatdeck jsonb;choice jsonb;idx int;seconds int;card text;hand jsonb;deck jsonb;result jsonb;kind text;duration int;value int;delta int;remaining int;
begin
 if not public.pani_master_valid(p_pin) then raise exception 'unauthorized';end if;perform pani_private.containment_tick_v2('W77-01');select * into s from pani_private.containment_session where session_id='W77-01' for update;st:=s.state;sec:=s.secret_state;ev:=coalesce(st->'event','{}');active:=st->>'active_event';
 if p_action='new_session' then code:=upper(trim(coalesce(p_payload->>'code','')));if code='' then code:=upper(substr(md5(random()::text||clock_timestamp()::text),1,4));end if;if code!~'^[A-Z0-9]{4,8}$' then raise exception 'invalid_session_code';end if;st:=pani_private.containment_default_state()||jsonb_build_object('released',true,'status','lobby','announcement','QUATRO ASSINATURAS ANOMALAS DETECTADAS.','announcement_revision',1);sec:=pani_private.containment_default_secret();delete from pani_private.containment_vote where session_id='W77-01';delete from pani_private.containment_participant where session_id='W77-01';update pani_private.containment_session set join_code=code,state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';return public.pani_containment_master_state(p_pin);
 elsif p_action='close_session' then st:=pani_private.containment_default_state();sec:=pani_private.containment_default_secret();delete from pani_private.containment_vote where session_id='W77-01';delete from pani_private.containment_participant where session_id='W77-01';update pani_private.containment_session set join_code=null,state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';return public.pani_containment_master_state(p_pin);end if;
 if not coalesce((st->>'released')::boolean,false) then raise exception 'session_closed';end if;
 if p_action='set_available' then target:=coalesce(p_payload->>'event','');if target not in('knowledge','energy','blood','death') then raise exception 'invalid_event';end if;statuses:=coalesce(st->'event_status','{}');if statuses->>target='contained' then raise exception 'event_contained';end if;statuses:=jsonb_set(statuses,array[target],to_jsonb(case when coalesce((p_payload->>'available')::boolean,true) then 'available' else 'detected' end),true);st:=jsonb_set(st,'{event_status}',statuses,true);
 elsif p_action='start_event' then
   target:=coalesce(p_payload->>'event','');if target not in('knowledge','energy','blood','death') or active is not null then raise exception 'event_unavailable';end if;if st#>>array['event_status',target]<>'available' then raise exception 'event_unavailable';end if;rep:=coalesce(p_payload->>'representative_id','');mode:=lower(coalesce(p_payload->>'control_mode','operator'));if mode not in('team','operator') then raise exception 'invalid_control_mode';end if;
   if target in('knowledge','blood') or (target='energy' and mode='operator') then if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=rep and p.joined) then raise exception 'representative_unavailable';end if;else rep:=null;end if;
   statuses:=jsonb_set(st->'event_status',array[target],'"in_progress"',true);st:=st||jsonb_build_object('protocol_version','containment_v2_0','status','active','active_event',target,'event_status',statuses,'representative_id',rep,'witness_id',null,'corruption_charges',2,'paused',false,'pause_reason',null,'timer_remaining',null,'announcement','NAO DESTRUAM A ARENA. VENCAM A ARENA.','announcement_revision',coalesce((st->>'announcement_revision')::int,0)+1);delete from pani_private.containment_vote where session_id='W77-01' and event_id=target;
   if target='knowledge' then solution:=pani_private.containment_conexo_solution();ev:=jsonb_build_object('phase','PLAYER_ACTION','active_side','PLAYERS','words',pani_private.containment_conexo_words(),'solved_groups','[]'::jsonb,'coherence',4,'partial_hint',null,'hint',null,'last_result',null,'vote_phase','knowledge:g1');sec:=jsonb_set(sec,'{knowledge}',jsonb_build_object('solution',solution,'hand',jsonb_build_array('shuffle','phantom_connection','corrupted_hint','unstable_word','echo')),true);
   elsif target='energy' then teamdeck:=pani_private.containment_v2_team_deck();threatdeck:=pani_private.containment_v2_threat_deck();ev:=jsonb_build_object('phase','PLAYER_ACTION','active_side','PLAYERS','control_mode',mode,'board_version','v2-24','board',pani_private.containment_v2_board(),'position',1,'last_checkpoint',1,'overload',0,'turn',1,'die',null,'team_hand',jsonb_build_array(teamdeck->>0,teamdeck->>1,teamdeck->>2),'last_effect','A equipe aguarda o primeiro lancamento.','last_threat',null,'winner',null,'vote_phase',null);sec:=jsonb_set(sec,'{energy}',jsonb_build_object('team_deck',teamdeck,'team_index',3,'master_deck',threatdeck,'master_index',3,'master_hand',jsonb_build_array(threatdeck->>0,threatdeck->>1,threatdeck->>2)),true);
   elsif target='blood' then seconds:=greatest(12,least(18,coalesce((p_payload->>'seconds')::int,15)));ev:=jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','round',1,'hits',0,'errors',0,'seconds',seconds,'challenge',null,'display_order',jsonb_build_array('A','B','C'),'last_result',null,'vote_phase',null);sec:=jsonb_set(sec,'{blood}',jsonb_build_object('choices',pani_private.containment_v2_blood_challenges(1),'correct_option',null,'fake_votes',null),true);
   else ev:=jsonb_build_object('phase','MASTER_ACTION','active_side','MASTER','cycle',1,'scene_id',null,'base_variant','base','current_variant',null,'last_result',null,'attempts',0,'vote_phase',null);sec:=jsonb_set(sec,'{death}',jsonb_build_object('choices',pani_private.containment_v2_death_choices(1),'changed_object_id',null,'selected',null),true);end if;st:=jsonb_set(st,'{event}',ev,true);
 elsif p_action='set_representative' then rep:=coalesce(p_payload->>'crew_id','');if active not in('knowledge','blood') and not(active='energy' and ev->>'control_mode'='operator') then raise exception 'representative_not_required';end if;if not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=rep and p.joined) then raise exception 'representative_unavailable';end if;st:=st||jsonb_build_object('representative_id',rep,'paused',false,'pause_reason',null);if st->>'timer_remaining' is not null and ev->>'phase_ends_at' is null then ev:=ev||jsonb_build_object('phase_ends_at',now()+make_interval(secs=>(st->>'timer_remaining')::int));st:=st||jsonb_build_object('timer_remaining',null);end if;
 elsif p_action='set_witness' then witness:=coalesce(p_payload->>'crew_id','');if active<>'death' or not exists(select 1 from pani_private.containment_participant p where p.session_id='W77-01' and p.crew_id=witness and p.joined) then raise exception 'witness_unavailable';end if;st:=st||jsonb_build_object('witness_id',witness,'paused',false,'pause_reason',null);if st->>'timer_remaining' is not null and ev->>'phase_ends_at' is null then ev:=ev||jsonb_build_object('phase_ends_at',now()+make_interval(secs=>(st->>'timer_remaining')::int));st:=st||jsonb_build_object('timer_remaining',null);end if;
 elsif p_action='knowledge_master' then if active<>'knowledge' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;card:=coalesce(p_payload->>'card','pass');if card='shuffle' then ev:=jsonb_set(ev,'{words}',(select jsonb_agg(x order by random()) from jsonb_array_elements(ev->'words')x),true);elsif card='phantom_connection' then ev:=ev||jsonb_build_object('ghost_connection',true,'ghost_words',(select jsonb_agg(q.x) from (select x from jsonb_array_elements_text(ev->'words')x order by random() limit 4)q));elsif card='corrupted_hint' then ev:=ev||jsonb_build_object('hint','INTERFERENCIA: uma categoria parece correta, mas a fonte nao e confiavel.');elsif card='unstable_word' then ev:=ev||jsonb_build_object('unstable_word',ev#>>'{words,0}');elsif card='echo' then ev:=ev||jsonb_build_object('echo_word',ev#>>'{words,1}');elsif card<>'pass' then raise exception 'invalid_corruption';end if;ev:=ev||jsonb_build_object('phase','PLAYER_ACTION','active_side','PLAYERS','vote_phase','knowledge:g'||(jsonb_array_length(coalesce(ev->'solved_groups','[]'))+1));
 elsif p_action='energy_anarchic_choose' then
   if active<>'energy' or ev->>'active_side'<>'MASTER' or ev->>'phase'<>'MASTER_CHOICE' then raise exception 'players_turn';end if;idx:=case when coalesce(p_payload->>'index','')~'^[01]$' then (p_payload->>'index')::int else -1 end;if idx not in(0,1) or jsonb_array_length(coalesce(ev->'die_options','[]'))<>2 then raise exception 'invalid_choice';end if;value:=(ev#>>array['die_options',idx::text])::int;ev:=ev-'die_options';st:=jsonb_set(st,'{event}',ev,true);result:=pani_private.containment_v2_energy_resolve(st,sec,case when ev->>'move_cap' is not null then least((ev->>'move_cap')::int,value) else value end);st:=result->'state';sec:=result->'secret';ev:=(st->'event')-'move_cap'-'hidden_cells'-'die_options';ev:=ev||jsonb_build_object('last_effect','ANARQUICO: Mestre escolheu '||value||'. '||coalesce(ev->>'last_effect',''));
 elsif p_action='energy_threat' then
   if active<>'energy' or ev->>'active_side'<>'MASTER' or ev->>'phase'<>'MASTER_ACTION' then raise exception 'players_turn';end if;card:=upper(coalesce(p_payload->>'card','PASSAR'));hand:=coalesce(sec#>'{energy,master_hand}','[]');if card<>'PASSAR' and not(hand @> jsonb_build_array(card)) then raise exception 'invalid_threat';end if;
   if card<>'PASSAR' and ev->>'threat_choice_limit' is not null and not((select coalesce(jsonb_agg(x.value order by x.ordinality),'[]') from jsonb_array_elements_text(hand) with ordinality x(value,ordinality) where x.ordinality<=greatest(1,(ev->>'threat_choice_limit')::int)) @> jsonb_build_array(card)) then raise exception 'threat_limited';end if;ev:=ev-'threat_choice_limit';
   if card<>'PASSAR' then select ordinality-1 into idx from jsonb_array_elements_text(hand) with ordinality x(value,ordinality) where x.value=card limit 1;hand:=hand-idx;deck:=sec#>'{energy,master_deck}';idx:=coalesce((sec#>>'{energy,master_index}')::int,0);hand:=hand||jsonb_build_array(deck->>(idx%jsonb_array_length(deck)));sec:=jsonb_set(sec,'{energy,master_hand}',hand,true);sec:=jsonb_set(sec,'{energy,master_index}',to_jsonb(idx+1),true);end if;
   if card<>'PASSAR' and coalesce(ev->'team_hand','[]') @> jsonb_build_array('ESCUDO PANI') then ev:=ev||jsonb_build_object('phase','THREAT_RESPONSE','active_side','PLAYERS','pending_threat',jsonb_build_object('card',card),'last_effect',card||' aguarda resposta da equipe.');else result:=pani_private.containment_v2_apply_threat(st,sec,card);st:=result->'state';sec:=result->'secret';ev:=st->'event';end if;
 elsif p_action='blood_choose' then
   if active<>'blood' or ev->>'active_side'<>'MASTER' then raise exception 'players_turn';end if;idx:=greatest(0,least(2,coalesce((p_payload->>'index')::int,0)));choice:=sec#>'{blood,choices}'->idx;if choice is null then raise exception 'invalid_challenge';end if;sec:=jsonb_set(sec,'{blood,correct_option}',choice->'correct',true);sec:=jsonb_set(sec,'{blood,fake_votes}','null',true);seconds:=coalesce((ev->>'seconds')::int,15);ev:=ev||jsonb_build_object('phase','PLAYER_ACTION','active_side','PLAYERS','challenge',choice-'correct','display_order',jsonb_build_array('A','B','C'),'phase_started_at',now(),'phase_ends_at',now()+make_interval(secs=>seconds),'vote_phase','blood:r'||coalesce(ev->>'round','1'));
 elsif p_action='death_mutation' then
   if active<>'death' or ev->>'active_side'<>'MASTER' or st->>'witness_id' is null then raise exception 'witness_required';end if;idx:=greatest(0,least(2,coalesce((p_payload->>'index')::int,0)));choice:=sec#>'{death,choices}'->idx;if choice is null then raise exception 'invalid_mutation';end if;sec:=jsonb_set(sec,'{death,selected}',choice,true);sec:=jsonb_set(sec,'{death,changed_object_id}',choice->'changed_object_id',true);ev:=ev||jsonb_build_object('phase','OBSERVE','active_side','SYSTEM','scene_id',choice->>'scene_id','base_variant','base','current_variant',null,'phase_started_at',now(),'phase_ends_at',now()+interval '7 seconds','vote_phase',null);
 elsif p_action='corrupt' then
   if active is null or coalesce((st->>'corruption_charges')::int,0)<1 then raise exception 'corruption_unavailable';end if;kind:=coalesce(p_payload->>'kind','');duration:=greatest(700,least(2200,coalesce((p_payload->>'duration_ms')::int,1200)));if active='knowledge' then if kind='shuffle' then ev:=jsonb_set(ev,'{words}',(select jsonb_agg(x order by random()) from jsonb_array_elements(ev->'words')x),true);elsif kind='phantom_connection' then ev:=ev||jsonb_build_object('ghost_connection',true,'ghost_words',(select jsonb_agg(q.x) from (select x from jsonb_array_elements_text(ev->'words')x order by random() limit 4)q));elsif kind='unstable_word' then ev:=ev||jsonb_build_object('unstable_word',ev#>>'{words,0}');else ev:=ev||jsonb_build_object('hint','LEITURA CORROMPIDA // confirme pelo consenso.');end if;elsif active='energy' then ev:=ev||jsonb_build_object('visual_interference',kind);elsif active='blood' then if kind='corrupted_vote' then sec:=jsonb_set(sec,'{blood,fake_votes}',jsonb_build_object('A',1,'B',4,'C',2),true);elsif kind='invert_options' then ev:=ev||jsonb_build_object('display_order',jsonb_build_array('C','B','A'));elsif kind='phantom_d' then ev:=ev||jsonb_build_object('display_order',jsonb_build_array('A','B','C','D'),'phantom_d',jsonb_build_array(2,7,2,5,2,7,2));elsif kind='false_echo' then ev:=ev||jsonb_build_object('false_echo','B');else ev:=ev||jsonb_build_object('reading_noise',true);end if;else ev:=ev||jsonb_build_object('death_corruption',kind);end if;st:=st||jsonb_build_object('corruption_charges',coalesce((st->>'corruption_charges')::int,0)-1,'glitch',jsonb_build_object('revision',coalesce((st#>>'{glitch,revision}')::int,0)+1,'duration_ms',duration,'at',now()),'announcement','INTERFERENCIA DETECTADA','announcement_revision',coalesce((st->>'announcement_revision')::int,0)+1);
 elsif p_action='pause' then if coalesce((st->>'paused')::boolean,false) then st:=st||jsonb_build_object('paused',false,'pause_reason',null);if st->>'timer_remaining' is not null and ev->>'phase_ends_at' is null then ev:=ev||jsonb_build_object('phase_ends_at',now()+make_interval(secs=>(st->>'timer_remaining')::int));end if;st:=st||jsonb_build_object('timer_remaining',null);else if ev->>'phase_ends_at' is not null then remaining:=greatest(0,extract(epoch from ((ev->>'phase_ends_at')::timestamptz-now()))::int);ev:=ev-'phase_ends_at';st:=st||jsonb_build_object('timer_remaining',remaining);end if;st:=st||jsonb_build_object('paused',true,'pause_reason','master_pause');end if;
 elsif p_action='saturation' then if p_payload?'value' then value:=greatest(0,least(8,(p_payload->>'value')::int));else delta:=greatest(-8,least(8,coalesce((p_payload->>'delta')::int,0)));value:=greatest(0,least(8,coalesce((st->>'saturation')::int,0)+delta));end if;st:=jsonb_set(st,'{saturation}',to_jsonb(value),true);
 elsif p_action='clear_votes' then if active is null then delete from pani_private.containment_vote where session_id='W77-01';else delete from pani_private.containment_vote where session_id='W77-01' and event_id=active;end if;
 elsif p_action='contain_event' then if active is null then raise exception 'no_active_event';end if;st:=pani_private.containment_capture(st,active);delete from pani_private.containment_vote where session_id='W77-01' and event_id=active;
 elsif p_action='end_event' then if active is null then raise exception 'no_active_event';end if;statuses:=jsonb_set(st->'event_status',array[active],'"available"',true);st:=st||jsonb_build_object('status','lobby','active_event',null,'event_status',statuses,'representative_id',null,'witness_id',null,'event','{}','paused',false,'pause_reason',null);
 elsif p_action='pani_say' then st:=st||jsonb_build_object('announcement',left(coalesce(p_payload->>'text','PANI aguarda instrucoes.'),600),'announcement_revision',coalesce((st->>'announcement_revision')::int,0)+1);
 elsif p_action='remove_player' then target:=coalesce(p_payload->>'crew_id','');update pani_private.containment_participant set joined=false where session_id='W77-01' and crew_id=target;if st->>'representative_id'=target then st:=st||jsonb_build_object('representative_id',null,'paused',true,'pause_reason','representative_offline');end if;if st->>'witness_id'=target then st:=st||jsonb_build_object('witness_id',null,'paused',true,'pause_reason','witness_offline');end if;
 elsif p_action='reconnect_player' then target:=coalesce(p_payload->>'crew_id','');insert into pani_private.containment_participant(session_id,crew_id,joined,last_seen) values('W77-01',target,true,now()) on conflict(session_id,crew_id) do update set joined=true,last_seen=now();
 elsif p_action='residue_reveal' then if st->>'residue_status'<>'available' then raise exception 'residue_unavailable';end if;st:=st||jsonb_build_object('residue_status','revealed','announcement','RESIDUO BIOLOGICO NAO CATALOGADO // SETOR AMBIENTAL','announcement_revision',coalesce((st->>'announcement_revision')::int,0)+1);
 elsif p_action='residue_complete' then if st->>'residue_status'<>'revealed' then raise exception 'residue_unavailable';end if;st:=st||jsonb_build_object('residue_status','correlated');
 else raise exception 'unknown_action';end if;
 if st->>'active_event' is not null then st:=jsonb_set(st,'{event}',ev,true);end if;update pani_private.containment_session set state=st,secret_state=sec,revision=revision+1,updated_at=now() where session_id='W77-01';perform pani_private.containment_log_event('W77-01','MASTER',p_action,coalesce(target,active));return public.pani_containment_master_state(p_pin);
end $$;

-- Atualiza sessoes existentes sem apagar capturas ja concluidas. Uma arena v1
-- em andamento volta para DISPONIVEL para impedir que o cliente v2 herde um
-- estado incompativel e fique bloqueado.
update pani_private.containment_session
set state=(state||jsonb_build_object('protocol_version','containment_v2_0','status',case when coalesce((state->>'released')::boolean,false) then 'lobby' else 'dormant' end,'active_event',null,'representative_id',null,'witness_id',null,'paused',false,'pause_reason',null,'event','{}'::jsonb))
  ||jsonb_build_object('event_status',case when state->>'active_event' is null then state->'event_status' else jsonb_set(state->'event_status',array[state->>'active_event'],'"available"',true) end),
    secret_state=pani_private.containment_default_secret(),revision=revision+1,updated_at=now()
where session_id='W77-01' and state->>'protocol_version' is distinct from 'containment_v2_0';

revoke execute on function public.pani_containment_crew_action_v2(text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.pani_containment_master_action_v2(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_containment_crew_action_v2(text,text,jsonb) to anon,authenticated,service_role;
grant execute on function public.pani_containment_master_action_v2(text,text,jsonb) to anon,authenticated,service_role;
-- Rotas mutáveis das versões anteriores ficam inacessíveis ao navegador. Isso
-- impede que um cliente em cache contorne as regras v2; somente service_role
-- conserva acesso para auditoria ou recuperação administrativa.
revoke execute on function public.pani_containment_crew_action(text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.pani_containment_crew_action_v12(text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.pani_containment_master_action(text,text,jsonb) from public,anon,authenticated;
revoke execute on function public.pani_containment_master_action_v12(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_containment_crew_action(text,text,jsonb) to service_role;
grant execute on function public.pani_containment_crew_action_v12(text,text,jsonb) to service_role;
grant execute on function public.pani_containment_master_action(text,text,jsonb) to service_role;
grant execute on function public.pani_containment_master_action_v12(text,text,jsonb) to service_role;
revoke execute on all functions in schema pani_private from public,anon,authenticated;

comment on function public.pani_containment_crew_action_v2(text,text,jsonb) is 'Acoes publicas v2 validadas por token e autoridade; dado, respostas e mutacoes sao autoritativos no servidor.';
comment on function public.pani_containment_master_action_v2(text,text,jsonb) is 'Controles exclusivos do Mestre para as quatro arenas definitivas v2.';
