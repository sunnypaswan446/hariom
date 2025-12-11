
// Types are now dynamic strings to support dashboard configuration
export type CaseStatus = string;
export type LoanType = string;
export type CaseType = string;
export type JobProfile = string;
export type DocumentType = string;

export type Officer = string;

export interface CaseUpdate {
  timestamp: string;
  status: CaseStatus;
  remarks: string;
}

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
