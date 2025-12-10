// @ts-nocheck
import { supabase } from './client';
import type { LoanCase, CaseUpdate, LoanCaseDocument } from '../types';
import type { Database } from './database.types';

type DbLoanCase = Database['public']['Tables']['loan_cases']['Row'];
type DbCaseHistory = Database['public']['Tables']['case_history']['Row'];
type DbCaseDocument = Database['public']['Tables']['case_documents']['Row'];

/**
 * Transform database row to LoanCase type
 */
function transformDbRowToLoanCase(row: any, history: CaseUpdate[] = [], documents: LoanCaseDocument[] = []): LoanCase {
    return {
        id: row.id,
        applicantName: row.applicant_name,
        loanAmount: row.loan_amount,
        loanType: row.loan_type,
        caseType: row.case_type,
        contactNumber: row.contact_number,
        email: row.email,
        address: row.address,
        applicationDate: row.application_date,
        teamMember: row.team_member,
        status: row.status,
        notes: row.notes || '',
        history,
        salary: row.salary,
        location: row.location,
        dob: row.dob,
        panCardNumber: row.pan_card_number,
        jobProfile: row.job_profile,
        jobDesignation: row.job_designation,
        referenceName: row.reference_name,
        bankName: row.bank_name,
        otherBankName: row.other_bank_name,
        bankOfficeSm: row.bank_office_sm,
        documents,
        tenure: row.tenure,
        obligation: row.obligation,
        approvedAmount: row.approved_amount,
        roi: row.roi,
        approvedTenure: row.approved_tenure,
        processingFee: row.processing_fee,
        insuranceAmount: row.insurance_amount,
    };
}

/**
 * Transform LoanCase to database insert/update format
 */
function transformLoanCaseToDbRow(loanCase: Partial<LoanCase>) {
    return {
        id: loanCase.id,
        applicant_name: loanCase.applicantName,
        loan_amount: loanCase.loanAmount,
        loan_type: loanCase.loanType,
        case_type: loanCase.caseType,
        contact_number: loanCase.contactNumber,
        email: loanCase.email,
        address: loanCase.address,
        application_date: loanCase.applicationDate,
        team_member: loanCase.teamMember,
        status: loanCase.status,
        notes: loanCase.notes,
        salary: loanCase.salary,
        location: loanCase.location,
        dob: loanCase.dob,
        pan_card_number: loanCase.panCardNumber,
        job_profile: loanCase.jobProfile,
        job_designation: loanCase.jobDesignation,
        reference_name: loanCase.referenceName,
        bank_name: loanCase.bankName,
        other_bank_name: loanCase.otherBankName,
        bank_office_sm: loanCase.bankOfficeSm,
        tenure: loanCase.tenure,
        obligation: loanCase.obligation,
        approved_amount: loanCase.approvedAmount,
        roi: loanCase.roi,
        approved_tenure: loanCase.approvedTenure,
        processing_fee: loanCase.processingFee,
        insurance_amount: loanCase.insuranceAmount,
    };
}

/**
 * Fetch all loan cases with their history and documents
 */
