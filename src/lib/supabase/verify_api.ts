
import { config } from 'dotenv';
import path from 'path';

// Fix env loading
config({ path: path.resolve(process.cwd(), '.env.local') });

// Helper to handle dynamic import
async function run() {
    try {
        const { getLoanCaseById, getAllLoanCases } = await import('./api');
        
        console.log('Fetching all cases to find a valid ID...');
        const allCases = await getAllLoanCases();
        
        if (allCases.length === 0) {
            console.log('No cases found in DB to test with.');
            return;
        }

        const targetId = allCases[0].id;
        console.log(`Testing getLoanCaseById with ID: ${targetId}`);
        
        const singleCase = await getLoanCaseById(targetId);
        
        if (singleCase) {
             console.log('Successfully fetched single case:');
             console.log(`ID: ${singleCase.id}`);
             console.log(`Name: ${singleCase.applicantName}`);
             console.log(`History Count: ${singleCase.history.length}`);
             console.log(`Docs Count: ${singleCase.documents.length}`);
        } else {
            console.error('Failed to fetch case (returned null)');
        }

    } catch (e: any) {
        console.error('Test failed with error:', e);
        if (e.message) console.error('Message:', e.message);
        if (e.details) console.error('Details:', e.details);
        if (e.hint) console.error('Hint:', e.hint);
    }
}

run();
