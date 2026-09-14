begin;

alter table public.items
add column if not exists start_date date;

-- A legacy row predates the 100-character title rule. PostgreSQL enforces a
-- NOT VALID constraint on UPDATE, so preserve that constraint around backfill
-- without rewriting or truncating user content.
alter table public.items
drop constraint if exists items_title_length;

update public.items
set start_date = coalesce(
  (created_at at time zone 'Asia/Ho_Chi_Minh')::date,
  date '2026-09-03'
)
where start_date is null;

alter table public.items
add constraint items_title_length
check (char_length(title) between 1 and 100)
not valid;

create index if not exists items_user_start_date_idx
on public.items(user_id, start_date);

commit;
