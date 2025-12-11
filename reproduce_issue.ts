
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Attempting to insert test case...');
    
    const testPayload = {
        applicant_name: "Debug User " + Date.now(),
        loan_amount: 10000,
        loan_type: "Personal",
        case_type: "New",
        contact_number: "9999999999",
        email: "debug@example.com",
        address: "Debug Address",
        application_date: new Date().toISOString(),
        team_member: "John Doe",
        status: "Document Pending",
        salary: 50000,
        location: "Debug City",
        dob: "1990-01-01",
        pan_card_number: "ABCDE1234F",
        job_profile: "Private",
        job_designation: "Debugger",
        reference_name: "Ref Name",
        bank_name: "HDFC Bank",
        bank_office_sm: "Branch Office",
        tenure: 12,
        obligation: 0,
        id: "test-id-" + Date.now().toString(),
        // 'other_bank_name' is missing, checking if that triggers error
    };

    const { data, error } = await supabase
        .from('loan_cases')
        .insert(testPayload)
        .select();

    if (error) {
        console.error('Insert FAILED. Writing details to debug_error.json');
        fs.writeFileSync('debug_error.json', JSON.stringify(error, null, 2));
    } else {
        console.log('Insert SUCCESS:', data);
    }
}

testInsert();
