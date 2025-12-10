
'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { LoanCase, CaseStatus, CaseUpdate, Officer, BankName, DocumentType } from './types';
import { INITIAL_CASES, OFFICERS as INITIAL_OFFICERS, INITIAL_BANK_NAMES } from './data';

type State = {
  cases: LoanCase[];
  officers: Officer[];
  banks: BankName[];
};

type Actions = {
  getCaseById: (id: string) => LoanCase | undefined;
  addCase: (newCase: Omit<LoanCase, 'id' | 'history'>) => void;
  updateCaseStatus: (
    id: string,
    status: CaseStatus,
    remarks: string,
    details?: Partial<Pick<LoanCase, 'approvedAmount' | 'roi' | 'approvedTenure' | 'processingFee' | 'insuranceAmount'>>
  ) => void;
  updateCase: (updatedCase: LoanCase) => void;
  addOfficer: (name: Officer) => void;
  updateOfficer: (oldName: Officer, newName: Officer) => void;
  removeOfficer: (name: Officer) => void;
  addBank: (name: BankName) => void;
  updateBank: (oldName: BankName, newName: BankName) => void;
  removeBank: (name: BankName) => void;
  updateCaseDocument: (caseId: string, docType: DocumentType, file: File) => void;
};

export const useLoanStore = create<State & Actions>()(
  immer((set, get) => ({
    cases: INITIAL_CASES,
    officers: INITIAL_OFFICERS,
    banks: INITIAL_BANK_NAMES,

    getCaseById: (id) => {
      return get().cases.find((c) => c.id === id);
    },

    addCase: (newCase) => {
      set((state) => {
        const newId = `LC-${String(state.cases.length + 1).padStart(3, '0')}`;
        const finalCase = { ...newCase };
        if (finalCase.bankName !== 'Other') {
          delete finalCase.otherBankName;
        }
        state.cases.unshift({
          ...finalCase,
          id: newId,
          history: [],
        });
      });
    },
    
    updateCaseStatus: (id, status, remarks, details) => {
        set((state) => {
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
        })
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
          // Also update in existing cases
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
        // Optional: decide what to do with cases assigned to the removed officer.
        // For now, we'll leave them as is. A select with a removed officer will just not show that option.
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
          // Also update in existing cases
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
    
    updateCaseDocument: (caseId, docType, file) => {
      set(state => {
        const loanCase = state.cases.find(c => c.id === caseId);
        if (loanCase) {
          const doc = loanCase.documents.find(d => d.type === docType);
          if (doc) {
            doc.uploaded = true;
            doc.file = file;
          }
        }
      });
    }
  }))
);
