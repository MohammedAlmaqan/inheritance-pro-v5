/**
 * Global State Management using Zustand
 * Inheritance Pro v5.0
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { EstateData, HeirsData, CalculationResult } from './types';
import type { Madhab } from './fiqh-database';

export interface AppState {
  // Settings
  madhab: Madhab;
  setMadhab: (madhab: Madhab) => void;

  // Estate Data
  estate: EstateData;
  setEstate: (estate: EstateData) => void;
  updateEstateField: (field: keyof EstateData, value: number) => void;
  resetEstate: () => void;

  // Heirs Data
  heirs: HeirsData;
  setHeirs: (heirs: HeirsData) => void;
  updateHeirCount: (field: keyof HeirsData, count: number) => void;
  resetHeirs: () => void;

  // Calculation Results
  result: CalculationResult | null;
  setResult: (result: CalculationResult | null) => void;

  // UI State
  isCalculating: boolean;
  setIsCalculating: (calculating: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Calculation History
  history: CalculationResult[];
  addToHistory: (result: CalculationResult) => void;
  clearHistory: () => void;
  maxHistoryItems: number;

  // Reset all
  resetAll: () => void;
}

const INITIAL_ESTATE: EstateData = {
  total: 100000,
  funeral: 0,
  debts: 0,
  will: 0,
};

const INITIAL_HEIRS: HeirsData = {
  husband: 0,
  wife: 0,
  father: 0,
  mother: 0,
  grandfather: 0,
  grandmother_father: 0,
  grandmother_mother: 0,
  son: 0,
  daughter: 0,
  grandson: 0,
  granddaughter: 0,
  full_brother: 0,
  full_sister: 0,
  paternal_brother: 0,
  paternal_sister: 0,
  maternal_brother: 0,
  maternal_sister: 0,
  full_nephew: 0,
  paternal_nephew: 0,
  full_uncle: 0,
  paternal_uncle: 0,
  full_cousin: 0,
  paternal_cousin: 0,
  maternal_uncle: 0,
  maternal_aunt: 0,
  paternal_aunt: 0,
  daughter_son: 0,
  daughter_daughter: 0,
  sister_children: 0,
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Settings
        madhab: 'shafii',
        setMadhab: (madhab) => set({ madhab }),

        // Estate
        estate: INITIAL_ESTATE,
        setEstate: (estate) => set({ estate }),
        updateEstateField: (field, value) =>
          set((state) => ({
            estate: { ...state.estate, [field]: Math.max(0, value) },
          })),
        resetEstate: () => set({ estate: INITIAL_ESTATE }),

        // Heirs
        heirs: INITIAL_HEIRS,
        setHeirs: (heirs) => set({ heirs }),
        updateHeirCount: (field, count) =>
          set((state) => ({
            heirs: { ...state.heirs, [field]: Math.max(0, count) },
          })),
        resetHeirs: () => set({ heirs: INITIAL_HEIRS }),

        // Results
        result: null,
        setResult: (result) => set({ result }),

        // UI
        isCalculating: false,
        setIsCalculating: (calculating) => set({ isCalculating: calculating }),
        activeTab: 'estate',
        setActiveTab: (tab) => set({ activeTab: tab }),

        // History
        history: [],
        maxHistoryItems: 20,
        addToHistory: (result) =>
          set((state) => ({
            history: [
              result,
              ...state.history.slice(0, state.maxHistoryItems - 1),
            ],
          })),
        clearHistory: () => set({ history: [] }),

        // Reset all
        resetAll: () =>
          set({
            madhab: 'shafii',
            estate: INITIAL_ESTATE,
            heirs: INITIAL_HEIRS,
            result: null,
            isCalculating: false,
            activeTab: 'estate',
            history: [],
          }),
      }),
      {
        name: 'inheritance-pro-store',
        partialize: (state) => ({
          madhab: state.madhab,
          estate: state.estate,
          heirs: state.heirs,
          history: state.history,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Selectors for performance optimization
export const useEstate = () => useAppStore((state) => state.estate);
export const useHeirs = () => useAppStore((state) => state.heirs);
export const useResult = () => useAppStore((state) => state.result);
export const useMadhab = () => useAppStore((state) => state.madhab);
export const useHistory = () => useAppStore((state) => state.history);
export const useIsCalculating = () =>
  useAppStore((state) => state.isCalculating);
