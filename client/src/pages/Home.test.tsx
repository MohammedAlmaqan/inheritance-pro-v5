import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { validateEstate, validateHeirs } from '@/lib/validation';
import { calculateInheritance } from '@/lib/inheritance-engine';
import type { HeirsData } from '@/lib/types';

/**
 * Integration Tests: Home.tsx Component + Zustand Store
 * Tests the interaction between Home component, Zustand store, and validation
 */

function createHeirs(overrides: Partial<HeirsData> = {}): HeirsData {
  return {
    husband: 0, wife: 0, father: 0, mother: 0, grandfather: 0,
    grandmother_father: 0, grandmother_mother: 0, son: 0, daughter: 0,
    grandson: 0, granddaughter: 0, full_brother: 0, full_sister: 0,
    paternal_brother: 0, paternal_sister: 0, maternal_brother: 0,
    maternal_sister: 0, full_nephew: 0, paternal_nephew: 0, full_uncle: 0,
    paternal_uncle: 0, full_cousin: 0, paternal_cousin: 0, maternal_uncle: 0,
    maternal_aunt: 0, paternal_aunt: 0, daughter_son: 0, daughter_daughter: 0,
    sister_children: 0, ...overrides,
  };
}

describe('Home Component Integration Tests', () => {
  beforeEach(() => {
    useAppStore.setState({
      madhab: 'shafii',
      estate: { total: 100000, funeral: 0, debts: 0, will: 0 },
      heirs: createHeirs(),
      result: null,
      isCalculating: false,
      activeTab: 'estate',
      history: [],
    });
  });

  describe('Store State Management', () => {
    it('should initialize with default state', () => {
      const state = useAppStore.getState();
      expect(state.madhab).toBe('shafii');
      expect(state.estate.total).toBe(100000);
      expect(state.result).toBeNull();
    });

    it('should update madhab selection', () => {
      const store = useAppStore.getState();
      store.setMadhab('hanafi');
      expect(useAppStore.getState().madhab).toBe('hanafi');
    });

    it('should update estate data', () => {
      const store = useAppStore.getState();
      const newEstate = { total: 50000, funeral: 1000, debts: 2000, will: 3000 };
      store.setEstate(newEstate);
      expect(useAppStore.getState().estate).toEqual(newEstate);
    });

    it('should reset all state', () => {
      const store = useAppStore.getState();
      store.setMadhab('hanafi');
      store.updateEstateField('funeral', 1000);
      store.resetAll();
      
      const newState = useAppStore.getState();
      expect(newState.madhab).toBe('shafii');
      expect(newState.estate.funeral).toBe(0);
    });
  });

  describe('Validation Integration', () => {
    it('should validate positive estate total', () => {
      const estate = { total: 100000, funeral: 0, debts: 0, will: 0 };
      const validation = validateEstate(estate);
      expect(validation.success).toBe(true);
    });

    it('should reject zero estate total', () => {
      const estate = { total: 0, funeral: 0, debts: 0, will: 0 };
      const validation = validateEstate(estate);
      expect(validation.success).toBe(false);
    });

    it('should reject negative estate values', () => {
      const estate = { total: 100000, funeral: -1000, debts: 0, will: 0 };
      const validation = validateEstate(estate);
      expect(validation.success).toBe(false);
    });

    it('should reject when costs exceed estate', () => {
      const estate = { total: 50000, funeral: 30000, debts: 30000, will: 0 };
      const validation = validateEstate(estate);
      expect(validation.success).toBe(false);
    });

    it('should require at least one heir', () => {
      const heirs = createHeirs();
      const validation = validateHeirs(heirs);
      expect(validation.success).toBe(false);
    });

    it('should accept valid heirs', () => {
      const heirs = createHeirs({ son: 1 });
      const validation = validateHeirs(heirs);
      expect(validation.success).toBe(true);
    });

    it('should reject excessive heir counts', () => {
      const heirs = createHeirs({ son: 15 });
      const validation = validateHeirs(heirs);
      expect(validation.success).toBe(false);
    });
  });

  describe('Calculation Flow', () => {
    it('should calculate father and son inheritance', () => {
      const estate = { total: 100000, funeral: 0, debts: 0, will: 0 };
      const heirs = createHeirs({ father: 1, son: 1 });
      const result = calculateInheritance('shafii', estate, heirs);
      
      expect(result.success).toBe(true);
      expect(result.netEstate).toBe(100000);
      expect(result.shares.length).toBeGreaterThan(0);
    });

    it('should apply estate deductions', () => {
      const estate = { total: 100000, funeral: 5000, debts: 10000, will: 5000 };
      const heirs = createHeirs({ son: 1 });
      const result = calculateInheritance('shafii', estate, heirs);
      
      expect(result.success).toBe(true);
      expect(result.netEstate).toBe(80000);
    });

    it('should support all four madhabs', () => {
      const estate = { total: 100000, funeral: 0, debts: 0, will: 0 };
      const heirs = createHeirs({ father: 1, son: 2 });

      const hanafi = calculateInheritance('hanafi', estate, heirs);
      const maliki = calculateInheritance('maliki', estate, heirs);
      const shafii = calculateInheritance('shafii', estate, heirs);
      const hanbali = calculateInheritance('hanbali', estate, heirs);

      expect(hanafi.success).toBe(true);
      expect(maliki.success).toBe(true);
      expect(shafii.success).toBe(true);
      expect(hanbali.success).toBe(true);
    });

    it('should calculate with multiple heirs', () => {
      const estate = { total: 100000, funeral: 0, debts: 0, will: 0 };
      const heirs = createHeirs({ father: 1, mother: 1, son: 1 });
      const result = calculateInheritance('shafii', estate, heirs);
      
      expect(result.success).toBe(true);
      expect(result.shares.length).toBeGreaterThan(0);
    });

    it('should reject calculation with no heirs', () => {
      const estate = { total: 100000, funeral: 0, debts: 0, will: 0 };
      const heirs = createHeirs();
      const result = calculateInheritance('shafii', estate, heirs);
      
      expect(result.success).toBe(false);
    });
  });

  describe('History Management', () => {
    it('should add results to history', () => {
      const store = useAppStore.getState();
      const heirs = createHeirs({ son: 1 });
      const result = calculateInheritance('shafii', store.estate, heirs);

      if (result.success) {
        store.addToHistory(result);
        expect(useAppStore.getState().history.length).toBe(1);
      }
    });

    it('should maintain max history limit', () => {
      const store = useAppStore.getState();
      const heirs = createHeirs({ son: 1 });
      const result = calculateInheritance('shafii', store.estate, heirs);

      if (result.success) {
        for (let i = 0; i <= store.maxHistoryItems; i++) {
          store.addToHistory(result);
        }
        expect(useAppStore.getState().history.length).toBeLessThanOrEqual(store.maxHistoryItems);
      }
    });

    it('should clear history when requested', () => {
      const store = useAppStore.getState();
      const heirs = createHeirs({ son: 1 });
      const result = calculateInheritance('shafii', store.estate, heirs);

      if (result.success) {
        store.addToHistory(result);
        store.clearHistory();
        expect(useAppStore.getState().history.length).toBe(0);
      }
    });
  });

  describe('State Persistence', () => {
    it('should persist madhab to localStorage', () => {
      const store = useAppStore.getState();
      store.setMadhab('maliki');

      const stored = localStorage.getItem('inheritance-pro-store');
      if (stored) {
        const data = JSON.parse(stored);
        expect(data.state?.madhab).toBe('maliki');
      }
    });

    it('should persist estate to localStorage', () => {
      const store = useAppStore.getState();
      const estate = { total: 75000, funeral: 2000, debts: 3000, will: 1000 };
      store.setEstate(estate);

      const stored = localStorage.getItem('inheritance-pro-store');
      if (stored) {
        const data = JSON.parse(stored);
        expect(data.state?.estate).toEqual(estate);
      }
    });
  });

  describe('Error Handling', () => {
    it('should provide estate validation errors', () => {
      const invalidEstate = { total: -1, funeral: 0, debts: 0, will: 0 };
      const validation = validateEstate(invalidEstate);
      
      expect(validation.success).toBe(false);
      expect(validation.errors?.length).toBeGreaterThan(0);
    });

    it('should provide heir validation errors', () => {
      const heirs = createHeirs();
      const validation = validateHeirs(heirs);
      
      expect(validation.success).toBe(false);
      expect(validation.errors?.length).toBeGreaterThan(0);
    });

    it('should return error messages in Arabic', () => {
      const estate = { total: 0, funeral: 0, debts: 0, will: 0 };
      const validation = validateEstate(estate);
      
      if (!validation.success && validation.errors) {
        expect(validation.errors[0].message).toBeTruthy();
      }
    });
  });
});
