
'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { LoanCase, CaseStatus, CaseUpdate } from './types';
import { INITIAL_CASES } from './data';

type State = {
  cases: LoanCase[];
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
};

export const useLoanStore = create<State & Actions>()(
  immer((set, get) => ({
    cases: INITIAL_CASES,

    getCaseById: (id) => {
      return get().cases.find((c) => c.id === id);
    },

    addCase: (newCase) => {
      set((state) => {
        const newId = `LC-${String(state.cases.length + 1).padStart(3, '0')}`;
        state.cases.unshift({
          ...newCase,
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
                if (status === 'Approved' && details) {
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
    }
  }))
);
