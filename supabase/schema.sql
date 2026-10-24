-- Paste this whole file into Supabase: SQL Editor -> New query -> Run.
-- It creates the click counter table and the function the website calls.

-- 1. Table: one row per platform, with a running click count
create table if not exists public.platform_clicks (
  slug text primary key,
  clicks bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Lock the table down. Visitors cannot read or edit it directly.
alter table public.platform_clicks enable row level security;

-- 2. Function: adds 1 to a platform's count (creates the row the first time)
create or replace function public.increment_click(p_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.platform_clicks (slug, clicks)
  values (p_slug, 1)
  on conflict (slug)
  do update set clicks = platform_clicks.clicks + 1,
                updated_at = now();
end;
$$;

-- 3. Only allow the website (anon key) to call that one function
revoke all on function public.increment_click(text) from public;
grant execute on function public.increment_click(text) to anon;
