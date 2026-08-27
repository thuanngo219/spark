alter table public.items
drop constraint if exists only_tasks_have_description;

alter table public.items
drop constraint if exists items_description_length;

alter table public.items
add constraint items_description_length
check (
  description is null
  or char_length(description) between 1 and 2000
)
not valid;
