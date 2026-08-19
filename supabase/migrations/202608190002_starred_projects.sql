alter table public.projects
add column if not exists is_starred boolean not null default false;

create index if not exists projects_user_starred_idx
on public.projects(user_id, is_starred)
where is_starred;
