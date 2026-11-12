-- Run once in the Supabase SQL Editor. Bot credentials are server-only.
create table if not exists public.telegram_settings (
 id integer primary key check (id = 1),
 bot_token text not null,
 chat_id text not null,
 enabled boolean not null default false
);
alter table public.telegram_settings enable row level security;
revoke all on public.telegram_settings from public, anon, authenticated;
grant select, insert, update on public.telegram_settings to service_role;
