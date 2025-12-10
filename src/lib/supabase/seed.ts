// @ts-nocheck
import { supabase } from './client';
import { INITIAL_CASES } from '../data';

/**
 * Seed the database with initial data
 * This script will populate your Supabase database with the existing loan cases
 */
export async function seedDatabase() {
    console.log('Starting database seed...');

    try {
        // Insert loan cases
        for (const loanCase of INITIAL_CASES) {
            console.log(`Inserting case: ${loanCase.id}`);

            // Insert main loan case
            const { error: caseError } = await supabase
                .from('loan_cases')
                .insert({
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
                    notes: loanCase.notes || '',
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
                });

            if (caseError) {
                console.error(`Error inserting case ${loanCase.id}:`, caseError);
                continue;
            }

            // Insert case history
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
                    console.error(`Error inserting history for case ${loanCase.id}:`, historyError);
                }
            }

            // Insert case documents
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
                    console.error(`Error inserting documents for case ${loanCase.id}:`, documentsError);
                }
            }
        }

        console.log('Database seed completed successfully!');
        console.log(`Inserted ${INITIAL_CASES.length} loan cases`);
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

/**
 * Clear all data from the database
 * WARNING: This will delete all loan cases, history, and documents
 */
export async function clearDatabase() {
    console.log('Clearing database...');

    try {
        // Delete in order due to foreign key constraints
        await supabase.from('case_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('case_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('loan_cases').delete().neq('id', 'NONE');

        console.log('Database cleared successfully!');
    } catch (error) {
        console.error('Error clearing database:', error);
        throw error;
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}
