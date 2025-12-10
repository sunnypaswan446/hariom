# Supabase Quick Reference

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Import

```typescript
import { 
  getAllLoanCases,
  getLoanCaseById,
  createLoanCase,
  updateLoanCase,
  deleteLoanCase,
  addCaseHistory,
  updateDocument,
  searchLoanCases,
  supabase 
} from '@/lib/supabase';
```

## API Functions

### Get All Cases
```typescript
const cases = await getAllLoanCases();
```

### Get Single Case
```typescript
const loanCase = await getLoanCaseById('LC-001');
```

### Create Case
```typescript
const newCase = await createLoanCase({
  id: 'LC-999',
  applicantName: 'John Doe',
  loanAmount: 50000,
  loanType: 'Personal',
  // ... other required fields
});
```

### Update Case
```typescript
const updated = await updateLoanCase('LC-001', {
  status: 'Approved',
  approvedAmount: 50000
});
```

### Delete Case
```typescript
await deleteLoanCase('LC-001');
```

### Search Cases
```typescript
const results = await searchLoanCases('john doe');
```

### Add History Entry
```typescript
await addCaseHistory('LC-001', {
  timestamp: new Date().toISOString(),
  status: 'Approved',
  remarks: 'Approved after verification'
});
```

### Update Document
```typescript
await updateDocument('LC-001', 'Aadhaar Card', true, 'https://...');
```

## Direct Supabase Client Usage

### Query
```typescript
const { data, error } = await supabase
  .from('loan_cases')
  .select('*')
  .eq('status', 'Approved');
```

### Insert
```typescript
const { data, error } = await supabase
  .from('loan_cases')
  .insert({ /* data */ });
```

### Update
```typescript
const { data, error } = await supabase
  .from('loan_cases')
  .update({ status: 'Approved' })
  .eq('id', 'LC-001');
```

### Delete
```typescript
const { data, error } = await supabase
  .from('loan_cases')
  .delete()
  .eq('id', 'LC-001');
```

## Real-time Subscriptions

```typescript
const channel = supabase
  .channel('loan_cases_changes')
  .on(
    'postgres_changes',
    { 
      event: '*', 
      schema: 'public', 
      table: 'loan_cases' 
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

## Database Tables

- **loan_cases** - Main loan case data
- **case_history** - Historical updates
- **case_documents** - Document tracking

## Common Queries

### Filter by Status
```typescript
const { data } = await supabase
  .from('loan_cases')
  .select('*')
  .eq('status', 'Approved');
```

### Filter by Team Member
```typescript
const { data } = await supabase
  .from('loan_cases')
  .select('*')
  .eq('team_member', 'John Doe');
```

### Filter by Date Range
```typescript
const { data } = await supabase
  .from('loan_cases')
  .select('*')
  .gte('application_date', '2024-01-01')
  .lte('application_date', '2024-12-31');
```

### Count Cases
```typescript
const { count } = await supabase
  .from('loan_cases')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'Approved');
```

## Error Handling

```typescript
try {
  const cases = await getAllLoanCases();
} catch (error) {
  console.error('Error fetching cases:', error);
  // Handle error
}
```

## TypeScript Types

All functions return properly typed data based on your `LoanCase` interface.

```typescript
import type { LoanCase, CaseUpdate, LoanCaseDocument } from '@/lib/types';
import type { Database } from '@/lib/supabase/database.types';
```
