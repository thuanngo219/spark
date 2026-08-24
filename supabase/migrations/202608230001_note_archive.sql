alter table public.items
add column if not exists archived_at timestamptz;

do $$
begin
  alter table public.items
  add constraint only_notes_can_be_archived
  check (type = 'note' or archived_at is null);
exception when duplicate_object then null;
end $$;

create index if not exists items_user_archive_idx
on public.items(user_id, archived_at)
where archived_at is not null;
