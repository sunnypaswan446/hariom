# Supabase Integration Guide

This guide will help you set up Supabase for your loan management system.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - Project Name: Choose a name (e.g., "loan-management")
   - Database Password: Create a strong password (save this!)
   - Region: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes ~2 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll need these values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
# In the project root directory
touch .env.local
```

2. Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace the placeholder values with your actual Supabase credentials.

## Step 4: Run Database Migrations

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

This will create all the necessary tables:
- `loan_cases` - Main loan case data
- `case_history` - Historical updates for each case
- `case_documents` - Document tracking for each case

## Step 5: Seed the Database (Optional)

To populate your database with the existing sample data:

1. Make sure your `.env.local` file is properly configured
2. Run the seed script:

```bash
npm run seed-db
```

Or you can create a custom script in `package.json`:

```json
{
  "scripts": {
    "seed-db": "tsx src/lib/supabase/seed.ts"
  }
}
```

Then install tsx if you haven't:

```bash
npm install -D tsx
```

And run:

```bash
npm run seed-db
```

## Step 6: Update Your Application Code

The Supabase integration is ready to use! Here's how to use it in your application:

### Fetching All Loan Cases

```typescript
import { getAllLoanCases } from '@/lib/supabase';

const cases = await getAllLoanCases();
```

### Fetching a Single Case

```typescript
import { getLoanCaseById } from '@/lib/supabase';

const loanCase = await getLoanCaseById('LC-001');
```

### Creating a New Case

```typescript
import { createLoanCase } from '@/lib/supabase';

const newCase = await createLoanCase({
  id: 'LC-999',
  applicantName: 'John Doe',
  // ... other fields
});
```

### Updating a Case

```typescript
import { updateLoanCase } from '@/lib/supabase';

const updated = await updateLoanCase('LC-001', {
  status: 'Approved',
  notes: 'Application approved'
});
```

### Deleting a Case

```typescript
import { deleteLoanCase } from '@/lib/supabase';

await deleteLoanCase('LC-001');
```

### Searching Cases

```typescript
import { searchLoanCases } from '@/lib/supabase';

const results = await searchLoanCases('john');
```

### Adding History Entry

```typescript
import { addCaseHistory } from '@/lib/supabase';

await addCaseHistory('LC-001', {
  timestamp: new Date().toISOString(),
  status: 'Approved',
  remarks: 'Application approved after review'
});
```

## Step 7: Update Your Store (Optional)

If you're using Zustand or another state management solution, you can integrate Supabase:

```typescript
import { create } from 'zustand';
import { getAllLoanCases, createLoanCase, updateLoanCase, deleteLoanCase } from '@/lib/supabase';
import type { LoanCase } from '@/lib/types';

interface LoanCaseStore {
  cases: LoanCase[];
  loading: boolean;
  error: string | null;
  
  fetchCases: () => Promise<void>;
  addCase: (loanCase: LoanCase) => Promise<void>;
  updateCase: (id: string, updates: Partial<LoanCase>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
}

export const useLoanCaseStore = create<LoanCaseStore>((set) => ({
  cases: [],
  loading: false,
  error: null,

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const cases = await getAllLoanCases();
      set({ cases, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addCase: async (loanCase) => {
    set({ loading: true, error: null });
    try {
      const newCase = await createLoanCase(loanCase);
      set((state) => ({ 
        cases: [newCase, ...state.cases], 
        loading: false 
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCase: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updated = await updateLoanCase(id, updates);
      set((state) => ({
        cases: state.cases.map((c) => (c.id === id ? updated : c)),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteCase: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteLoanCase(id);
      set((state) => ({
        cases: state.cases.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));
```

## Security Considerations

### Row Level Security (RLS)

The migration script enables RLS on all tables. The current policies allow all operations for authenticated users. You should customize these based on your needs:

```sql
-- Example: Only allow users to see their own cases
CREATE POLICY "Users can view their own cases" ON loan_cases
  FOR SELECT USING (auth.uid() = user_id);

-- Example: Only allow admins to delete cases
CREATE POLICY "Only admins can delete cases" ON loan_cases
  FOR DELETE USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Environment Variables

- Never commit `.env.local` to version control
- The `NEXT_PUBLIC_*` variables are exposed to the browser
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and only use it server-side

## Storage (Optional)

If you want to store actual document files (PDFs, images, etc.):

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `loan-documents`
3. Set up storage policies
4. Use the Supabase Storage API to upload files:

```typescript
import { supabase } from '@/lib/supabase';

async function uploadDocument(file: File, caseId: string, documentType: string) {
  const filePath = `${caseId}/${documentType}-${Date.now()}.pdf`;
  
  const { data, error } = await supabase.storage
    .from('loan-documents')
    .upload(filePath, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('loan-documents')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

## Troubleshooting

### Connection Issues

- Verify your environment variables are correct
- Check that your Supabase project is active
- Ensure you're using the correct API keys

### Migration Errors

- Make sure you're running the SQL in the correct order
- Check for any existing tables that might conflict
- Review the Supabase logs in the dashboard

### Data Not Appearing

- Check the browser console for errors
- Verify RLS policies aren't blocking access
- Use the Supabase Table Editor to manually inspect data

## Next Steps

1. Set up authentication (Supabase Auth)
2. Implement real-time subscriptions for live updates
3. Add file storage for documents
4. Create database backups
5. Set up monitoring and alerts

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