export async function getAllLoanCases(): Promise<LoanCase[]> {
    const { data: cases, error: casesError } = await supabase
        .from('loan_cases')
        .select('*')
        .order('application_date', { ascending: false });

    if (casesError) {
        console.error('Error fetching loan cases:', casesError);
        throw casesError;
    }

    if (!cases || cases.length === 0) {
        return [];
    }

    // Fetch all history and documents in parallel
    const caseIds = cases.map(c => c.id);

    const [historyResult, documentsResult] = await Promise.all([
        supabase
            .from('case_history')
            .select('*')
            .in('case_id', caseIds)
            .order('timestamp', { ascending: true }),
        supabase
            .from('case_documents')
            .select('*')
            .in('case_id', caseIds)
    ]);

    if (historyResult.error) {
        console.error('Error fetching case history:', historyResult.error);
    }

    if (documentsResult.error) {
        console.error('Error fetching case documents:', documentsResult.error);
    }

    // Group history and documents by case_id
    const historyByCase = new Map<string, CaseUpdate[]>();
    const documentsByCase = new Map<string, LoanCaseDocument[]>();

    historyResult.data?.forEach(h => {
        if (!historyByCase.has(h.case_id)) {
            historyByCase.set(h.case_id, []);
        }
        historyByCase.get(h.case_id)!.push({
            timestamp: h.timestamp,
            status: h.status,
            remarks: h.remarks,
        });
    });

    documentsResult.data?.forEach(d => {
        if (!documentsByCase.has(d.case_id)) {
            documentsByCase.set(d.case_id, []);
        }
        documentsByCase.get(d.case_id)!.push({
            type: d.document_type as any,
            uploaded: d.uploaded,
            file: d.file_url,
        });
    });

    return cases.map(c =>
        transformDbRowToLoanCase(
            c,
            historyByCase.get(c.id) || [],
            documentsByCase.get(c.id) || []
        )
    );
}

/**
 * Fetch a single loan case by ID
 */
export async function getLoanCaseById(id: string): Promise<LoanCase | null> {
    const { data: caseData, error: caseError } = await supabase
        .from('loan_cases')
        .select('*')
        .eq('id', id)
        .single();

    if (caseError) {
        console.error('Error fetching loan case:', caseError);
        throw caseError;
    }

    if (!caseData) {
        return null;
    }

    // Fetch history and documents
    const [historyResult, documentsResult] = await Promise.all([
        supabase
            .from('case_history')
            .select('*')
            .eq('case_id', id)
            .order('timestamp', { ascending: true }),
        supabase
            .from('case_documents')
            .select('*')
            .eq('case_id', id)
    ]);

    const history: CaseUpdate[] = historyResult.data?.map(h => ({
        timestamp: h.timestamp,
        status: h.status,
        remarks: h.remarks,
    })) || [];

    const documents: LoanCaseDocument[] = documentsResult.data?.map(d => ({
        type: d.document_type as any,
        uploaded: d.uploaded,
        file: d.file_url,
    })) || [];

    return transformDbRowToLoanCase(caseData, history, documents);
}

/**
 * Create a new loan case
 */
export async function createLoanCase(loanCase: LoanCase): Promise<LoanCase> {
    const dbRow = transformLoanCaseToDbRow(loanCase);

    const { data, error } = await supabase
        .from('loan_cases')
        .insert(dbRow)
        .select()
        .single();

    if (error) {
        console.error('Error creating loan case:', error);
        throw error;
    }

    // Insert history
    if (loanCase.history && loanCase.history.length > 0) {
        const historyRows = loanCase.history.map(h => ({
            case_id: loanCase.id,
            timestamp: h.timestamp,
            status: h.status,
            remarks: h.remarks,
        }));

        const { error: historyError } = await supabase
            .from('case_history')
            .insert(historyRows);

        if (historyError) {
            console.error('Error creating case history:', historyError);
        }
    }

    // Insert documents
    if (loanCase.documents && loanCase.documents.length > 0) {
        const documentRows = loanCase.documents.map(d => ({
            case_id: loanCase.id,
            document_type: d.type,
            uploaded: d.uploaded,
            file_url: typeof d.file === 'string' ? d.file : null,
        }));

        const { error: documentsError } = await supabase
            .from('case_documents')
            .insert(documentRows);

        if (documentsError) {
            console.error('Error creating case documents:', documentsError);
        }
    }

    return transformDbRowToLoanCase(data, loanCase.history, loanCase.documents);
}

/**
 * Update an existing loan case
 */
