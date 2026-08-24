-- ADUNATIO Canon Bible v1.5 — permanent migration of the existing INV slot.
-- The access hash, module, progress and document associations are preserved.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $guard$
begin
  if exists (select 1 from public.crew_access where crew_id = 'viego')
     and exists (select 1 from public.crew_access where crew_id = 'aliya') then
    raise exception 'Both legacy and canonical INV slots exist; migration aborted.';
  end if;

  if not exists (select 1 from public.crew_access where crew_id in ('viego','aliya') and module = 'inv') then
    raise exception 'INV slot not found; migration aborted.';
  end if;
end
$guard$;

alter table public.pani_access_unlocks drop constraint if exists pani_access_unlocks_crew_id_fkey;
alter table public.pani_access_unlocks add constraint pani_access_unlocks_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table public.pani_assistance_threads drop constraint if exists pani_assistance_threads_crew_id_fkey;
alter table public.pani_assistance_threads add constraint pani_assistance_threads_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table public.pani_decode_queue drop constraint if exists pani_decode_queue_crew_id_fkey;
alter table public.pani_decode_queue add constraint pani_decode_queue_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table public.pani_file_reads drop constraint if exists pani_file_reads_crew_id_fkey;
alter table public.pani_file_reads add constraint pani_file_reads_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table public.pani_file_unlocks drop constraint if exists pani_file_unlocks_crew_id_fkey;
alter table public.pani_file_unlocks add constraint pani_file_unlocks_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table public.pani_reports drop constraint if exists pani_reports_crew_id_fkey;
alter table public.pani_reports add constraint pani_reports_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete restrict;

alter table public.pani_sepulcro_crew drop constraint if exists pani_sepulcro_crew_crew_id_fkey;
alter table public.pani_sepulcro_crew add constraint pani_sepulcro_crew_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table pani_private.containment_participant drop constraint if exists containment_participant_crew_id_fkey;
alter table pani_private.containment_participant add constraint containment_participant_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

alter table pani_private.containment_vote drop constraint if exists containment_vote_crew_id_fkey;
alter table pani_private.containment_vote add constraint containment_vote_crew_id_fkey
  foreign key (crew_id) references public.crew_access(crew_id) on update cascade on delete cascade;

do $slot$
declare
  previous_token_hash text;
begin
  select token_hash into previous_token_hash
  from public.crew_access
  where crew_id = 'viego' and module = 'inv';

  if previous_token_hash is not null then
    update public.crew_access
    set crew_id = 'aliya',
        display_name = 'Aliya Kessler',
        occupation = 'Bióloga marinha / Águas profundas e ambientes extremos',
        mission_role = 'Investigação Paranormal e Coordenação — interpretação de fenômenos, correlação de evidências, registros e organização da investigação.'
    where crew_id = 'viego' and module = 'inv';

    if (select token_hash from public.crew_access where crew_id = 'aliya') is distinct from previous_token_hash then
      raise exception 'INV access hash changed unexpectedly; migration aborted.';
    end if;
  else
    update public.crew_access
    set display_name = 'Aliya Kessler',
        occupation = 'Bióloga marinha / Águas profundas e ambientes extremos',
        mission_role = 'Investigação Paranormal e Coordenação — interpretação de fenômenos, correlação de evidências, registros e organização da investigação.'
    where crew_id = 'aliya' and module = 'inv';
  end if;
end
$slot$;

-- Tables without a foreign key to crew_access retain their rows explicitly.
update public.crew_progress set crew_id = 'aliya' where crew_id = 'viego';
update public.pani_signal_deliveries set crew_id = 'aliya' where crew_id = 'viego';

-- File visibility is an array of crew identifiers inside JSONB.
update public.pani_files as f
set visibility = jsonb_set(
  f.visibility,
  '{crew}',
  coalesce((
    select jsonb_agg(case when member = 'viego' then 'aliya' else member end)
    from jsonb_array_elements_text(coalesce(f.visibility->'crew','[]'::jsonb)) as members(member)
  ), '[]'::jsonb),
  true
)
where coalesce(f.visibility->'crew','[]'::jsonb) ? 'viego';

-- Snapshot names and historical logs follow the canonical identity.
update public.pani_reports
set crew_name = 'Aliya Kessler'
where crew_id = 'aliya';

update public.event_log
set actor = case actor when 'viego' then 'aliya' when 'Viego Magalhães' then 'Aliya Kessler' else actor end,
    detail = replace(replace(detail, 'Viego Magalhães', 'Aliya Kessler'), 'viego', 'aliya')
where to_jsonb(event_log)::text ~* '\m(viego)\M';

update pani_private.containment_log
set actor = case actor when 'viego' then 'aliya' when 'Viego Magalhães' then 'Aliya Kessler' else actor end,
    detail = replace(replace(detail, 'Viego Magalhães', 'Aliya Kessler'), 'viego', 'aliya')
where to_jsonb(containment_log)::text ~* '\m(viego)\M';

update pani_private.containment_session
set state = replace(state::text, '"viego"', '"aliya"')::jsonb,
    secret_state = replace(secret_state::text, '"viego"', '"aliya"')::jsonb
where to_jsonb(containment_session)::text ~* '\m(viego)\M';

-- Preserve the legacy contingency logic while pointing it at the canonical ID.
do $function$
declare
  definition text;
begin
  select replace(pg_get_functiondef(p.oid), '''viego''', '''aliya''')
  into definition
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'pani_crew_solve' and p.prokind = 'f'
  limit 1;

  if definition is not null then execute definition; end if;
end
$function$;

drop policy if exists event_log_insert on public.event_log;
create policy event_log_insert on public.event_log
  for insert to anon, authenticated
  with check (actor = any (array['gilbert','willy','aliya','alice','eklay','christian']::text[]));

do $verify$
begin
  if exists (select 1 from public.crew_access where crew_id = 'viego') then
    raise exception 'Legacy crew ID remains after migration.';
  end if;

  if not exists (
    select 1 from public.crew_access
    where crew_id = 'aliya'
      and display_name = 'Aliya Kessler'
      and module = 'inv'
      and occupation = 'Bióloga marinha / Águas profundas e ambientes extremos'
      and mission_role = 'Investigação Paranormal e Coordenação — interpretação de fenômenos, correlação de evidências, registros e organização da investigação.'
      and length(token_hash) = 64
  ) then
    raise exception 'Canonical Aliya Kessler INV slot failed validation.';
  end if;

  if exists (select 1 from public.pani_files where coalesce(visibility->'crew','[]'::jsonb) ? 'viego') then
    raise exception 'Legacy file visibility remains after migration.';
  end if;
end
$verify$;

commit;
