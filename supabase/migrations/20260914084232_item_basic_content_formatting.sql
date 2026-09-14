begin;

-- Additive change: keep existing plain text and all ownership/RLS policies.
alter table public.items add column if not exists description_format jsonb;
alter table public.items drop constraint if exists items_description_length;
alter table public.items add constraint items_description_length
  check (description is null or char_length(description) between 1 and 4000) not valid;
alter table public.items validate constraint items_description_length;
alter table public.items add constraint items_description_format_array
  check (description_format is null or (jsonb_typeof(description_format) = 'array' and octet_length(description_format::text) <= 512000));

comment on column public.items.description_format is
  'Optional array of text runs with bold/italic/underline booleans. Only used when concatenated text matches description; never raw HTML.';

commit;
