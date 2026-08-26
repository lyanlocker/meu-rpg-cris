begin;
create index if not exists eco_anchor_crew_idx on pani_private.eco_anchor(crew_id);
create index if not exists eco_session_seed_idx on pani_private.eco_session(seed_id);
create index if not exists eco_log_session_created_idx on pani_private.eco_log(session_id,created_at desc);
commit;
