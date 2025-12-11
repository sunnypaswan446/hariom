
'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { LoanCase, CaseStatus, CaseUpdate, Officer, BankName, DocumentType, LoanCaseDocument } from './types';
import { 
  DEFAULT_OFFICERS, 
  INITIAL_BANK_NAMES, 
  LOAN_TYPES, 
  CASE_TYPES, 
  JOB_PROFILES, 
  STATUS_OPTIONS, 
  DOCUMENT_TYPES 
} from './constants';
import type { AppConfigItem } from './supabase/api';
import type { Database } from './supabase/database.types';

type AppConfig = {
  activeLoanTypes: string[];
  activeCaseTypes: string[];
  activeJobProfiles: string[];
  activeStatusOptions: string[];
  activeDocumentTypes: string[];
  activeBankNames: string[];
  activeOfficers: string[];
};

type State = {
  cases: LoanCase[];
  officers: Officer[];
  banks: BankName[];
  config: AppConfig;
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  fetchCases: () => Promise<void>;
  // ... other actions
  fetchAppConfig: () => Promise<void>;
  
  // Dynamic Config Actions
  addConfigItem: (category: string, value: string) => Promise<void>;
  deleteConfigItem: (id: string, category: string, value: string) => Promise<void>;
  initConfig: () => Promise<void>;
  
  getCaseById: (id: string) => LoanCase | undefined;
  addCase: (newCase: Omit<LoanCase, 'id' | 'history'>) => Promise<void>;
  updateCaseStatus: (
    id: string,
    status: CaseStatus,
    remarks: string,
    details?: Partial<Pick<LoanCase, 'approvedAmount' | 'roi' | 'approvedTenure' | 'processingFee' | 'insuranceAmount'>>
  ) => Promise<void>;
  updateCase: (updatedCase: LoanCase) => void;
  // ... legacy local actions kept for compatibility or unused
  addOfficer: (name: Officer) => void; 
  updateOfficer: (oldName: Officer, newName: Officer) => void;
  removeOfficer: (name: Officer) => void;
  addBank: (name: BankName) => void;
  updateBank: (oldName: BankName, newName: BankName) => void;
  removeBank: (name: BankName) => void;
  updateCaseDocument: (caseId: string, docType: DocumentType, file: File) => Promise<void>;
};

