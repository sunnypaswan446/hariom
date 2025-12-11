-- Create table for storing application configuration / lookup values
create table if not exists public.app_configuration (
  id uuid default gen_random_uuid() primary key,
  category text not null, -- e.g. 'LOAN_TYPE', 'CASE_STATUS', 'BANK_NAME'
  value text not null,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.app_configuration enable row level security;

-- Create policy to allow authenticated users to read and write (since it's a dashboard app)
-- Ideally write should be restricted to admins, but for now we allow authenticated users
create policy "Enable read access for all users"
on public.app_configuration for select
using (true);

create policy "Enable insert for authenticated users"
on public.app_configuration for insert
with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users"
on public.app_configuration for update
using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users"
on public.app_configuration for delete
using (auth.role() = 'authenticated');

-- Insert initial default values from constants
insert into public.app_configuration (category, value, display_order) values
-- Loan Types
('LOAN_TYPE', 'Personal', 10),
('LOAN_TYPE', 'Home', 20),
('LOAN_TYPE', 'Car', 30),
('LOAN_TYPE', 'Business', 40),
('LOAN_TYPE', 'Education', 50),

-- Case Types
('CASE_TYPE', 'New', 10),
('CASE_TYPE', 'BT', 20),
('CASE_TYPE', 'Top-Up', 30),

-- Job Profiles
('JOB_PROFILE', 'Government', 10),
('JOB_PROFILE', 'Private', 20),
('JOB_PROFILE', 'Business', 30),

-- Case Status
('CASE_STATUS', 'Document Pending', 10),
('CASE_STATUS', 'Complete', 20),
('CASE_STATUS', 'Login', 30),
('CASE_STATUS', 'In Progress', 40),
('CASE_STATUS', 'Hold', 50),
('CASE_STATUS', 'RIC', 60),
('CASE_STATUS', 'Reject', 70),
('CASE_STATUS', 'Disbursed', 80),
('CASE_STATUS', 'Approved', 90),

-- Document Types
('DOCUMENT_TYPE', 'TVR Form', 10),
('DOCUMENT_TYPE', 'Aadhaar Card', 20),
('DOCUMENT_TYPE', 'Pan Card', 30),
('DOCUMENT_TYPE', 'Salary Slip', 40),
('DOCUMENT_TYPE', 'Bank Statement', 50),
('DOCUMENT_TYPE', 'Loan Tracks', 60),

-- Bank Names (sample)
('BANK_NAME', 'HDFC Bank', 10),
('BANK_NAME', 'ICICI Bank', 20),
('BANK_NAME', 'Axis Bank', 30),
('BANK_NAME', 'Kotak Mahindra Bank', 40),
('BANK_NAME', 'SBI', 50),
('BANK_NAME', 'Other', 999);
