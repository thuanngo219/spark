alter table public.items
add column if not exists description text;

alter table public.items
drop constraint if exists items_title_check;

alter table public.items
drop constraint if exists items_title_length;

alter table public.items
add constraint items_title_length
check (char_length(title) between 1 and 100)
not valid;

do $$
begin
  alter table public.items
  add constraint only_tasks_have_description
  check (
    description is null
    or (type = 'task' and char_length(description) between 1 and 2000)
  )
  not valid;
exception when duplicate_object then null;
end $$;
