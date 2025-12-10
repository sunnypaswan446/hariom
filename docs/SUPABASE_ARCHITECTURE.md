# Supabase Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   Components     │      │   Pages/Routes   │            │
│  │  (React/TSX)     │◄────►│   (App Router)   │            │
│  └────────┬─────────┘      └──────────────────┘            │
│           │                                                  │
│           │ Import & Use                                     │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────┐          │
│  │        Supabase API Layer                     │          │
│  │     (src/lib/supabase/api.ts)                │          │
│  │                                               │          │
│  │  • getAllLoanCases()                         │          │
│  │  • getLoanCaseById(id)                       │          │
│  │  • createLoanCase(data)                      │          │
│  │  • updateLoanCase(id, updates)               │          │
│  │  • deleteLoanCase(id)                        │          │
│  │  • searchLoanCases(query)                    │          │
│  │  • addCaseHistory(id, update)                │          │
│  │  • updateDocument(id, type, status)          │          │
│  └────────────────┬─────────────────────────────┘          │
│                   │                                          │
│                   │ Uses                                     │
│                   ▼                                          │
│  ┌──────────────────────────────────────────────┐          │
│  │        Supabase Client                        │          │
│  │     (src/lib/supabase/client.ts)             │          │
│  │                                               │          │
│  │  • Configured with env variables             │          │
│  │  • TypeScript type support                   │          │
│  │  • Error handling                            │          │
│  └────────────────┬─────────────────────────────┘          │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │
                    │ HTTP/REST API
                    │ (Authenticated)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Cloud                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐          │
│  │           PostgreSQL Database                 │          │
│  │                                               │          │
│  │  ┌────────────────┐  ┌──────────────────┐   │          │
│  │  │  loan_cases    │  │  case_history    │   │          │
│  │  ├────────────────┤  ├──────────────────┤   │          │
│  │  │ id (PK)        │  │ id (PK)          │   │          │
│  │  │ applicant_name │  │ case_id (FK)     │   │          │
│  │  │ loan_amount    │  │ timestamp        │   │          │
│  │  │ loan_type      │  │ status           │   │          │
│  │  │ status         │  │ remarks          │   │          │
│  │  │ ...            │  └──────────────────┘   │          │
│  │  └────────────────┘                          │          │
│  │                                               │          │
│  │  ┌──────────────────┐                        │          │
│  │  │ case_documents   │                        │          │
│  │  ├──────────────────┤                        │          │
│  │  │ id (PK)          │                        │          │
│  │  │ case_id (FK)     │                        │          │
│  │  │ document_type    │                        │          │
│  │  │ uploaded         │                        │          │
│  │  │ file_url         │                        │          │
│  │  └──────────────────┘                        │          │
│  │                                               │          │
│  │  Features:                                    │          │
│  │  • Row Level Security (RLS)                  │          │
│  │  • Indexes for performance                   │          │
│  │  • Foreign key constraints                   │          │
│  │  • Auto-updating timestamps                  │          │
│  └──────────────────────────────────────────────┘          │
│                                                               │
│  ┌──────────────────────────────────────────────┐          │
│  │              Auth (Optional)                  │          │
│  │  • User authentication                        │          │
│  │  • JWT tokens                                │          │
│  │  • Role-based access                         │          │
│  └──────────────────────────────────────────────┘          │
│                                                               │
│  ┌──────────────────────────────────────────────┐          │
│  │            Storage (Optional)                 │          │
│  │  • File uploads                              │          │
│  │  • Document storage                          │          │
│  │  • CDN delivery                              │          │
│  └──────────────────────────────────────────────┘          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Reading Data (GET)
```
Component
   │
   ├─► getAllLoanCases()
   │      │
   │      ├─► Supabase Client
   │      │      │
   │      │      └─► SELECT * FROM loan_cases
   │      │      │
   │      │      └─► SELECT * FROM case_history WHERE case_id IN (...)
   │      │      │
   │      │      └─► SELECT * FROM case_documents WHERE case_id IN (...)
   │      │
   │      └─► Transform data (snake_case → camelCase)
   │
   └─► Returns: LoanCase[]
```

