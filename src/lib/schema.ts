
import { z } from 'zod';
import { LOAN_TYPES, OFFICERS, STATUS_OPTIONS, DOCUMENT_TYPES, CASE_TYPES, BANK_NAMES } from './data';

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]\d{3}[)])?[\s-]?(\d{3})[\s-]?(\d{4})$/
);

const panRegex = new RegExp(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);

export const loanCaseSchema = z.object({
  applicantName: z.string().min(2, {
    message: 'Applicant name must be at least 2 characters.',
  }),
  loanAmount: z.coerce.number().positive({
    message: 'Loan amount must be a positive number.',
  }),
  loanType: z.enum(LOAN_TYPES, {
    errorMap: () => ({ message: 'Please select a valid loan type.' }),
  }),
  caseType: z.enum(CASE_TYPES, {
    errorMap: () => ({ message: 'Please select a valid case type.' }),
  }),
  tenure: z.coerce.number().positive({
    message: 'Tenure must be a positive number (in months).',
  }),
  obligation: z.coerce.number().min(0, {
    message: 'Obligation must be a positive number.',
  }),
  contactNumber: z.string().regex(phoneRegex, 'Invalid phone number format.'),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  applicationDate: z.date({
    required_error: 'An application date is required.',
  }),
  teamMember: z.enum(OFFICERS, {
    errorMap: () => ({ message: 'Please select a valid team member.' }),
  }),
  status: z.enum(STATUS_OPTIONS, {
    errorMap: () => ({ message: 'Please select a valid status.' }),
  }),
  notes: z.string().optional(),
  salary: z.coerce.number().positive({
    message: 'Salary must be a positive number.',
  }),
  location: z.string().min(2, { message: 'Location is required.' }),
  dob: z.date({
    required_error: 'Date of birth is required.',
  }),
  panCardNumber: z.string().regex(panRegex, 'Invalid PAN card number format.'),
  jobProfile: z.enum(['Government', 'Private', 'Business'], {
    errorMap: () => ({ message: 'Please select a valid job profile.' }),
  }),
  jobDesignation: z.string().min(2, { message: 'Job designation is required.' }),
  referenceName: z.string().min(2, { message: 'Reference name is required.' }),
  bankName: z.enum(BANK_NAMES, {
    errorMap: () => ({ message: 'Please select a valid bank.' }),
  }),
  otherBankName: z.string().optional(),
  bankOfficeSm: z.string().min(2, { message: 'Bank Office/SM is required.' }),
  documents: z.array(z.object({
    type: z.enum(DOCUMENT_TYPES),
    uploaded: z.boolean(),
    file: z.any().optional(),
  })).optional(),
  approvedAmount: z.coerce.number().optional(),
  roi: z.coerce.number().optional(),
  approvedTenure: z.coerce.number().optional(),
  processingFee: z.coerce.number().optional(),
  insuranceAmount: z.coerce.number().optional(),
}).refine(data => {
    if (data.bankName === 'Other') {
        return !!data.otherBankName && data.otherBankName.length > 2;
    }
    return true;
}, {
    message: 'Please specify the bank name when "Other" is selected.',
    path: ['otherBankName'],
});

export const statusUpdateSchema = z.object({
  status: z.enum(STATUS_OPTIONS),
  remarks: z.string().min(1, { message: 'Remarks are required for a status update.' }),
  approvedAmount: z.coerce.number().optional(),
  roi: z.coerce.number().optional(),
  approvedTenure: z.coerce.number().optional(),
  processingFee: z.coerce.number().optional(),
  insuranceAmount: z.coerce.number().optional(),
});
