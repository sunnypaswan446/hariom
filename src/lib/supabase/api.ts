
import { supabase } from './client';
import type { Database } from './database.types';
import type { LoanCase, CaseUpdate, LoanCaseDocument, CaseStatus, LoanType, CaseType, Officer, DocumentType, JobProfile } from '@/lib/types';
import { generateUUID } from '@/lib/utils';

type DbLoanCase = Database['public']['Tables']['loan_cases']['Row'];
type DbHistory = Database['public']['Tables']['case_history']['Row'];
type DbDocument = Database['public']['Tables']['case_documents']['Row'];

// --- Mappers ---

function mapHistoryToApp(hist: DbHistory): CaseUpdate {
  return {
    timestamp: hist.timestamp,
    status: hist.status as CaseStatus,
    remarks: hist.remarks,
  };
}

function mapDocumentToApp(doc: DbDocument): LoanCaseDocument {
  return {
    type: doc.document_type as DocumentType,
    uploaded: doc.uploaded,
    file: doc.file_url,
  };
}

function mapDbToApp(
  row: DbLoanCase,
  history: DbHistory[] = [],
  documents: DbDocument[] = []
): LoanCase {
  return {
    id: row.id,
    applicantName: row.applicant_name,
    loanAmount: row.loan_amount,
    loanType: row.loan_type as LoanType,
    caseType: row.case_type as CaseType,
    contactNumber: row.contact_number,
    email: row.email,
    address: row.address,
    applicationDate: row.application_date,
    teamMember: row.team_member as Officer,
    status: row.status as CaseStatus,
    notes: row.notes || '',
    history: history.map(mapHistoryToApp),
    salary: row.salary,
    location: row.location,
    dob: row.dob,
    panCardNumber: row.pan_card_number,
    jobProfile: row.job_profile as JobProfile,
    jobDesignation: row.job_designation,
    referenceName: row.reference_name,
    bankName: row.bank_name,
    otherBankName: row.other_bank_name || undefined,
    bankOfficeSm: row.bank_office_sm,
    documents: documents.map(mapDocumentToApp),
    tenure: row.tenure,
    obligation: row.obligation,
    approvedAmount: row.approved_amount || undefined,
    roi: row.roi || undefined,
    approvedTenure: row.approved_tenure || undefined,
    processingFee: row.processing_fee || undefined,
    insuranceAmount: row.insurance_amount || undefined,
  };
}

// --- API Functions ---

export async function getAllLoanCases(): Promise<LoanCase[]> {
  const { data, error: casesError } = await supabase
    .from('loan_cases')
    .select('*')
    .order('created_at', { ascending: false });

  const cases = data as DbLoanCase[] | null;

  if (casesError) {
    console.error('Error fetching loan cases:', casesError);
    throw new Error(casesError.message);
  }

  // Fetch all history and documents (optimized: separate queries vs N+1)
  // For a large dataset, we might want to fetch only for the displayed page, but here we fetching all.
  // Actually, fetching all history/documents for ALL cases might be heavy. 
  // For now, let's keep it simple: We map basic details. 
  // If the UI expects all details in the list, we need them.
  // Let's do a simple approach: Fetch for each case (N+1) or fetch all and join in memory.
  // Given 400+ items, fetching all history/docs might be too much. 
  // Does the list view SHOW history/docs? 
  // The type `LoanCase` includes them.
  // Let's optimize: fetch all history/docs in one go if possible, or just fetch main cases and leave history/docs empty for list view if not needed.
  // User asked to "Replace step by step data".
  // Let's fetch all history and documents. 

  let history: any[] = [];
  try {
    const { data, error } = await supabase.from('case_history').select('*');
    if (error) console.error('Error fetching history:', error);
    else history = data || [];
  } catch (e) {
    console.error('Exception fetching history:', e);
  }

  let documents: any[] = [];
  try {
    const { data, error } = await supabase.from('case_documents').select('*');
    if (error) console.error('Error fetching documents:', error);
    else documents = data || [];
  } catch (e) {
    console.error('Exception fetching documents:', e);
  }

  if (!cases) return [];

  return cases.map((row) => {
    const caseHistory = history ? history.filter(h => h.case_id === row.id) : [];
    const caseDocs = documents ? documents.filter(d => d.case_id === row.id) : [];
    return mapDbToApp(row, caseHistory, caseDocs);
  });
}

export async function getLoanCaseById(id: string): Promise<LoanCase | null> {
  const { data: row, error: caseError } = await supabase
    .from('loan_cases')
    .select('*')
    .eq('id', id)
    .single();

  if (caseError) {
    if (caseError.code === 'PGRST116') return null; // Not found
    console.error(`Error fetching loan case ${id}:`, caseError);
    throw new Error(caseError.message);
  }

  let history: any[] = [];
  try {
    const { data, error } = await supabase
      .from('case_history')
      .select('*')
      .eq('case_id', id)
      .order('timestamp', { ascending: false });
    if (error) console.error('History fetch error:', error);
    else history = data || [];
  } catch (e) { console.error('History exception:', e); }

  let documents: any[] = [];
  try {
    const { data, error } = await supabase
      .from('case_documents')
      .select('*')
      .eq('case_id', id);
    if (error) console.error('Documents fetch error:', error);
    else documents = data || [];
  } catch (e) { console.error('Documents exception:', e); }

  return mapDbToApp(row, history, documents);
}

// ... (existing code)

