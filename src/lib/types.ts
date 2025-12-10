
export type CaseStatus =
  | 'Document Pending'
  | 'Complete'
  | 'Login'
  | 'In Progress'
  | 'Hold'
  | 'RIC'
  | 'Reject'
  | 'Disbursed'
  | 'Approved';

export type LoanType = 'Personal' | 'Home' | 'Car' | 'Business' | 'Education';
export type CaseType = 'New' | 'BT' | 'Top-Up';
export type Officer = string;

export type JobProfile = 'Government' | 'Private' | 'Business';

export interface CaseUpdate {
  timestamp: string;
  status: CaseStatus;
  remarks: string;
}

export type DocumentType = 
  | 'TVR Form' 
  | 'Aadhaar Card' 
  | 'Pan Card' 
  | 'Salary Slip' 
  | 'Bank Statement' 
  | 'Loan Tracks';

export interface LoanCaseDocument {
  type: DocumentType;
  uploaded: boolean;
  file?: File | null | string;
}

export type BankName = string;


export interface LoanCase {
  id: string;
  applicantName: string;
  loanAmount: number;
  loanType: LoanType;
  caseType: CaseType;
  contactNumber: string;
  email: string;
  address: string;
  applicationDate: string;
  teamMember: Officer;
  status: CaseStatus;
  notes: string;
  history: CaseUpdate[];
  salary: number;
  location: string;
  dob: string;
  panCardNumber: string;
  jobProfile: JobProfile;
  jobDesignation: string;
  referenceName: string;
  bankName: BankName;
  otherBankName?: string;
  bankOfficeSm: string;
  documents: LoanCaseDocument[];
  tenure: number;
  obligation: number;
  approvedAmount?: number;
  roi?: number;
  approvedTenure?: number;
  processingFee?: number;
  insuranceAmount?: number;
}
