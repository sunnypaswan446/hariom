
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
    try {
        const { supabase } = await import('./client');

        console.log('Testing loan_cases SELECT...');
        const { data: cases, error: casesError } = await supabase.from('loan_cases').select('*').limit(1);
        if (casesError) console.error('loan_cases error:', casesError);
        else console.log('loan_cases OK, rows:', cases?.length);

        console.log('Testing case_history SELECT...');
        const { data: hist, error: histError } = await supabase.from('case_history').select('*').limit(1);
        if (histError) console.error('case_history error:', histError);
        else console.log('case_history OK, rows:', hist?.length);

        console.log('Testing case_documents SELECT...');
        const { data: docs, error: docsError } = await supabase.from('case_documents').select('*').limit(1);
        if (docsError) console.error('case_documents error:', docsError);
        else console.log('case_documents OK, rows:', docs?.length);

    } catch (e: any) {
        console.error('Unexpected error:', e);
    }
}

test();
