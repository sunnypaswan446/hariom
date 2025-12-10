-- Create loan_cases table
CREATE TABLE IF NOT EXISTS loan_cases (
  id TEXT PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  loan_amount NUMERIC NOT NULL,
  loan_type TEXT NOT NULL,
  case_type TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  application_date TEXT NOT NULL,
  team_member TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT DEFAULT '',
  salary NUMERIC NOT NULL,
  location TEXT NOT NULL,
  dob TEXT NOT NULL,
  pan_card_number TEXT NOT NULL,
  job_profile TEXT NOT NULL,
  job_designation TEXT NOT NULL,
  reference_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  other_bank_name TEXT,
  bank_office_sm TEXT NOT NULL,
  tenure INTEGER NOT NULL,
  obligation NUMERIC NOT NULL,
  approved_amount NUMERIC,
  roi NUMERIC,
  approved_tenure INTEGER,
  processing_fee NUMERIC,
  insurance_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_history table
CREATE TABLE IF NOT EXISTS case_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  remarks TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create case_documents table
CREATE TABLE IF NOT EXISTS case_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT NOT NULL REFERENCES loan_cases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  uploaded BOOLEAN DEFAULT FALSE,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_cases_status ON loan_cases(status);
CREATE INDEX IF NOT EXISTS idx_loan_cases_team_member ON loan_cases(team_member);
CREATE INDEX IF NOT EXISTS idx_loan_cases_application_date ON loan_cases(application_date);
CREATE INDEX IF NOT EXISTS idx_case_history_case_id ON case_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_loan_cases_updated_at
  BEFORE UPDATE ON loan_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_documents_updated_at
  BEFORE UPDATE ON case_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE loan_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON loan_cases
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON case_history
  FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON case_documents
  FOR ALL USING (true);
