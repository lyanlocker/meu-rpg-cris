create index if not exists dice_rolls_user_idx on public.dice_rolls (user_id);
drop policy if exists "member_read" on public.members;
create policy "member_read" on public.members for select to authenticated using (
  email = lower((select auth.jwt()) ->> 'email') or (select private.onix_role()) = 'master'
);
