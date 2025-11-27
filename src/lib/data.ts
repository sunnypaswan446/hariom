
import type { LoanCase, Officer, LoanType, JobProfile, CaseStatus, DocumentType, BankName, CaseType } from './types';

export const OFFICERS: Officer[] = [
  'John Doe',
  'Jane Smith',
  'Peter Jones',
  'Mary Williams',
];

export const LOAN_TYPES: LoanType[] = [
  'Personal',
  'Home',
  'Car',
  'Business',
  'Education',
];

export const CASE_TYPES: CaseType[] = [
  'New',
  'BT',
  'Top-Up',
];

export const JOB_PROFILES: JobProfile[] = [
    'Government',
    'Private',
    'Business',
]

export const STATUS_OPTIONS: CaseStatus[] = [
  'Document Pending',
  'Complete',
  'Login',
  'In Progress',
  'Hold',
  'RIC',
  'Reject',
  'Disbursed',
  'Approved'
];

export const DOCUMENT_TYPES: DocumentType[] = [
  'TVR Form',
  'Aadhaar Card',
  'Pan Card',
  'Salary Slip',
  'Bank Statement',
  'Loan Tracks',
];

export const BANK_NAMES: BankName[] = [
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


export const INITIAL_CASES: LoanCase[] = [
  {
    id: 'LC-001',
    applicantName: 'Alice Johnson',
    loanAmount: 5000,
    loanType: 'Personal',
    caseType: 'New',
    contactNumber: '123-456-7890',
    email: 'alice.j@example.com',
    address: '123 Main St, Anytown, USA',
    applicationDate: '2023-10-01',
    teamMember: 'John Doe',
    status: 'Approved',
    notes: 'Applicant has a stable income and good credit history.',
    history: [
      { timestamp: '2023-10-02T10:00:00Z', status: 'In Progress', remarks: 'Initial review started.' },
      { timestamp: '2023-10-03T14:30:00Z', status: 'Approved', remarks: 'All criteria met.' },
    ],
    salary: 60000,
    location: 'Anytown, USA',
    dob: '1990-05-15',
    panCardNumber: 'ABCDE1234F',
    jobProfile: 'Private',
    jobDesignation: 'Software Engineer',
    referenceName: 'Bob Johnson',
    bankName: 'HDFC Bank',
    bankOfficeSm: 'SM-1',
    documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: true })),
    tenure: 24,
    obligation: 500,
    approvedAmount: 5000,
    roi: 8.5,
    approvedTenure: 24,
    processingFee: 100,
    insuranceAmount: 50,
  },
  {
    id: 'LC-002',
    applicantName: 'Bob Williams',
    loanAmount: 250000,
    loanType: 'Home',
    caseType: 'New',
    contactNumber: '234-567-8901',
    email: 'bob.w@example.com',
    address: '456 Oak Ave, Anytown, USA',
    applicationDate: '2023-10-05',
    teamMember: 'Jane Smith',
    status: 'In Progress',
    notes: 'Awaiting property appraisal documents.',
    history: [
      { timestamp: '2023-10-06T09:00:00Z', status: 'In Progress', remarks: 'Application received and assigned.' },
    ],
    salary: 90000,
    location: 'Anytown, USA',
    dob: '1985-08-20',
    panCardNumber: 'FGHIJ5678K',
    jobProfile: 'Government',
    jobDesignation: 'Project Manager',
    referenceName: 'Carol Williams',
    bankName: 'HDFC Bank',
    bankOfficeSm: 'SM-2',
    documents: DOCUMENT_TYPES.map((type, i) => ({ type, uploaded: i < 2 })),
    tenure: 240,
    obligation: 1500,
  },
  {
    id: 'LC-003',
    applicantName: 'Charlie Brown',
    loanAmount: 15000,
    loanType: 'Car',
    caseType: 'New',
    contactNumber: '345-678-9012',
    email: 'charlie.b@example.com',
    address: '789 Pine Ln, Anytown, USA',
    applicationDate: '2023-10-10',
    teamMember: 'John Doe',
    status: 'Document Pending',
    notes: '',
    history: [],
    salary: 45000,
    location: 'Anytown, USA',
    dob: '1995-11-30',
    panCardNumber: 'KLMNO9012L',
    jobProfile: 'Business',
    jobDesignation: 'Small Business Owner',
    referenceName: 'Sally Brown',
    bankName: 'ICICI Bank',
    bankOfficeSm: 'SM-1',
    documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: false })),
    tenure: 48,
    obligation: 200,
  },
  {
    id: 'LC-004',
    applicantName: 'Diana Prince',
    loanAmount: 100000,
    loanType: 'Business',
    caseType: 'BT',
    contactNumber: '456-789-0123',
    email: 'diana.p@example.com',
    address: '101 Maple Dr, Anytown, USA',
    applicationDate: '2023-10-12',
    teamMember: 'Peter Jones',
    status: 'Reject',
    notes: 'Business plan lacks sufficient detail on revenue projections.',
    history: [
      { timestamp: '2023-10-13T11:00:00Z', status: 'In Progress', remarks: 'Reviewing business plan.' },
      { timestamp: '2023-10-15T16:00:00Z', status: 'Reject', remarks: 'Insufficient financial projections.' },
    ],
    salary: 120000,
    location: 'Metropolis',
    dob: '1980-03-22',
    panCardNumber: 'PQRST3456M',
    jobProfile: 'Business',
    jobDesignation: 'CEO',
    referenceName: 'Steve Trevor',
    bankName: 'Axis Bank',
    bankOfficeSm: 'SM-3',
    documents: DOCUMENT_TYPES.map((type, i) => ({ type, uploaded: i < 4 })),
    tenure: 60,
    obligation: 3000,
  },
  {
    id: 'LC-005',
    applicantName: 'Ethan Hunt',
    loanAmount: 7500,
    loanType: 'Personal',
    caseType: 'New',
    contactNumber: '567-890-1234',
    email: 'ethan.h@example.com',
    address: '211 Birch Rd, Anytown, USA',
    applicationDate: '2023-11-01',
    teamMember: 'Mary Williams',
    status: 'Disbursed',
    notes: 'Urgent medical expense.',
    history: [
       { timestamp: '2023-11-02T10:00:00Z', status: 'In Progress', remarks: 'Fast-tracked due to urgency.' },
       { timestamp: '2023-11-02T18:00:00Z', status: 'Approved', remarks: 'Approved.' },
       { timestamp: '2023-11-03T12:00:00Z', status: 'Disbursed', remarks: 'Funds transferred.' },
    ],
    salary: 150000,
    location: 'New York, USA',
    dob: '1982-07-10',
    panCardNumber: 'UVWXY7890N',
    jobProfile: 'Government',
    jobDesignation: 'Field Agent',
    referenceName: 'Luther Stickell',
    bankName: 'Bajaj Finance Ltd.',
    bankOfficeSm: 'SM-4',
    documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: true })),
    tenure: 12,
    obligation: 0,
    approvedAmount: 7500,
    roi: 7.9,
    approvedTenure: 12,
    processingFee: 50,
    insuranceAmount: 25,
  },
    {
    id: 'LC-006',
    applicantName: 'Fiona Glenanne',
    loanAmount: 20000,
    loanType: 'Education',
    caseType: 'New',
    contactNumber: '678-901-2345',
    email: 'fiona.g@example.com',
    address: '321 Cedar Ct, Anytown, USA',
    applicationDate: '2024-01-15',
    teamMember: 'Jane Smith',
    status: 'Approved',
    notes: 'Enrolled in a certified university program.',
    history: [
      { timestamp: '2024-01-16T10:00:00Z', status: 'In Progress', remarks: 'Verifying university enrollment.' },
      { timestamp: '2024-01-18T15:00:00Z', status: 'Approved', remarks: 'Enrollment confirmed.' },
    ],
    salary: 0,
    location: 'Miami, USA',
    dob: '1998-09-05',
    panCardNumber: 'BCDEA1234P',
    jobProfile: 'Private',
    jobDesignation: 'Student',
    referenceName: 'Michael Westen',
    bankName: 'Other',
    otherBankName: 'A Small Regional Bank',
    bankOfficeSm: 'SM-2',
    documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: true })),
    tenure: 60,
    obligation: 0,
    approvedAmount: 20000,
    roi: 4.5,
    approvedTenure: 60,
    processingFee: 0,
    insuranceAmount: 100,
  },
  {
    id: 'LC-007',
    applicantName: 'George Costanza',
    loanAmount: 2000,
    loanType: 'Personal',
    caseType: 'New',
    contactNumber: '789-012-3456',
    email: 'george.c@example.com',
    address: '432 Spruce St, Anytown, USA',
    applicationDate: '2024-02-20',
    teamMember: 'Peter Jones',
    status: 'Document Pending',
    notes: 'Follow up for employment verification.',
    history: [],
    salary: 55000,
    location: 'New York, USA',
    dob: '1965-02-12',
    panCardNumber: 'CDEAB2345Q',
    jobProfile: 'Private',
    jobDesignation: 'Architect',
    referenceName: 'Jerry Seinfeld',
    bankName: 'Other',
    bankOfficeSm: 'SM-3',
    documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: false })),
    tenure: 12,
    obligation: 100,
  },
  ...Array.from({ length: 300 }, (_, i) => {
    const caseNum = i + 8;
    const loanType = LOAN_TYPES[Math.floor(Math.random() * LOAN_TYPES.length)];
    const status = STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)];
    const teamMember = OFFICERS[Math.floor(Math.random() * OFFICERS.length)];
    const jobProfile = JOB_PROFILES[Math.floor(Math.random() * JOB_PROFILES.length)];
    const bankName = BANK_NAMES[Math.floor(Math.random() * (BANK_NAMES.length-1))];
    const caseType = CASE_TYPES[Math.floor(Math.random() * CASE_TYPES.length)];
    const applicationDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const dob = new Date(new Date().setFullYear(new Date().getFullYear() - 22 - Math.floor(Math.random() * 30)), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const loanAmount = Math.floor(Math.random() * 495001) + 5000;
    const tenure = (Math.floor(Math.random() * 7) + 1) * 12;
    
    let approvedAmount, roi, approvedTenure, processingFee, insuranceAmount;
    if (status === 'Approved' || status === 'Disbursed') {
      approvedAmount = loanAmount - Math.floor(Math.random() * (loanAmount * 0.1));
      roi = Math.round((Math.random() * 10 + 5) * 10) / 10;
      approvedTenure = tenure;
      processingFee = Math.floor(Math.random() * 5000);
      insuranceAmount = Math.floor(Math.random() * 1000);
    }

    const firstHistoryTimestamp = applicationDate.getTime() + (24 * 60 * 60 * 1000);
    const history = [{
        timestamp: new Date(firstHistoryTimestamp).toISOString(),
        status: 'In Progress' as CaseStatus,
        remarks: 'Initial review started.'
    }];

    if (status !== 'Document Pending' && status !== 'In Progress') {
        const secondHistoryTimestamp = firstHistoryTimestamp + (2 * 24 * 60 * 60 * 1000);
        history.push({
            timestamp: new Date(secondHistoryTimestamp).toISOString(),
            status: status,
            remarks: `Case moved to ${status}.`
        })
    }

    return {
      id: `LC-${String(caseNum).padStart(3, '0')}`,
      applicantName: `User ${caseNum}`,
      loanAmount,
      loanType,
      caseType,
      contactNumber: `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `user.${caseNum}@example.com`,
      address: `${caseNum} Random St, Fake City`,
      applicationDate: applicationDate.toISOString().split('T')[0],
      teamMember,
      status,
      notes: 'This is a dummy case.',
      history,
      salary: Math.floor(Math.random() * 200000) + 30000,
      location: 'Random City',
      dob: dob.toISOString().split('T')[0],
      panCardNumber: `DUMMY${String(caseNum).padStart(4, '0')}Z`,
      jobProfile,
      jobDesignation: 'Dummy Role',
      referenceName: `Reference ${caseNum}`,
      bankName,
      bankOfficeSm: `SM-${Math.floor(Math.random() * 5) + 1}`,
      documents: DOCUMENT_TYPES.map(type => ({ type, uploaded: Math.random() > 0.3 })),
      tenure,
      obligation: Math.floor(Math.random() * 5000),
      approvedAmount,
      roi,
      approvedTenure,
      processingFee,
      insuranceAmount,
    };
  })
];

    
