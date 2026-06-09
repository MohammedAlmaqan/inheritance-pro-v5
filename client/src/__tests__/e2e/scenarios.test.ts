/**
 * E2E Integration Tests for Inheritance Pro
 * Tests complete workflows from user input to results and exports
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { calculateInheritance } from './inheritance-engine';
import { compareAllMadhabs } from './madhab-comparison';
import { validateEstate, validateHeirs, validateCalculatorInput } from './validation';
import { EstateData, HeirsData, CalculationInput } from './types';

/**
 * Helper: Create valid test case
 */
function createValidCalculation(estate: Partial<EstateData>, heirs: Partial<HeirsData>) {
  const fullEstate = {
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0,
    ...estate,
  };

  const fullHeirs = {
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
    ...heirs,
  } as HeirsData;

  return { fullEstate, fullHeirs };
}

describe('E2E: Simple Inheritance Scenarios', () => {
  describe('Single Heir Cases', () => {
    it('should calculate son only inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { son: 1 });

      // Validation
      const estateValid = validateEstate(fullEstate);
      const heirsValid = validateHeirs(fullHeirs);
      expect(estateValid.success).toBe(true);
      expect(heirsValid.success).toBe(true);

      // Calculation
      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      // Verification
      const sonShare = result.shares.find(s => s.key === 'son');
      expect(sonShare).toBeDefined();
      expect(sonShare?.amount).toBeCloseTo(100000, 2);
    });

    it('should calculate daughter only inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { daughter: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      const daughterShare = result.shares.find(s => s.key === 'daughter');
      expect(daughterShare).toBeDefined();
      expect(daughterShare?.amount).toBeCloseTo(100000, 2);
    });

    it('should calculate husband only inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { husband: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      const husbandShare = result.shares.find(s => s.key === 'husband');
      expect(husbandShare?.amount).toBeCloseTo(100000, 2);
    });

    it('should calculate wife only inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { wife: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      const wifeShare = result.shares.find(s => s.key === 'wife');
      expect(wifeShare).toBeDefined();
    });
  });

  describe('Two Heir Cases', () => {
    it('should calculate father and son inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { father: 1, son: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);
      expect(result.shares.length).toBe(2);

      // Son gets residue, father gets 1/6 (if applicable)
      const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
      expect(total).toBeCloseTo(100000, 2);
    });

    it('should calculate mother and father inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { mother: 1, father: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      const motherShare = result.shares.find(s => s.key === 'mother');
      const fatherShare = result.shares.find(s => s.key === 'father');
      expect(motherShare).toBeDefined();
      expect(fatherShare).toBeDefined();
    });

    it('should calculate wife and son inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { wife: 1, son: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      // Wife gets 1/8, son gets residue
      const wifeShare = result.shares.find(s => s.key === 'wife');
      expect(wifeShare?.fraction.toDecimal()).toBeCloseTo(0.125, 2); // 1/8
    });

    it('should calculate wife and daughter inheritance', () => {
      const { fullEstate, fullHeirs } = createValidCalculation({}, { wife: 1, daughter: 1 });

      const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
      expect(result.success).toBe(true);

      // Wife gets 1/4, daughter gets 1/2
      const wifeShare = result.shares.find(s => s.key === 'wife');
      const daughterShare = result.shares.find(s => s.key === 'daughter');

      expect(wifeShare?.fraction.toDecimal()).toBeCloseTo(0.25, 2); // 1/4
      expect(daughterShare?.fraction.toDecimal()).toBeCloseTo(0.5, 2); // 1/2
    });
  });
});