### Creating Data (POST)
```
Component
   │
   ├─► createLoanCase(newCase)
   │      │
   │      ├─► Transform data (camelCase → snake_case)
   │      │
   │      ├─► Supabase Client
   │      │      │
   │      │      ├─► INSERT INTO loan_cases VALUES (...)
   │      │      │
   │      │      ├─► INSERT INTO case_history VALUES (...)
   │      │      │
   │      │      └─► INSERT INTO case_documents VALUES (...)
   │      │
   │      └─► Transform response (snake_case → camelCase)
   │
   └─► Returns: LoanCase
```

### Updating Data (PATCH)
```
Component
   │
   ├─► updateLoanCase(id, updates)
   │      │
   │      ├─► Transform data (camelCase → snake_case)
   │      │
   │      ├─► Supabase Client
   │      │      │
   │      │      ├─► UPDATE loan_cases SET ... WHERE id = ?
   │      │      │
   │      │      ├─► DELETE FROM case_history WHERE case_id = ?
   │      │      │
   │      │      ├─► INSERT INTO case_history VALUES (...)
   │      │      │
   │      │      └─► (Similar for documents)
   │      │
   │      └─► Fetch updated case
   │
   └─► Returns: LoanCase
```

### Deleting Data (DELETE)
```
Component
   │
   ├─► deleteLoanCase(id)
   │      │
   │      └─► Supabase Client
   │             │
   │             └─► DELETE FROM loan_cases WHERE id = ?
   │                    │
   │                    └─► CASCADE DELETE:
   │                           • case_history entries
   │                           • case_documents entries
   │
   └─► Returns: void
```

## Environment Variables

```
.env.local
├─► NEXT_PUBLIC_SUPABASE_URL
│   └─► Used by: Supabase Client (browser & server)
│
├─► NEXT_PUBLIC_SUPABASE_ANON_KEY
│   └─► Used by: Supabase Client (browser & server)
│   └─► Purpose: Public API access with RLS
│
└─► SUPABASE_SERVICE_ROLE_KEY
    └─► Used by: Server-side operations (optional)
    └─► Purpose: Bypass RLS for admin operations
```

## Type Safety Flow

```
TypeScript Types
   │
   ├─► database.types.ts (Generated from DB schema)
   │      │
   │      └─► Database['public']['Tables']['loan_cases']['Row']
   │
   ├─► types.ts (Application types)
   │      │
   │      └─► LoanCase, CaseUpdate, LoanCaseDocument
   │
   └─► api.ts (Transformation layer)
          │
          ├─► transformDbRowToLoanCase()
          │      └─► Converts: DB types → App types
          │
          └─► transformLoanCaseToDbRow()
                 └─► Converts: App types → DB types
```

## Security Layers

```
1. Environment Variables
   └─► API keys stored securely, not in code

2. Row Level Security (RLS)
   └─► Database-level access control
   └─► Policies define who can access what

3. Type Safety
   └─► TypeScript prevents invalid data
   └─► Compile-time error checking

4. Validation
   └─► Supabase validates against schema
   └─► Foreign key constraints
   └─► Data type validation

5. Error Handling
   └─► Try-catch blocks in API functions
   └─► Console logging for debugging
   └─► User-friendly error messages
```

## Performance Optimizations

```
1. Indexes
   ├─► idx_loan_cases_status
   ├─► idx_loan_cases_team_member
   ├─► idx_loan_cases_application_date
   ├─► idx_case_history_case_id
   └─► idx_case_documents_case_id

2. Batch Fetching
   └─► Fetch related data in parallel
   └─► Use Promise.all() for concurrent queries

3. Efficient Queries
   └─► SELECT only needed columns
   └─► Use .in() for multiple IDs
   └─► Order and filter at database level

4. Caching (Future)
   └─► React Query / SWR
   └─► Supabase real-time subscriptions
```

## Migration Path

```
Current State:
   INITIAL_CASES (in-memory array)
      └─► 407 loan cases with history & documents

Migration:
   npm run seed-db
      └─► Reads INITIAL_CASES
      └─► Inserts into Supabase
      └─► Preserves all data & relationships

Future State:
   Supabase Database
      └─► Persistent storage
      └─► Multi-user access
      └─► Real-time updates
      └─► Scalable & secure
```
