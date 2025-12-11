
import type { LoanType, CaseType, JobProfile, CaseStatus, DocumentType, BankName } from './types';

export const LOAN_TYPES = [
  'Personal',
  'Home',
  'Car',
  'Business',
  'Education',
] as const;
  
export const CASE_TYPES = [
  'New',
  'BT',
  'Top-Up',
] as const;

export const JOB_PROFILES = [
    'Government',
    'Private',
    'Business',
] as const;

export const STATUS_OPTIONS = [
  'Document Pending',
  'Complete',
  'Login',
  'In Progress',
  'Hold',
  'RIC',
  'Reject',
  'Disbursed',
  'Approved'
] as const;

export const DOCUMENT_TYPES = [
  'TVR Form',
  'Aadhaar Card',
  'Pan Card',
  'Salary Slip',
  'Bank Statement',
  'Loan Tracks',
] as const;

export const INITIAL_BANK_NAMES: BankName[] = [
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Bajaj Finance Ltd.",
  "Tata Capital Financial Services",
  "HDB Financial Services (HDFC Group)",
  "Aditya Birla Finance Ltd.",
  "Mahindra & Mahindra Financial Services",
  "L&T Finance Ltd.",
  "Piramal Capital & Housing Finance",
  "Shriram Finance Ltd.",
  "Cholamandalam Investment & Finance",
  "Muthoot Finance Ltd.",
  "Fullerton India",
  "IIFL Finance",
  "Hero FinCorp",
  "Other"
];

// Placeholder for Officers until Auth is fully ready, 
// though we will try to fetch dynamically.
export const DEFAULT_OFFICERS = [
  'John Doe',
  'Jane Smith',
  'Peter Jones',
  'Mary Williams',
];