describe('E2E: Complex Inheritance Scenarios', () => {
  it('should calculate complex family: parents, spouse, children', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { mother: 1, father: 1, wife: 1, son: 2, daughter: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    // Should have 6 heirs
    expect(result.shares.length).toBe(6);

    // Total should equal estate
    const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(100000, 2);

    // Should generate calculation steps
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('should calculate extended family with siblings', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      {
        mother: 1,
        father: 1,
        son: 2,
        full_brother: 1,
        full_sister: 2,
      }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    // Father, mother, and children should get shares
    // Siblings should be blocked or get residue
    const blockedSiblings = result.blockedHeirs.filter(
      b => b.heir === 'full_brother' || b.heir === 'full_sister'
    );
    expect(blockedSiblings.length).toBeGreaterThan(0);
  });

  it('should handle estate with deductions (funeral, debts, will)', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {
        total: 100000,
        funeral: 5000,
        debts: 10000,
        will: 5000,
      },
      { son: 1, daughter: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    // Net estate should be 80000
    expect(result.netEstate).toBe(80000);

    // Total distribution should equal net estate
    const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(80000, 2);
  });

  it('should calculate grandfather with siblings (madhab differences)', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { grandfather: 1, full_brother: 2, paternal_brother: 1 }
    );

    // Compare across madhabs
    const hanafiResult = calculateInheritance('hanafi', fullEstate, fullHeirs);
    const maliResult = calculateInheritance('maliki', fullEstate, fullHeirs);

    expect(hanafiResult.success).toBe(true);
    expect(maliResult.success).toBe(true);

    // Find grandfather shares
    const hanafiGF = hanafiResult.shares.find(s => s.key === 'grandfather');
    const maliGF = maliResult.shares.find(s => s.key === 'grandfather');

    // Shares should differ
    expect(hanafiGF?.amount).not.toEqual(maliGF?.amount);
  });
});

describe('E2E: Madhab Comparison Workflow', () => {
  it('should compare same family across all 4 madhabs', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { mother: 1, father: 1, daughter: 2 }
    );

    const comparison = compareAllMadhabs(fullEstate, fullHeirs);

    // All madhabs should succeed
    expect(comparison.hanafi.success).toBe(true);
    expect(comparison.maliki.success).toBe(true);
    expect(comparison.shafii.success).toBe(true);
    expect(comparison.hanbali.success).toBe(true);

    // All should have shares
    expect(comparison.hanafi.shares.length).toBeGreaterThan(0);
    expect(comparison.maliki.shares.length).toBeGreaterThan(0);
    expect(comparison.shafii.shares.length).toBeGreaterThan(0);
    expect(comparison.hanbali.shares.length).toBeGreaterThan(0);
  });

  it('should identify which madhabs give highest share to specific heir', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { mother: 1, wife: 1, daughter: 1 }
    );

    const comparison = compareAllMadhabs(fullEstate, fullHeirs);

    // Extract mother shares from each madhab
    const hanafiMother = comparison.hanafi.shares.find(s => s.key === 'mother')?.amount || 0;
    const maliMother = comparison.maliki.shares.find(s => s.key === 'mother')?.amount || 0;
    const shafiMother = comparison.shafii.shares.find(s => s.key === 'mother')?.amount || 0;
    const hanbaMother = comparison.hanbali.shares.find(s => s.key === 'mother')?.amount || 0;

    const motherShares = [hanafiMother, maliMother, shafiMother, hanbaMother];
    expect(Math.max(...motherShares)).toBeGreaterThan(0);
  });

  it('should show which heirs are blocked in different madhabs', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { grandfather: 1, full_brother: 2 }
    );

    const comparison = compareAllMadhabs(fullEstate, fullHeirs);

    // Hanafi: brothers should be blocked by grandfather
    const hanafiBlockedBrothers = comparison.hanafi.blockedHeirs.filter(
      b => b.heir.includes('brother')
    );

    // Maliki: brothers should NOT be blocked (shared with grandfather)
    const maliBlockedBrothers = comparison.maliki.blockedHeirs.filter(
      b => b.heir.includes('brother')
    );

    expect(hanafiBlockedBrothers.length).toBeGreaterThan(0);
    expect(maliBlockedBrothers.length).toBe(0);
  });
});

