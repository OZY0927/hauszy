-- Run once in the Supabase SQL Editor for the same project used by image storage.
create table if not exists public.project_activity_daily (
  day date not null,
  project_id text not null check (project_id ~ '^[a-zA-Z0-9_-]{1,128}$'),
  event text not null check (event in ('click','view','floor_plan','contact')),
  count bigint not null default 0 check (count >= 0),
  primary key (day, project_id, event)
);
alter table public.project_activity_daily enable row level security;
revoke all on public.project_activity_daily from anon, authenticated;
grant select, insert, update on public.project_activity_daily to service_role;
create or replace function public.record_project_activity(p_project_id text, p_event text)
returns void language sql security invoker set search_path = '' as $$
  insert into public.project_activity_daily (day, project_id, event, count)
  values ((now() at time zone 'Asia/Kuala_Lumpur')::date, p_project_id, p_event, 1)
  on conflict (day, project_id, event) do update
  set count = public.project_activity_daily.count + 1;
$$;
revoke all on function public.record_project_activity(text,text) from public, anon, authenticated;
grant execute on function public.record_project_activity(text,text) to service_role;
