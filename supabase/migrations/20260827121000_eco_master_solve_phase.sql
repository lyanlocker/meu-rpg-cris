begin;

-- Permite ao Mestre concluir exatamente a fase atual de uma única âncora.
-- A transição continua server-authoritative e reutiliza eco_advance, preservando
-- todas as invariantes de progresso, lock e abertura da Convergência.
create or replace function public.pani_eco_master_action(p_pin text,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path=pg_catalog,public,pani_private as $$declare s pani_private.eco_session%rowtype;c text;t text;nodes jsonb;types jsonb:='[]';i int;e text;pa interval;u timestamptz;begin
 if not public.pani_master_valid(p_pin) then raise exception 'unauthorized';end if;select * into s from pani_private.eco_session where session_id='W77-02' for update;
 if p_action='start' then perform pani_private.eco_reset(coalesce((p_payload->>'seed')::int,1),true);
 elsif p_action='reset' then perform pani_private.eco_reset(coalesce((p_payload->>'seed')::int,s.seed_id),false);
 elsif p_action='stop' then update pani_private.eco_session set released=false,status='dormant',paused=false,paused_at=null,revision=revision+1 where session_id='W77-02';
 elsif p_action='pause' then if not s.paused then update pani_private.eco_session set paused=true,paused_at=now(),revision=revision+1 where session_id='W77-02';end if;
 elsif p_action='resume' then if s.paused then pa:=now()-s.paused_at;update pani_private.eco_session set paused=false,paused_at=null,convergence=case when nullif(convergence->>'windowEnd','') is not null then jsonb_set(convergence,'{windowEnd}',to_jsonb((convergence->>'windowEnd')::timestamptz+pa))when nullif(convergence->>'retryAt','') is not null then jsonb_set(convergence,'{retryAt}',to_jsonb((convergence->>'retryAt')::timestamptz+pa))else convergence end,revision=revision+1 where session_id='W77-02';update pani_private.eco_anchor set public_state=public_state||jsonb_build_object('buildDeadline',case when nullif(public_state->>'buildDeadline','')is not null then to_jsonb((public_state->>'buildDeadline')::timestamptz+pa)else public_state->'buildDeadline'end,'flowStartedAt',case when nullif(public_state->>'flowStartedAt','')is not null then to_jsonb((public_state->>'flowStartedAt')::timestamptz+pa)else public_state->'flowStartedAt'end,'flowCompleteAt',case when nullif(public_state->>'flowCompleteAt','')is not null then to_jsonb((public_state->>'flowCompleteAt')::timestamptz+pa)else public_state->'flowCompleteAt'end),revision=revision+1 where session_id='W77-02' and crew_id='eklay';end if;
 elsif p_action='configure_sec' then nodes:=p_payload->'nodes';if jsonb_typeof(nodes)<>'array' or jsonb_array_length(nodes)<>6 then raise exception 'route_requires_six_nodes';end if;for i in 0..4 loop e:=pani_private.eco_edge(nodes->>i,nodes->>(i+1));if e is null then raise exception 'invalid_route_edge';end if;types:=types||to_jsonb(e);end loop;update pani_private.eco_session set secret_state=secret_state||jsonb_build_object('secRoute',nodes,'secMoveTypes',types),revision=revision+1 where session_id='W77-02';update pani_private.eco_anchor set secret_state=jsonb_set(jsonb_set(secret_state,'{route}',nodes),'{moveTypes}',types),revision=revision+1 where session_id='W77-02' and crew_id='christian' and phase in(2,3) and not locked;
 elsif p_action in('grant_help','reduce_phase') then c:=p_payload->>'crewId';if not(c=any(pani_private.eco_active_crew()))then raise exception 'invalid_anchor';end if;update pani_private.eco_anchor set help_tokens=help_tokens+case when p_action='grant_help'then 1 else 2 end,stability=3,public_state=public_state||jsonb_build_object('serverAck','AUXÍLIO DO MESTRE REGISTRADO'),revision=revision+1 where session_id='W77-02' and crew_id=c and not locked;
 elsif p_action='solve_phase' then
  if not s.released or s.status<>'active' or s.paused then raise exception 'solve_phase_unavailable';end if;
  c:=p_payload->>'crewId';
  if not(c=any(pani_private.eco_active_crew()))then raise exception 'invalid_anchor';end if;
  select phase into i from pani_private.eco_anchor where session_id='W77-02' and crew_id=c and not locked for update;
  if i is null then raise exception 'anchor_locked';end if;
  perform pani_private.eco_advance(c);
  update pani_private.eco_anchor
     set public_state=public_state||jsonb_build_object(
           'feedback',case when i=4 then 'ÂNCORA FIXADA PELO MESTRE // AGUARDANDO CONVERGÊNCIA' else 'FASE '||i||' RESOLVIDA PELO MESTRE // FASE '||(i+1)||' LIBERADA' end,
           'serverAck','INTERVENÇÃO DO MESTRE REGISTRADA'),
         public_log=public_log||jsonb_build_array(jsonb_build_object('at',now(),'type','master_solve','text','FASE '||i||' RESOLVIDA PELO MESTRE')),
         revision=revision+1,
         updated_at=now()
   where session_id='W77-02' and crew_id=c;
 elsif p_action='interfere' then if s.paused or not s.released or s.status<>'active' then raise exception 'interference_unavailable';end if;if s.presence_charges<=0 then raise exception 'presence_depleted';end if;if exists(select 1 from pani_private.eco_anchor where session_id='W77-02' and phase=1 and not locked)then raise exception 'presence_locked_until_phase_two';end if;c:=p_payload->>'crewId';t:=p_payload->>'type';if not((c='gilbert'and t in('visual_mutation','verifier_echo','no_label'))or(c='eklay'and t in('remote_rotate','blind_queue','phantom_target'))or(c='christian'and t in('salto','false_echo','blind_camera'))or(c='willy'and t in('ectopic','label_swap','latency'))or(c='aliya'and t in('mirror_document','redaction','phantom_relation')))then raise exception 'invalid_interference';end if;u:=now()+case when t in('label_swap','salto')then interval '5 seconds'else interval '8 seconds'end;update pani_private.eco_anchor set interference=jsonb_build_object('type',t,'until',u,'ack','INTERFERÊNCIA ECO REGISTRADA'),secret_state=case when c='christian'and t='false_echo'then secret_state||'{"falseEcho":true}'when c='christian'and t='blind_camera'then secret_state||'{"blindCamera":true}'else secret_state end,revision=revision+1 where session_id='W77-02' and crew_id=c and not locked;update pani_private.eco_session set presence_charges=presence_charges-1,revision=revision+1 where session_id='W77-02';
 elsif p_action='rupture' then if s.status<>'convergence'or s.convergence->>'state'<>'open'or not s.rupture_available then raise exception 'rupture_unavailable';end if;c:=p_payload->>'crewId';if not(c=any(pani_private.eco_active_crew()))then raise exception 'invalid_anchor';end if;update pani_private.eco_anchor set interference=jsonb_build_object('type','rupture','until',now()+interval '5 seconds'),revision=revision+1 where session_id='W77-02' and crew_id=c;update pani_private.eco_session set rupture_available=false,revision=revision+1 where session_id='W77-02';
 else raise exception 'unknown_eco_master_action';end if;perform pani_private.eco_log_write('MASTER',p_action,c);return public.pani_eco_master_status(p_pin);
end$$;

revoke all on function public.pani_eco_master_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_eco_master_action(text,text,jsonb) to anon,authenticated;

commit;
