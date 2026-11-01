-- Run in Supabase SQL Editor. Authentication users must be invited by an administrator.
create extension if not exists pgcrypto;
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, created_at timestamptz default now());
create table public.memberships (user_id uuid primary key references auth.users(id) on delete cascade, role text not null check(role in ('admin','manager','editor','reviewer','publisher')), active boolean not null default true);
create table public.agents (id uuid primary key default gen_random_uuid(), name text not null, specialty text not null, enabled boolean default false, created_at timestamptz default now());
create table public.sermons (id uuid primary key default gen_random_uuid(), title text not null, program text not null check(program in ('Sunday Worship','Wednesday Bible Study','Healing School','Other')), status text not null default 'queued' check(status in ('queued','processing','review','approved','published','failed')), created_by uuid references auth.users(id), created_at timestamptz default now());
create table public.tasks (id uuid primary key default gen_random_uuid(), sermon_id uuid not null references public.sermons(id) on delete cascade, title text not null, status text not null default 'queued' check(status in ('queued','working','review','done','failed')), assignee_type text not null check(assignee_type in ('human','agent')), assignee_user_id uuid references auth.users(id), assignee_agent_id uuid references public.agents(id), created_at timestamptz default now(), check ((assignee_type='human' and assignee_agent_id is null) or (assignee_type='agent' and assignee_user_id is null)));
create table public.assets (id uuid primary key default gen_random_uuid(), sermon_id uuid not null references public.sermons(id) on delete cascade, task_id uuid references public.tasks(id), storage_path text not null, media_type text, created_at timestamptz default now());
create table public.approvals (id uuid primary key default gen_random_uuid(), sermon_id uuid not null references public.sermons(id) on delete cascade, status text not null default 'pending' check(status in ('pending','approved','rejected','revision_requested')), decided_by uuid references auth.users(id), decided_at timestamptz, created_at timestamptz default now());
create table public.activity_events (id uuid primary key default gen_random_uuid(), sermon_id uuid references public.sermons(id), actor_id uuid references auth.users(id), action text not null, details jsonb default '{}'::jsonb, created_at timestamptz default now());
create or replace function public.is_team_member() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.memberships where user_id=(select auth.uid()) and active=true)$$;
create or replace function public.has_role(roles text[]) returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.memberships where user_id=(select auth.uid()) and active=true and role=any(roles))$$;
revoke all on function public.is_team_member() from public; grant execute on function public.is_team_member() to authenticated;
revoke all on function public.has_role(text[]) from public; grant execute on function public.has_role(text[]) to authenticated;
alter table public.profiles enable row level security;alter table public.memberships enable row level security;alter table public.agents enable row level security;alter table public.sermons enable row level security;alter table public.tasks enable row level security;alter table public.assets enable row level security;alter table public.approvals enable row level security;alter table public.activity_events enable row level security;
create policy profiles_self on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy membership_self on public.memberships for select to authenticated using(user_id=(select auth.uid()));
create policy agents_team_read on public.agents for select to authenticated using(public.is_team_member());
create policy sermons_team_read on public.sermons for select to authenticated using(public.is_team_member());
create policy sermons_manager_create on public.sermons for insert to authenticated with check(public.has_role(array['admin','manager']) and created_by=(select auth.uid()));
create policy tasks_team_read on public.tasks for select to authenticated using(public.is_team_member());
create policy assets_team_read on public.assets for select to authenticated using(public.is_team_member());
create policy approvals_team_read on public.approvals for select to authenticated using(public.is_team_member());
create policy activity_team_read on public.activity_events for select to authenticated using(public.is_team_member());
-- No public signup route, no direct approval mutation policy, and no public storage bucket.
-- Bootstrap first admin after inviting user, using Supabase SQL Editor:
-- insert into public.memberships(user_id,role) values ('YOUR_AUTH_USER_UUID','admin');
