
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
  // Private Sector Banks
  | "HDFC Bank"
  | "ICICI Bank"
  | "Axis Bank"
  | "Kotak Mahindra Bank"
  | "IndusInd Bank"
  | "Yes Bank"
  | "Federal Bank"
  | "IDFC First Bank"
  | "RBL Bank"
  | "Bandhan Bank"
  | "CSB Bank"
  | "DCB Bank"
  | "Dhanlaxmi Bank"
  | "Jammu & Kashmir Bank"
  | "Karnataka Bank"
  | "Karur Vysya Bank"
  | "Nainital Bank"
  | "South Indian Bank"
  | "Tamilnad Mercantile Bank"
  | "City Union Bank"
  // NBFCs
  | "Bajaj Finance"
  | "HDB Financial Services"
  | "Tata Capital"
  | "Mahindra & Mahindra Financial Services"
  | "L&T Finance"
  | "Muthoot Finance"
  | "Cholamandalam Investment and Finance Company"
  | "Shriram Transport Finance Company"
  | "Aditya Birla Finance"
  | "Fullerton India"
  | "Poonawalla Fincorp"
  // Other / Small Finance Banks
  | "AU Small Finance Bank"
  | "Equitas Small Finance Bank"
  | "Ujjivan Small Finance Bank"
  | "Jana Small Finance Bank"
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

    