export async function getDistinctOfficers(): Promise<string[]> {
  const { data, error } = await supabase
    .from('loan_cases')
    .select('team_member')
    .returns<{ team_member: string }[]>();
    
  if (error) {
    console.error('Error fetching officers:', error);
    return [];
  }
  
  if (!data) return [];
  
  // Unique values
  return Array.from(new Set(data.map(d => d.team_member))).sort();
}



export async function createLoanCase(
  newCase: Omit<LoanCase, 'id' | 'history'>
): Promise<LoanCase | null> {
  
  const dbPayload: Database['public']['Tables']['loan_cases']['Insert'] = {
    id: generateUUID(),
    applicant_name: newCase.applicantName,
    loan_amount: newCase.loanAmount,
    loan_type: newCase.loanType,
    case_type: newCase.caseType,
    contact_number: newCase.contactNumber,
    email: newCase.email,
    address: newCase.address,
    application_date: newCase.applicationDate,
    team_member: newCase.teamMember,
    status: newCase.status,
    notes: newCase.notes,
    salary: newCase.salary,
    location: newCase.location,
    dob: newCase.dob,
    pan_card_number: newCase.panCardNumber,
    job_profile: newCase.jobProfile,
    job_designation: newCase.jobDesignation,
    reference_name: newCase.referenceName,
    bank_name: newCase.bankName,
    other_bank_name: newCase.otherBankName,
    bank_office_sm: newCase.bankOfficeSm,
    tenure: newCase.tenure,
    obligation: newCase.obligation,
    // Optional / Pending approval fields
    approved_amount: newCase.approvedAmount,
    roi: newCase.roi,
    approved_tenure: newCase.approvedTenure,
    processing_fee: newCase.processingFee,
    insurance_amount: newCase.insuranceAmount,
  };

  const { data, error } = await supabase
    .from('loan_cases')
    .insert(dbPayload as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating loan case:', error);
    throw new Error(error.message);
  }

  // Note: Document upload handling would go here. 
  // For now we return the created case without documents (they are separate).
  
  // We also need to insert initial documents metadata if any?
  // The UI currently handles file objects which need actual upload.
  // We'll leave document insertion for a separate step or loop here if needed.
  // For this step, we just ensure the case is created.

  return mapDbToApp(data);
}

export async function updateLoanCaseStatus(
  id: string,
  status: CaseStatus,
  remarks: string,
  details?: Partial<Pick<LoanCase, 'approvedAmount' | 'roi' | 'approvedTenure' | 'processingFee' | 'insuranceAmount'>>
): Promise<void> {

  // 1. Prepare updates for loan_cases table
  const caseUpdates: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (details) {
    if (details.approvedAmount !== undefined) caseUpdates.approved_amount = details.approvedAmount;
    if (details.roi !== undefined) caseUpdates.roi = details.roi;
    if (details.approvedTenure !== undefined) caseUpdates.approved_tenure = details.approvedTenure;
    if (details.processingFee !== undefined) caseUpdates.processing_fee = details.processingFee;
    if (details.insuranceAmount !== undefined) caseUpdates.insurance_amount = details.insuranceAmount;
  }

  const { error: updateError } = await supabase
    .from('loan_cases')
    .update(caseUpdates as any)
    .eq('id', id);

  if (updateError) {
    console.error(`Error updating case ${id} status:`, updateError);
    throw new Error(updateError.message);
  }

  // 2. Insert into case_history table
  const historyPayload: Database['public']['Tables']['case_history']['Insert'] = {
    case_id: id,
    status,
    remarks,
    timestamp: new Date().toISOString(),
  };

  const { error: historyError } = await supabase
    .from('case_history')
    .insert(historyPayload as any);

  if (historyError) {
     console.error(`Error inserting history for case ${id}:`, historyError);
     // Note: if history fails but update succeeded, we are in inconsistent state.
     // Ideally use RPC or transaction, but client-side sequential is OK for now.
  }
}

// --- Configuration API ---

export interface AppConfigItem {
  id: string;
  category: string;
  value: string;
  is_active: boolean;
  display_order: number;
}

export async function fetchAppConfig(): Promise<AppConfigItem[]> {
  const { data, error } = await supabase
    .from('app_configuration' as any) // Cast to any because table might not be in types yet
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching app config:', error);
    // Fallback to empty if table doesn't exist yet, to not break app completely
    return [];
  }
  
  return data as AppConfigItem[];
}

export async function addAppConfigItem(category: string, value: string): Promise<AppConfigItem | null> {
    const { data, error } = await supabase
        .from('app_configuration' as any)
        .insert({ category, value, is_active: true } as any)
        .select()
        .single();
    
    if (error) {
        console.error('Error adding config item:', error);
        throw new Error(error.message);
    }
    return data as AppConfigItem;
}

export async function deleteAppConfigItem(id: string): Promise<void> {
    const { error } = await supabase
        .from('app_configuration' as any)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting config item:', error);
        throw new Error(error.message);
    }
}

export async function initAppConfig(defaults: Omit<AppConfigItem, 'id' | 'created_at'>[]): Promise<void> {
    // 1. Check if empty
    const { count, error: countError } = await supabase
        .from('app_configuration' as any)
        .select('*', { count: 'exact', head: true });
        
    if (countError) throw new Error(countError.message);
    
    if (count && count > 0) {
        throw new Error('Configuration already initialized (table not empty).');
    }

    // 2. Insert defaults
    const { error } = await supabase
        .from('app_configuration' as any)
        .insert(defaults as any);
        
    if (error) throw new Error(error.message);
}
