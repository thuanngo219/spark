begin;

alter table public.items
  add constraint items_date_range
  check (start_date is null or due_date is null or start_date <= due_date) not valid;
alter table public.items validate constraint items_date_range;

commit;
