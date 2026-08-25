begin;

-- Os eventos foram concluídos. O histórico permanece preservado, mas nenhum
-- terminal volta a publicá-los ou a aceitar novas ações de tripulação/mestre.
update public.pani_sepulcro_state
set released = false,
    released_at = null,
    alien_event_armed = false,
    updated_at = now()
where session_id = 'W77-01';

update pani_private.containment_session
set join_code = null,
    state = state || jsonb_build_object(
      'released', false,
      'status', 'retired',
      'active_event', null,
      'representative_id', null,
      'witness_id', null,
      'paused', false,
      'pause_reason', null,
      'timer_end', null,
      'timer_remaining', null,
      'event', '{}'::jsonb,
      'announcement', null
    ),
    revision = revision + 1,
    updated_at = now()
where session_id = 'W77-01';

-- Revoga somente a superfície pública dos dois sistemas aposentados. As
-- funções e tabelas ficam preservadas para auditoria e recuperação histórica.
do $retire$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and (
        p.proname like 'pani_containment_%'
        or p.proname like 'pani_contraprova_%'
        or p.proname like 'pani_sepulcro_%'
        or p.proname like 'pani_master_containment_%'
      )
  loop
    execute format('revoke all privileges on function %s from public, anon, authenticated', fn.signature);
  end loop;
end
$retire$;

select pg_notify('pgrst', 'reload schema');

commit;