export async function updateLoanCase(id: string, updates: Partial<LoanCase>): Promise<LoanCase> {
    const dbRow = transformLoanCaseToDbRow(updates);

    const { data, error } = await supabase
        .from('loan_cases')
        .update(dbRow)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating loan case:', error);
        throw error;
    }

    // Update history if provided
    if (updates.history) {
        // Delete existing history
        await supabase
            .from('case_history')
            .delete()
            .eq('case_id', id);

        // Insert new history
        const historyRows = updates.history.map(h => ({
            case_id: id,
            timestamp: h.timestamp,
            status: h.status,
            remarks: h.remarks,
        }));

        await supabase
            .from('case_history')
            .insert(historyRows);
    }

    // Update documents if provided
    if (updates.documents) {
        // Delete existing documents
        await supabase
            .from('case_documents')
            .delete()
            .eq('case_id', id);

        // Insert new documents
        const documentRows = updates.documents.map(d => ({
            case_id: id,
            document_type: d.type,
            uploaded: d.uploaded,
            file_url: typeof d.file === 'string' ? d.file : null,
        }));

        await supabase
            .from('case_documents')
            .insert(documentRows);
    }

    return getLoanCaseById(id) as Promise<LoanCase>;
}

/**
 * Delete a loan case
 */
export async function deleteLoanCase(id: string): Promise<void> {
    const { error } = await supabase
        .from('loan_cases')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting loan case:', error);
        throw error;
    }
}

/**
 * Add a history entry to a loan case
 */
export async function addCaseHistory(caseId: string, update: CaseUpdate): Promise<void> {
    const { error } = await supabase
        .from('case_history')
        .insert({
            case_id: caseId,
            timestamp: update.timestamp,
            status: update.status,
            remarks: update.remarks,
        });

    if (error) {
        console.error('Error adding case history:', error);
        throw error;
    }
}

/**
 * Update document status
 */
export async function updateDocument(
    caseId: string,
    documentType: string,
    uploaded: boolean,
    fileUrl?: string
): Promise<void> {
    const { error } = await supabase
        .from('case_documents')
        .update({
            uploaded,
            file_url: fileUrl || null,
        })
        .eq('case_id', caseId)
        .eq('document_type', documentType);

    if (error) {
        console.error('Error updating document:', error);
        throw error;
    }
}

/**
 * Search loan cases
 */
export async function searchLoanCases(query: string): Promise<LoanCase[]> {
    const { data: cases, error } = await supabase
        .from('loan_cases')
        .select('*')
        .or(`applicant_name.ilike.%${query}%,email.ilike.%${query}%,id.ilike.%${query}%,contact_number.ilike.%${query}%`)
        .order('application_date', { ascending: false });

    if (error) {
        console.error('Error searching loan cases:', error);
        throw error;
    }

    if (!cases || cases.length === 0) {
        return [];
    }

    // Fetch history and documents for search results
    const caseIds = cases.map(c => c.id);

    const [historyResult, documentsResult] = await Promise.all([
        supabase
            .from('case_history')
            .select('*')
            .in('case_id', caseIds)
            .order('timestamp', { ascending: true }),
        supabase
            .from('case_documents')
            .select('*')
            .in('case_id', caseIds)
    ]);

    const historyByCase = new Map<string, CaseUpdate[]>();
    const documentsByCase = new Map<string, LoanCaseDocument[]>();

    historyResult.data?.forEach(h => {
        if (!historyByCase.has(h.case_id)) {
            historyByCase.set(h.case_id, []);
        }
        historyByCase.get(h.case_id)!.push({
            timestamp: h.timestamp,
            status: h.status,
            remarks: h.remarks,
        });
    });

    documentsResult.data?.forEach(d => {
        if (!documentsByCase.has(d.case_id)) {
            documentsByCase.set(d.case_id, []);
        }
        documentsByCase.get(d.case_id)!.push({
            type: d.document_type as any,
            uploaded: d.uploaded,
            file: d.file_url,
        });
    });

    return cases.map(c =>
        transformDbRowToLoanCase(
            c,
            historyByCase.get(c.id) || [],
            documentsByCase.get(c.id) || []
        )
    );
}
