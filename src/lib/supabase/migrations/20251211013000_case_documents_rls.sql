-- Enable Row Level Security for case_documents
alter table public.case_documents enable row level security;

-- Allow authenticated users to read their case documents.
-- If you need stricter scoping (e.g., only team members), add an ownership column
-- and update the USING clause accordingly.
create policy "Authenticated can select case documents"
on public.case_documents
for select
to authenticated
using (true);

-- Allow authenticated users to insert case documents (metadata rows).
create policy "Authenticated can insert case documents"
on public.case_documents
for insert
to authenticated
with check (true);

-- Service role (used by the server) bypasses RLS automatically.

