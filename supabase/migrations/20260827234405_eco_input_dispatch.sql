begin;

-- Mantém um único RPC de entrada exposto ao navegador. As implementações
-- específicas de INV e da edição OPS ficam sem EXECUTE para anon/authenticated.
do $$
begin
 if to_regprocedure('public.pani_eco_input_legacy(text,text,jsonb)') is null then
  alter function public.pani_eco_input(text,text,jsonb) rename to pani_eco_input_legacy;
 end if;
end$$;

revoke all on function public.pani_eco_input_legacy(text,text,jsonb),public.pani_eco_inv_input(text,text,jsonb),public.pani_eco_ops_edit(text,text,jsonb) from public,anon,authenticated;

create or replace function public.pani_eco_input(p_token text,p_action text,p_payload jsonb default '{}')
returns jsonb
language plpgsql
security definer
set search_path=pg_catalog,public,pani_private
as $$
declare c text;
begin
 c:=pani_private.eco_auth_crew(p_token);
 if c='aliya' and (p_action in('use_help','convergence','inv_convergence') or p_action like 'inv_%') then
  return public.pani_eco_inv_input(p_token,p_action,p_payload);
 elsif c='eklay' and p_action in('ops_place','ops_rotate','ops_move','ops_remove') then
  return public.pani_eco_ops_edit(p_token,p_action,p_payload);
 end if;
 return public.pani_eco_input_legacy(p_token,p_action,p_payload);
end$$;

revoke all on function public.pani_eco_input(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.pani_eco_input(text,text,jsonb) to anon,authenticated;

comment on function public.pani_eco_input_legacy(text,text,jsonb) is 'Implementação interna ECO anterior preservada; acesso público revogado.';

commit;