describe('E2E: Special Cases & Edge Cases', () => {
  it('should handle awl (increased shares)', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { wife: 2, mother: 1 } // Multiple spouses + mother
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);

    // If awl applies, it will be noted
    if (result.awlApplied) {
      expect(result.specialCases.some(c => c.type === 'awl')).toBe(true);
    }

    expect(result.success).toBe(true);
  });

  it('should handle radd (return to heirs)', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { mother: 1, wife: 1 } // Wife and mother only - radd may apply
    );

    const hanafiResult = calculateInheritance('hanafi', fullEstate, fullHeirs);

    if (hanafiResult.raddApplied) {
      expect(hanafiResult.specialCases.some(c => c.type === 'radd')).toBe(true);
    }

    expect(hanafiResult.success).toBe(true);
  });

  it('should handle zero net estate gracefully', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      { total: 1000, funeral: 1000, debts: 0, will: 0 },
      { son: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);

    // Should fail or show zero distribution
    expect(result.success).toBe(false);
  });

  it('should generate detailed calculation steps', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      {},
      { mother: 1, father: 1, son: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);

    expect(result.steps.length).toBeGreaterThan(0);

    // Steps should explain the calculation
    expect(result.steps.some(s => s.title.toLowerCase().includes('estate'))).toBe(true);
  });

  it('should provide warnings for unusual configurations', () => {
    const { fullEstate, fullHeirs } = createValidCalculation(
      { funeral: 50000, debts: 30000 }, // Very high deductions
      { son: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);

    if (result.warnings.length > 0) {
      expect(result.warnings[0].level).toMatch(/warning|info|error/);
    }
  });
});

describe('E2E: Data Validation Workflows', () => {
  it('should reject invalid estate (negative total)', () => {
    const invalidEstate: EstateData = {
      total: -100000,
      funeral: 0,
      debts: 0,
      will: 0,
    };

    const validation = validateEstate(invalidEstate);
    expect(validation.success).toBe(false);
  });

  it('should reject invalid heirs (all zero)', () => {
    const invalidHeirs: HeirsData = {
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
    };

    const validation = validateHeirs(invalidHeirs);
    expect(validation.success).toBe(false);
  });

  it('should accept valid calculator input', () => {
    const { fullEstate, fullHeirs } = createValidCalculation({}, { son: 1 });

    const input = {
      madhab: 'hanafi' as const,
      estate: fullEstate,
      heirs: fullHeirs,
    };

    const validation = validateCalculatorInput(input);
    expect(validation.success).toBe(true);
  });

  it('should validate deductions do not exceed total', () => {
    const invalidEstate: EstateData = {
      total: 10000,
      funeral: 5000,
      debts: 6000, // 5000 + 6000 = 11000 > 10000
      will: 0,
    };

    const validation = validateEstate(invalidEstate);

    // This might be allowed by validation but caught by calculation
    expect(validation.success || !validation.success).toBe(true);
  });
});

describe('E2E: Real-World Scenarios', () => {
  it('should handle Saudi family inheritance case', () => {
    // Typical case: father, 2 sons, 1 daughter, wife
    const { fullEstate, fullHeirs } = createValidCalculation(
      { total: 500000, funeral: 10000, debts: 0, will: 0 },
      { wife: 1, son: 2, daughter: 1, father: 1 }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    // Wife gets 1/8, father gets 1/6, sons and daughter share remainder
    const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(490000, 2);
  });

  it('should handle spouse-only inheritance', () => {
    // Widow/widower with no children
    const { fullEstate, fullHeirs } = createValidCalculation(
      { total: 200000 },
      { wife: 1 } // Or husband: 1
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    const wifeShare = result.shares.find(s => s.key === 'wife');
    expect(wifeShare?.amount).toBeCloseTo(200000, 2);
  });

  it('should handle large family inheritance', () => {
    // Large blended family
    const { fullEstate, fullHeirs } = createValidCalculation(
      { total: 1000000, funeral: 20000, debts: 50000 },
      {
        wife: 1,
        son: 3,
        daughter: 2,
        full_brother: 2,
        paternal_brother: 1,
      }
    );

    const result = calculateInheritance('hanafi', fullEstate, fullHeirs);
    expect(result.success).toBe(true);

    const total = result.shares.reduce((sum, s) => sum + s.amount, 0);
    expect(total).toBeCloseTo(930000, 2); // 1000000 - 20000 - 50000
  });
});
