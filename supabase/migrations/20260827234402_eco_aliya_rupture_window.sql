begin;

-- Preserva integralmente o controle do Mestre já publicado e especializa
-- somente a Ruptura da Aliya para a janela narrativa de aproximadamente 3 s.
do $$
begin
 if to_regprocedure('public.pani_eco_master_action_legacy(text,text,jsonb)') is null then
  alter function public.pani_eco_master_action(text,text,jsonb) rename to pani_eco_master_action_legacy;
 end if;
end$$;

revoke all on function public.pani_eco_master_action_legacy(text,text,jsonb) from public,anon,authenticated;

create or replace function public.pani_eco_master_action(p_pin text,p_action text,p_payload jsonb default '{}')
returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,pani_private
as $$
declare s pani_private.eco_session%rowtype;c text;
begin
 if p_action<>'rupture' or p_payload->>'crewId'<>'aliya' then
  return public.pani_eco_master_action_legacy(p_pin,p_action,p_payload);
 end if;
 if not public.pani_master_valid(p_pin) then raise exception 'unauthorized';end if;
 select * into s from pani_private.eco_session where session_id='W77-02' for update;
 if s.status<>'convergence' or s.convergence->>'state'<>'open' or not s.rupture_available then raise exception 'rupture_unavailable';end if;
 c:='aliya';
 update pani_private.eco_anchor set interference=jsonb_build_object('type','rupture','until',now()+interval '3 seconds'),revision=revision+1,updated_at=now() where session_id='W77-02' and crew_id=c;
 update pani_private.eco_session set rupture_available=false,revision=revision+1,updated_at=now() where session_id='W77-02';
 perform pani_private.eco_log_write('MASTER','rupture',c);
 return public.pani_eco_master_status(p_pin);
end$$;

revoke all on function public.pani_eco_master_action(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_eco_master_action(text,text,jsonb) to anon,authenticated;

comment on function public.pani_eco_master_action_legacy(text,text,jsonb) is 'Implementação interna anterior preservada; acesso público revogado.';

commit;
