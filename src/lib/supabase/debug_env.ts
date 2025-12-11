
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
}

const vars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('Environment Variable Check:');
vars.forEach(v => {
    const val = process.env[v];
    console.log(`${v}: ${val ? 'PRESENT ' + (val.length > 10 ? '(Valid-ish length)' : '(Too short?)') : 'MISSING'}`);
});
