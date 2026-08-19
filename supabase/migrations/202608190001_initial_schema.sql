create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  type text not null check (type in ('task', 'note')),
  title text not null check (
    (type = 'task' and char_length(title) between 1 and 200)
    or (type = 'note' and char_length(title) between 1 and 500)
  ),
  due_date date,
  completed_at timestamptz,
  is_important boolean not null default false,
  is_urgent boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_cannot_be_completed check (type = 'task' or completed_at is null)
);

create index if not exists projects_user_position_idx on public.projects(user_id, position);
create index if not exists items_user_date_idx on public.items(user_id, type, completed_at, due_date);
create index if not exists items_user_project_idx on public.items(user_id, project_id, completed_at);
create index if not exists items_user_important_idx on public.items(user_id, is_important) where is_important;
create index if not exists items_user_urgent_idx on public.items(user_id, is_urgent) where is_urgent;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists items_set_updated_at on public.items;
create trigger items_set_updated_at before update on public.items
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.items enable row level security;

create policy "projects_select_own" on public.projects for select to authenticated using ((select auth.uid()) = user_id);
create policy "projects_insert_own" on public.projects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "projects_update_own" on public.projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "projects_delete_own" on public.projects for delete to authenticated using ((select auth.uid()) = user_id);

create policy "items_select_own" on public.items for select to authenticated using ((select auth.uid()) = user_id);
create policy "items_insert_own" on public.items for insert to authenticated with check (
  (select auth.uid()) = user_id
  and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())))
);
create policy "items_update_own" on public.items for update to authenticated using ((select auth.uid()) = user_id) with check (
  (select auth.uid()) = user_id
  and (project_id is null or exists (select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())))
);
create policy "items_delete_own" on public.items for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.items to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null;
end $$;
