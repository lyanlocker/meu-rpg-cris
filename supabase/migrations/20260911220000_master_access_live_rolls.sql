create table if not exists public.dice_rolls (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  character_id uuid not null references public.characters(id) on delete cascade,
  character_name text not null check (char_length(character_name) between 1 and 150),
  label text not null check (char_length(label) between 1 and 150),
  expression text not null check (char_length(expression) between 1 and 40),
  mode text not null check (mode in ('sum','max','min')),
  results jsonb not null check (jsonb_typeof(results) = 'array'),
  total integer not null,
  rolled_at timestamptz not null default now()
);
alter table public.dice_rolls enable row level security;
revoke all on public.dice_rolls from anon;
grant select, insert on public.dice_rolls to authenticated;
grant usage, select on sequence public.dice_rolls_id_seq to authenticated;
create policy "master_reads_rolls" on public.dice_rolls for select to authenticated using ((select private.onix_role()) = 'master');
create policy "authorized_roll_insert" on public.dice_rolls for insert to authenticated with check (
  user_id = (select auth.uid()) and exists (
    select 1 from public.characters c where c.id = character_id and (
      (select private.onix_role()) = 'master' or c.owner_id = (select auth.uid())
    )
  )
);
create index if not exists dice_rolls_recent_idx on public.dice_rolls (rolled_at desc);
create index if not exists dice_rolls_character_idx on public.dice_rolls (character_id, rolled_at desc);
alter publication supabase_realtime add table public.dice_rolls;
