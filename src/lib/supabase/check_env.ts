
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') });

// import { supabase } from './client'; // Moved to dynamic import

async function testConnection() {
    console.log('Testing connection...');
    try {
    const { supabase } = await import('./client');
        const { count, error } = await supabase.from('loan_cases').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Connection/Select Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('Connection successful. Row count:', count);
        }

        // Test Insert
        console.log('Testing Insert...');
        const testId = 'TEST-' + Date.now();
        const { error: insertError } = await supabase.from('loan_cases').insert({
            id: testId,
            applicant_name: 'Test User',
            loan_amount: 1000,
            loan_type: 'Personal',
            case_type: 'New',
            contact_number: '0000000000',
            email: 'test@example.com',
            address: 'Test Address',
            application_date: new Date().toISOString().split('T')[0],
            team_member: 'Test Officer',
            status: 'Approved',
            salary: 1000,
            location: 'Test Loc',
            dob: '1990-01-01',
            pan_card_number: 'ABCDE1234F',
            job_profile: 'Private',
            job_designation: 'Tester',
            reference_name: 'Ref',
            bank_name: 'Test Bank',
            bank_office_sm: 'SM-1',
            tenure: 12,
            obligation: 0
        } as any);

        if (insertError) {
             console.error('Insert Error:', JSON.stringify(insertError, null, 2));
        } else {
             console.log('Insert successful!');
             // Cleanup
             await supabase.from('loan_cases').delete().eq('id', testId);
             console.log('Cleanup successful');
        }

    } catch (e) {
        console.error('Unexpected error:', e);
    }
}

testConnection();
