export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            loan_cases: {
                Row: {
                    id: string
                    applicant_name: string
                    loan_amount: number
                    loan_type: string
                    case_type: string
                    contact_number: string
                    email: string
                    address: string
                    application_date: string
                    team_member: string
                    status: string
                    notes: string
                    salary: number
                    location: string
                    dob: string
                    pan_card_number: string
                    job_profile: string
                    job_designation: string
                    reference_name: string
                    bank_name: string
                    other_bank_name: string | null
                    bank_office_sm: string
                    tenure: number
                    obligation: number
                    approved_amount: number | null
                    roi: number | null
                    approved_tenure: number | null
                    processing_fee: number | null
                    insurance_amount: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    applicant_name: string
                    loan_amount: number
                    loan_type: string
                    case_type: string
                    contact_number: string
                    email: string
                    address: string
                    application_date: string
                    team_member: string
                    status: string
                    notes?: string
                    salary: number
                    location: string
                    dob: string
                    pan_card_number: string
                    job_profile: string
                    job_designation: string
                    reference_name: string
                    bank_name: string
                    other_bank_name?: string | null
                    bank_office_sm: string
                    tenure: number
                    obligation: number
                    approved_amount?: number | null
                    roi?: number | null
                    approved_tenure?: number | null
                    processing_fee?: number | null
                    insurance_amount?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    applicant_name?: string
                    loan_amount?: number
                    loan_type?: string
                    case_type?: string
                    contact_number?: string
                    email?: string
                    address?: string
                    application_date?: string
                    team_member?: string
                    status?: string
                    notes?: string
                    salary?: number
                    location?: string
                    dob?: string
                    pan_card_number?: string
                    job_profile?: string
                    job_designation?: string
                    reference_name?: string
                    bank_name?: string
                    other_bank_name?: string | null
                    bank_office_sm?: string
                    tenure?: number
                    obligation?: number
                    approved_amount?: number | null
                    roi?: number | null
                    approved_tenure?: number | null
                    processing_fee?: number | null
                    insurance_amount?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            case_history: {
                Row: {
                    id: string
                    case_id: string
                    timestamp: string
                    status: string
                    remarks: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    case_id: string
                    timestamp: string
                    status: string
                    remarks: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    case_id?: string
                    timestamp?: string
                    status?: string
                    remarks?: string
                    created_at?: string
                }
            }
            case_documents: {
                Row: {
                    id: string
                    case_id: string
                    document_type: string
                    uploaded: boolean
                    file_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    case_id: string
                    document_type: string
                    uploaded?: boolean
                    file_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    case_id?: string
                    document_type?: string
                    uploaded?: boolean
                    file_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
