
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
export type Officer = 'John Doe' | 'Jane Smith' | 'Peter Jones' | 'Mary Williams';

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
  file?: File | null;
}

export type BankName = 
  | "HDFC Bank"
  | "ICICI Bank"
  | "Axis Bank"
  | "Kotak Mahindra Bank"
  | "IndusInd Bank"
  | "Yes Bank"
  | "Bajaj Finance Ltd."
  | "Tata Capital Financial Services"
  | "HDB Financial Services (HDFC Group)"
  | "Aditya Birla Finance Ltd."
  | "Mahindra & Mahindra Financial Services"
  | "L&T Finance Ltd."
  | "Piramal Capital & Housing Finance"
  | "Shriram Finance Ltd."
  | "Cholamandalam Investment & Finance"
  | "Muthoot Finance Ltd."
  | "Other";


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

    
