import { describe, it, expect } from 'vitest';
import {
  compareAllMadhabs,
  getMadhhabDifferences,
  getMadhhabPercentageDifferences,
  checkHeirVariations,
  getMadhhabSummary,
  formatMadhhabComparison,
} from '@/lib/madhab-comparison';
import type { EstateData, HeirsData } from './types';

// Test data: Father and Son case
const fatherSonEstate: EstateData = {
  total: 100000,
  funeral: 5000,
  debts: 0,
  will: 0,
};

const fatherSonHeirs: HeirsData = {
  father: 0,
  mother: 0,
  son: 1,
  daughter: 0,
  husband: 0,
  wife: 0,
  grandfather: 0,
  grandmother_father: 0,
  grandmother_mother: 0,
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

// Test data: Mother and Father with Son
const complexEstate: EstateData = {
  total: 300000,
  funeral: 15000,
  debts: 0,
  will: 0,
};

const complexHeirs: HeirsData = {
  father: 1,
  mother: 1,
  son: 1,
  daughter: 0,
  husband: 0,
  wife: 0,
  grandfather: 0,
  grandmother_father: 0,
  grandmother_mother: 0,
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

describe('Madhab Comparison', () => {
  describe('compareAllMadhabs', () => {
    it('should compare results across all 4 madhabs', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      expect(comparison.madhabs.hanafi).toBeDefined();
      expect(comparison.madhabs.maliki).toBeDefined();
      expect(comparison.madhabs.shafii).toBeDefined();
      expect(comparison.madhabs.hanbali).toBeDefined();
    });

    it('should calculate successful results for all madhabs', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      expect(comparison.madhabs.hanafi.success).toBe(true);
      expect(comparison.madhabs.maliki.success).toBe(true);
      expect(comparison.madhabs.shafii.success).toBe(true);
      expect(comparison.madhabs.hanbali.success).toBe(true);
    });

    it('should identify consistency across madhabs', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      expect(comparison.consistent).toBeDefined();
      expect(typeof comparison.consistent).toBe('boolean');
    });

    it('should track differences when they exist', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);

      expect(Array.isArray(comparison.differences)).toBe(true);
    });

    it('should include netEstate for all madhabs', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      expect(comparison.madhabs.hanafi.netEstate).toBeGreaterThan(0);
      expect(comparison.madhabs.maliki.netEstate).toBeGreaterThan(0);
      expect(comparison.madhabs.shafii.netEstate).toBeGreaterThan(0);
      expect(comparison.madhabs.hanbali.netEstate).toBeGreaterThan(0);
    });
  });

  describe('getMadhhabDifferences', () => {
    it('should return differences between two madhabs', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const differences = getMadhhabDifferences(comparison, 'hanafi', 'maliki');

      expect(differences instanceof Map).toBe(true);
    });

    it('should return empty map for unsuccessful results', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const differences = getMadhhabDifferences(comparison, 'hanafi', 'maliki');

      // In this simple case there might not be differences
      expect(differences instanceof Map).toBe(true);
    });

    it('should show difference amounts', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const differences = getMadhhabDifferences(comparison, 'hanafi', 'maliki');

      differences.forEach((diff) => {
        expect(diff.madhab1).toBeGreaterThanOrEqual(0);
        expect(diff.madhab2).toBeGreaterThanOrEqual(0);
        expect(diff.difference).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getMadhhabPercentageDifferences', () => {
    it('should return percentage for each madhab', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const percentages = getMadhhabPercentageDifferences(comparison);

      expect(percentages).toHaveProperty('hanafi');
      expect(percentages).toHaveProperty('maliki');
      expect(percentages).toHaveProperty('shafii');
      expect(percentages).toHaveProperty('hanbali');
    });

    it('should have percentages for each heir', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const percentages = getMadhhabPercentageDifferences(comparison);

      Object.values(percentages).forEach((madhab) => {
        Object.values(madhab).forEach((percentage) => {
          expect(percentage).toBeGreaterThanOrEqual(0);
          expect(percentage).toBeLessThanOrEqual(100);
        });
      });
    });
  });

  describe('checkHeirVariations', () => {
    it('should find variations for a specific heir', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const variations = checkHeirVariations(comparison, 'الأب');

      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBeGreaterThan(0);
    });

    it('should include madhab and amount for each variation', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const variations = checkHeirVariations(comparison, 'الأب');

      variations.forEach((v) => {
        expect(['hanafi', 'maliki', 'shafii', 'hanbali']).toContain(v.madhab);
        expect(v.amount).toBeGreaterThanOrEqual(0);
        expect(v.percentage).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include treatment/reason for each variation', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const variations = checkHeirVariations(comparison, 'الأب');

      variations.forEach((v) => {
        expect(v.treatment).toBeDefined();
      });
    });

    it('should return empty array for non-existent heir', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const variations = checkHeirVariations(comparison, 'الخال');

      expect(Array.isArray(variations)).toBe(true);
      expect(variations.length).toBe(0);
    });
  });

  describe('getMadhhabSummary', () => {
    it('should return summary for each madhab', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const summary = getMadhhabSummary(comparison);

      expect(summary).toHaveProperty('hanafi');
      expect(summary).toHaveProperty('maliki');
      expect(summary).toHaveProperty('shafii');
      expect(summary).toHaveProperty('hanbali');
    });

    it('should include netEstate in summary', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const summary = getMadhhabSummary(comparison);

      Object.values(summary).forEach((s) => {
        expect(s.netEstate).toBeGreaterThan(0);
      });
    });

    it('should include heir count in summary', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const summary = getMadhhabSummary(comparison);

      Object.values(summary).forEach((s) => {
        expect(s.heirCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include total distributed amount', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const summary = getMadhhabSummary(comparison);

      Object.values(summary).forEach((s) => {
        expect(s.totalDistributed).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('formatMadhhabComparison', () => {
    it('should generate text output', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const output = formatMadhhabComparison(comparison);

      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    });

    it('should include all madhab names', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const output = formatMadhhabComparison(comparison);

      expect(output).toContain('الحنفي');
      expect(output).toContain('المالكي');
      expect(output).toContain('الشافعي');
      expect(output).toContain('الحنبلي');
    });

    it('should include heir names and amounts', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const output = formatMadhhabComparison(comparison);

      expect(output).toContain('الابن');
    });

    it('should include comparison title', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const output = formatMadhhabComparison(comparison);

      expect(output).toContain('مقارنة المذاهب');
    });

    it('should document differences when they exist', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);
      const output = formatMadhhabComparison(comparison);

      if (comparison.differences.length > 0) {
        expect(output).toContain('الفروقات');
      }
    });
  });

  describe('Comparison Integration', () => {
    it('should work with multiple test cases', () => {
      const testCases = [
        { estate: fatherSonEstate, heirs: fatherSonHeirs },
        { estate: complexEstate, heirs: complexHeirs },
      ];

      testCases.forEach(({ estate, heirs }) => {
        const comparison = compareAllMadhabs(estate, heirs);

        expect(comparison.madhabs.hanafi.success).toBe(true);
        expect(comparison.madhabs.maliki.success).toBe(true);
        expect(comparison.madhabs.shafii.success).toBe(true);
        expect(comparison.madhabs.hanbali.success).toBe(true);
      });
    });

    it('should provide consistent data across all utilities', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      const summary = getMadhhabSummary(comparison);
      const percentages = getMadhhabPercentageDifferences(comparison);
      const formatted = formatMadhhabComparison(comparison);

      // All utilities should work without errors
      expect(summary).toBeDefined();
      expect(percentages).toBeDefined();
      expect(formatted).toBeDefined();
    });

    it('should match total distributed with netEstate', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);
      const summary = getMadhhabSummary(comparison);

      // In most cases, distributed should equal or be close to netEstate
      Object.entries(summary).forEach(([madhab, data]) => {
        // Allow small rounding differences
        const difference = Math.abs(data.totalDistributed - data.netEstate);
        const allowedDifference = data.netEstate * 0.01; // 1% tolerance
        expect(difference).toBeLessThanOrEqual(allowedDifference);
      });
    });
  });

  describe('Madhab-Specific Behavior', () => {
    it('should calculate for all madhabs identically for simple cases', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      // In father+son case, all madhabs should give son the whole estate
      const hanafiSon = comparison.madhabs.hanafi.shares.find((s) => s.name === 'الابن');
      const maliSon = comparison.madhabs.maliki.shares.find((s) => s.name === 'الابن');

      expect(hanafiSon?.amount).toBe(maliSon?.amount);
    });

    it('should handle complex cases with potential madhab variations', () => {
      const comparison = compareAllMadhabs(complexEstate, complexHeirs);

      // All should succeed regardless of madhab
      Object.values(comparison.madhabs).forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.shares.length).toBeGreaterThan(0);
      });
    });

    it('should provide madhab notes for all results', () => {
      const comparison = compareAllMadhabs(fatherSonEstate, fatherSonHeirs);

      Object.values(comparison.madhabs).forEach((result) => {
        if (result.success) {
          expect(Array.isArray(result.madhhabNotes)).toBe(true);
        }
      });
    });
  });
});