export const useLoanStore = create<State & Actions>()(
  immer((set, get) => ({
    cases: [],
    officers: DEFAULT_OFFICERS,
    banks: INITIAL_BANK_NAMES,
    config: {
        activeLoanTypes: [...LOAN_TYPES],
        activeCaseTypes: [...CASE_TYPES],
        activeJobProfiles: [...JOB_PROFILES],
        activeStatusOptions: [...STATUS_OPTIONS],
        activeDocumentTypes: [...DOCUMENT_TYPES],
        activeBankNames: [...INITIAL_BANK_NAMES],
        activeOfficers: [...DEFAULT_OFFICERS],
    },
    isLoading: false,
    error: null,

    fetchCases: async () => {
        set({ isLoading: true, error: null });
        try {
            const { getAllLoanCases, fetchAppConfig } = await import('./supabase/api');
            const data = await getAllLoanCases();
            
            // Fetch Config
            const configItems = await fetchAppConfig();

            // Helper: doc type list with DB override support
            const applyConfigOverrides = (state: State, items: AppConfigItem[] | null) => {
                if (items && items.length > 0) {
                    const getValues = (cat: string) => items.filter(i => i.category === cat).map(i => i.value);

                    const dbLoanTypes = getValues('LOAN_TYPE');
                    if (dbLoanTypes.length) state.config.activeLoanTypes = dbLoanTypes;

                    const dbCaseTypes = getValues('CASE_TYPE');
                    if (dbCaseTypes.length) state.config.activeCaseTypes = dbCaseTypes;

                    const dbJobProfiles = getValues('JOB_PROFILE');
                    if (dbJobProfiles.length) state.config.activeJobProfiles = dbJobProfiles;

                    const dbStatus = getValues('CASE_STATUS');
                    if (dbStatus.length) state.config.activeStatusOptions = dbStatus;

                    const dbDocs = getValues('DOCUMENT_TYPE');
                    if (dbDocs.length) state.config.activeDocumentTypes = dbDocs;

                    const dbBanks = getValues('BANK_NAME');
                    if (dbBanks.length) state.config.activeBankNames = dbBanks;

                    const dbMembers = getValues('TEAM_MEMBER');
                    if (dbMembers.length) {
                        state.config.activeOfficers = dbMembers;
                        state.officers = dbMembers;
                    }
                }
            };

            set(state => {
                // Apply configuration overrides before computing document placeholders
                applyConfigOverrides(state, configItems);

                const docTypes = state.config.activeDocumentTypes.length
                  ? state.config.activeDocumentTypes
                  : Array.from(DOCUMENT_TYPES);

                const mergeDocs = (docs: LoanCaseDocument[] = []) => {
                  const docMap = new Map<string, LoanCaseDocument>();
                  docs.forEach(doc => docMap.set(doc.type, doc));
                  return docTypes.map(type => docMap.get(type) ?? { type, uploaded: false, file: null });
                };

                state.cases = data.map(c => ({ ...c, documents: mergeDocs(c.documents || []) }));
                state.isLoading = false;
            });
        } catch (e: any) {
            set({ isLoading: false, error: e.message });
            console.error('Failed to fetch cases:', e);
        }
    },
    
    fetchAppConfig: async () => {
        // standalone fetch if needed
    },
    
    addConfigItem: async (category, value) => {
        try {
            const { addAppConfigItem } = await import('./supabase/api');
            const newItem = await addAppConfigItem(category, value);
            if (newItem) {
                set(state => {
                    if (category === 'LOAN_TYPE') state.config.activeLoanTypes.push(value);
                    if (category === 'CASE_TYPE') state.config.activeCaseTypes.push(value);
                    if (category === 'JOB_PROFILE') state.config.activeJobProfiles.push(value);
                    if (category === 'CASE_STATUS') state.config.activeStatusOptions.push(value);
                    if (category === 'DOCUMENT_TYPE') state.config.activeDocumentTypes.push(value);
                    if (category === 'BANK_NAME') state.config.activeBankNames.push(value);
                    if (category === 'TEAM_MEMBER') {
                        state.config.activeOfficers.push(value);
                        state.officers.push(value);
                    }
                });
            }
        } catch (e) {
            console.error(e);
            throw e;
        }
    },

    deleteConfigItem: async (id, category, value) => {
         try {
             const { deleteAppConfigItem } = await import('./supabase/api');
             await deleteAppConfigItem(id); 
             
             set(state => {
                 if (category === 'LOAN_TYPE') state.config.activeLoanTypes = state.config.activeLoanTypes.filter(v => v !== value);
                 if (category === 'CASE_TYPE') state.config.activeCaseTypes = state.config.activeCaseTypes.filter(v => v !== value);
                 if (category === 'CASE_STATUS') state.config.activeStatusOptions = state.config.activeStatusOptions.filter(v => v !== value);
                 if (category === 'DOCUMENT_TYPE') state.config.activeDocumentTypes = state.config.activeDocumentTypes.filter(v => v !== value);
                 if (category === 'BANK_NAME') state.config.activeBankNames = state.config.activeBankNames.filter(v => v !== value);
                 if (category === 'JOB_PROFILE') state.config.activeJobProfiles = state.config.activeJobProfiles.filter(v => v !== value);
                 if (category === 'TEAM_MEMBER') {
                     state.config.activeOfficers = state.config.activeOfficers.filter(v => v !== value);
                     state.officers = state.officers.filter(v => v !== value);
                 }
             });
         } catch (e) {
             console.error(e);
             throw e;
         }
    },

    initConfig: async () => {
        try {
             const { initAppConfig } = await import('./supabase/api');
             const defaults = [
                 ...LOAN_TYPES.map((v, i) => ({ category: 'LOAN_TYPE', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...CASE_TYPES.map((v, i) => ({ category: 'CASE_TYPE', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...JOB_PROFILES.map((v, i) => ({ category: 'JOB_PROFILE', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...STATUS_OPTIONS.map((v, i) => ({ category: 'CASE_STATUS', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...DOCUMENT_TYPES.map((v, i) => ({ category: 'DOCUMENT_TYPE', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...INITIAL_BANK_NAMES.map((v, i) => ({ category: 'BANK_NAME', value: v, is_active: true, display_order: (i+1)*10 })),
                 ...DEFAULT_OFFICERS.map((v, i) => ({ category: 'TEAM_MEMBER', value: v, is_active: true, display_order: (i+1)*10 })),
             ];
             
             await initAppConfig(defaults);
             
             // After init, fetch fresh to populate store
             await get().fetchCases(); 
        } catch (e) {
             console.error(e);
             throw e;
        }
    },

    fetchMembers: async () => {},

    getCaseById: (id) => {
      return get().cases.find((c) => c.id === id);
    },

    // ... rest of actions (addCase, updateCaseStatus etc) remain the same
    // Just ensure they use values from store if needed, but they take args so it's fine.
    
    addCase: async (newCase) => {
      set({ isLoading: true });
      const uploadDocument = async (caseId: string, docType: DocumentType, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', caseId);
        formData.append('documentType', docType);

        const res = await fetch('/api/case-documents', {
          method: 'POST',
          body: formData,
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to upload document.');
        }
        return payload.document as Database['public']['Tables']['case_documents']['Row'];
      };

      const mergeDocs = (docs: LoanCaseDocument[] = [], docTypes: string[]) => {
        const docMap = new Map<string, LoanCaseDocument>();
        docs.forEach(doc => docMap.set(doc.type, doc));
        return docTypes.map(type => docMap.get(type) ?? { type, uploaded: false, file: null });
      };

      try {
        const { createLoanCase } = await import('./supabase/api');
        const createdCase = await createLoanCase(newCase);

        if (createdCase) {
          const docTypes = get().config.activeDocumentTypes.length
            ? get().config.activeDocumentTypes
            : Array.from(DOCUMENT_TYPES);

          const docsToUpload = (newCase.documents || []).filter(
            (doc) => doc.file instanceof File
          );

          let uploadedDocs: Database['public']['Tables']['case_documents']['Row'][] = [];
          if (docsToUpload.length) {
            uploadedDocs = await Promise.all(
              docsToUpload.map((doc) =>
                uploadDocument(createdCase.id, doc.type, doc.file as File)
              )
            );
          }

          const mergedDocuments = mergeDocs(
            [
              ...(createdCase.documents || []),
              ...uploadedDocs.map((doc) => ({
                type: doc.document_type,
                uploaded: doc.uploaded,
                file: doc.file_url,
              })),
            ],
            docTypes
          );

          set((state) => {
            state.cases.unshift({ ...createdCase, documents: mergedDocuments });
            state.isLoading = false;
          });
        }
      } catch (e: any) {
        set({ isLoading: false, error: e.message });
        console.error('Failed to create case:', e);
      }
    },
    
    updateCaseStatus: async (id, status, remarks, details) => {
        set({ isLoading: true });
        try {
            const { updateLoanCaseStatus } = await import('./supabase/api');
            await updateLoanCaseStatus(id, status, remarks, details);
            
            set((state) => {
                state.isLoading = false;
                const loanCase = state.cases.find((c) => c.id === id);
                if(loanCase) {
                    loanCase.status = status;
                    const newUpdate: CaseUpdate = {
                        timestamp: new Date().toISOString(),
                        status,
                        remarks,
                    }
                    loanCase.history.push(newUpdate);
                    if ((status === 'Approved' || status === 'Disbursed') && details) {
                        loanCase.approvedAmount = details.approvedAmount;
                        loanCase.roi = details.roi;
                        loanCase.approvedTenure = details.approvedTenure;
                        loanCase.processingFee = details.processingFee;
                        loanCase.insuranceAmount = details.insuranceAmount;
                    }
                }
            });
        } catch(e: any) {
            set({ isLoading: false, error: e.message });
            console.error('Failed to update status:', e);
        }
    },

    updateCase: (updatedCase) => {
        set(state => {
            const index = state.cases.findIndex(c => c.id === updatedCase.id);
            if (index !== -1) {
                state.cases[index] = updatedCase;
            }
        })
    },

    addOfficer: (name) => {
      set(state => {
        if (!state.officers.includes(name)) {
          state.officers.push(name);
        }
      });
    },

    updateOfficer: (oldName, newName) => {
      set(state => {
        const index = state.officers.indexOf(oldName);
        if (index !== -1) {
          state.officers[index] = newName;
          state.cases.forEach(c => {
            if (c.teamMember === oldName) {
              c.teamMember = newName;
            }
          });
        }
      });
    },

    removeOfficer: (name) => {
      set(state => {
        state.officers = state.officers.filter(o => o !== name);
      });
    },

    addBank: (name) => {
      set(state => {
        if (!state.banks.includes(name)) {
          state.banks.push(name);
        }
      });
    },

    updateBank: (oldName, newName) => {
      set(state => {
        const index = state.banks.indexOf(oldName);
        if (index !== -1) {
          state.banks[index] = newName;
          state.cases.forEach(c => {
            if (c.bankName === oldName) {
              c.bankName = newName;
            }
          });
        }
      });
    },

    removeBank: (name) => {
      set(state => {
        state.banks = state.banks.filter(b => b !== name);
      });
    },
    
    updateCaseDocument: async (caseId, docType, file) => {
      set({ isLoading: true });
      const uploadDocument = async () => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caseId', caseId);
        formData.append('documentType', docType);

        const res = await fetch('/api/case-documents', {
          method: 'POST',
          body: formData,
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || 'Failed to upload document.');
        }
        return payload.document as Database['public']['Tables']['case_documents']['Row'];
      };

      const docTypes = get().config.activeDocumentTypes.length
        ? get().config.activeDocumentTypes
        : Array.from(DOCUMENT_TYPES);

      const mergeDocs = (docs: LoanCaseDocument[] = []) => {
        const docMap = new Map<string, LoanCaseDocument>();
        docs.forEach(doc => docMap.set(doc.type, doc));
        return docTypes.map(type => docMap.get(type) ?? { type, uploaded: false, file: null });
      };

      try {
        const uploadedDoc = await uploadDocument();
        set(state => {
          state.isLoading = false;
          const loanCase = state.cases.find(c => c.id === caseId);
          if (loanCase) {
            loanCase.documents = mergeDocs([
              ...(loanCase.documents || []),
              {
                type: uploadedDoc.document_type,
                uploaded: uploadedDoc.uploaded,
                file: uploadedDoc.file_url,
              },
            ]);
          }
        });
      } catch (e: any) {
        set({ isLoading: false, error: e.message });
        console.error('Failed to upload document:', e);
        throw e;
      }
    }
  }))
);
