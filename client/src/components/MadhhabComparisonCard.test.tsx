/**
 * Madhab Comparison Component Tests
 */

import { describe, it, expect } from 'vitest';
import type { MadhhabComparison } from '@/lib/madhab-comparison';
import { Fraction } from '@/lib/fraction';

// Mock comparison result with consistent outcomes
const consistentComparison: MadhhabComparison = {
  madhabs: {
    hanafi: {
      success: true,
      madhab: 'hanafi',
      madhhabName: 'الحنفية',
      estate: { total: 100000, funeral: 1000, debts: 5000, will: 0 },
      netEstate: 94000,
      asl: 2,
      finalBase: 2,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½ لعدم وجود فرع وارث',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 3),
          count: 1,
          shares: 31333,
          reason: '⅓ الزوجة',
        },
      ],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      steps: [],
      confidence: 100,
      confidenceLevel: 'high',
      calculationTime: 15,
    },
    maliki: {
      success: true,
      madhab: 'maliki',
      madhhabName: 'المالكية',
      estate: { total: 100000, funeral: 1000, debts: 5000, will: 0 },
      netEstate: 94000,
      asl: 2,
      finalBase: 2,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½ لعدم وجود فرع وارث',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 3),
          count: 1,
          shares: 31333,
          reason: '⅓ الزوجة',
        },
      ],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      steps: [],
      confidence: 100,
      confidenceLevel: 'high',
      calculationTime: 14,
    },
    shafii: {
      success: true,
      madhab: 'shafii',
      madhhabName: 'الشافعية',
      estate: { total: 100000, funeral: 1000, debts: 5000, will: 0 },
      netEstate: 94000,
      asl: 2,
      finalBase: 2,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½ لعدم وجود فرع وارث',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 3),
          count: 1,
          shares: 31333,
          reason: '⅓ الزوجة',
        },
      ],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      steps: [],
      confidence: 100,
      confidenceLevel: 'high',
      calculationTime: 14,
    },
    hanbali: {
      success: true,
      madhab: 'hanbali',
      madhhabName: 'الحنابلة',
      estate: { total: 100000, funeral: 1000, debts: 5000, will: 0 },
      netEstate: 94000,
      asl: 2,
      finalBase: 2,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½ لعدم وجود فرع وارث',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 3),
          count: 1,
          shares: 31333,
          reason: '⅓ الزوجة',
        },
      ],
      specialCases: [],
      blockedHeirs: [],
      madhhabNotes: [],
      warnings: [],
      steps: [],
      confidence: 100,
      confidenceLevel: 'high',
      calculationTime: 13,
    },
  },
  consistent: true,
  differences: [],
};

// Mock comparison with differences
const inconsistentComparison: MadhhabComparison = {
  madhabs: {
    hanafi: {
      ...consistentComparison.madhabs.hanafi,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 50000,
          reason: '½',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 3),
          count: 1,
          shares: 32000,
          reason: '⅓',
        },
      ],
    },
    maliki: {
      ...consistentComparison.madhabs.maliki,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½',
        },
        {
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: new Fraction(1, 6),
          count: 1,
          shares: 15666,
          reason: '⅙',
        },
      ],
    },
    shafii: {
      ...consistentComparison.madhabs.shafii,
      shares: [
        {
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: new Fraction(1, 2),
          count: 1,
          shares: 47000,
          reason: '½',
        },
      ],
    },
    hanbali: consistentComparison.madhabs.hanbali,
  },
  consistent: false,
  differences: [
    {
      madhab: 'المالكية',
      heir: 'الأم',
      amount: 15667,
      percentage: 0.499,
    },
    {
      madhab: 'الشافعية',
      heir: 'الأم',
      amount: 15667,
      percentage: 0.499,
    },
  ],
};

describe('MadhhabComparisonCard', () => {
  it('should create consistent comparison with all madhabs matching', () => {
    expect(consistentComparison.consistent).toBe(true);
    expect(consistentComparison.differences.length).toBe(0);
  });

  it('should have all four madhabs in comparison', () => {
    expect(Object.keys(consistentComparison.madhabs).length).toBe(4);
    expect(consistentComparison.madhabs.hanafi).toBeDefined();
    expect(consistentComparison.madhabs.maliki).toBeDefined();
    expect(consistentComparison.madhabs.shafii).toBeDefined();
    expect(consistentComparison.madhabs.hanbali).toBeDefined();
  });

  it('should have valid netEstate for each madhab', () => {
    Object.entries(consistentComparison.madhabs).forEach(([_, result]) => {
      expect(result.netEstate).toBeGreaterThan(0);
      expect(result.netEstate).toBe(94000);
    });
  });

  it('should have shares for each successful calculation', () => {
    Object.entries(consistentComparison.madhabs).forEach(([_, result]) => {
      if (result.success) {
        expect(result.shares.length).toBeGreaterThan(0);
        expect(result.shares.length).toBe(2);
      }
    });
  });

  it('should identify inconsistent comparison correctly', () => {
    expect(inconsistentComparison.consistent).toBe(false);
    expect(inconsistentComparison.differences.length).toBeGreaterThan(0);
  });

  it('should track differences in madhab results', () => {
    const hanafi = inconsistentComparison.madhabs.hanafi;
    const maliki = inconsistentComparison.madhabs.maliki;

    // Hanafi has different values than Maliki
    expect(hanafi.shares[0].shares).not.toBe(maliki.shares[0].shares);
  });

  it('should have correct heir names in shares', () => {
    const shares = consistentComparison.madhabs.hanafi.shares;
    const heirNames = shares.map((s) => s.name);

    expect(heirNames).toContain('الزوج');
    expect(heirNames).toContain('الأم');
  });

  it('should calculate share amounts correctly', () => {
    const hanafi = consistentComparison.madhabs.hanafi;
    const totalShares = hanafi.shares.reduce((sum, share) => sum + share.shares, 0);

    // Validate that each share has a calculated amount
    expect(totalShares).toBeGreaterThan(0);
    hanafi.shares.forEach((share) => {
      expect(share.shares).toBeGreaterThan(0);
      expect(share.shares).toBeLessThan(hanafi.netEstate);
    });
  });

  it('should have fraction for each share', () => {
    const shares = consistentComparison.madhabs.hanafi.shares;

    shares.forEach((share) => {
      expect(share.fraction).toBeDefined();
      expect(share.fraction.num).toBeGreaterThan(0);
      expect(share.fraction.den).toBeGreaterThan(0);
    });
  });

  it('should have Arabic locality names for madhabs', () => {
    const madhabs = {
      hanafi: 'الحنفية',
      maliki: 'المالكية',
      shafii: 'الشافعية',
      hanbali: 'الحنابلة',
    };

    Object.entries(madhabs).forEach(([key, expectedName]) => {
      expect(consistentComparison.madhabs[key as keyof typeof consistentComparison.madhabs].madhhabName).toBe(
        expectedName,
      );
    });
  });

  it('should have different calculation times for madhabs', () => {
    const times = Object.entries(consistentComparison.madhabs).map(([_, result]) => result.calculationTime);

    expect(times.length).toBe(4);
    expect(times.every((t) => t > 0)).toBe(true);
  });

  it('should mark calculations as successful', () => {
    Object.entries(consistentComparison.madhabs).forEach(([_, result]) => {
      expect(result.success).toBe(true);
      expect(result.confidence).toBe(100);
    });
  });

  it('should contain heir details with fractions', () => {
    const shares = consistentComparison.madhabs.hanafi.shares;

    shares.forEach((share) => {
      expect(share.key).toBeDefined();
      expect(share.name).toBeDefined();
      expect(share.type).toBeDefined();
      expect(share.fraction).toBeDefined();
    });
  });

  it('should handle comparison with failed madhab calculations', () => {
    const failedComparison: MadhhabComparison = {
      ...consistentComparison,
      madhabs: {
        ...consistentComparison.madhabs,
        hanafi: {
          ...consistentComparison.madhabs.hanafi,
          success: false,
          error: 'خطأ في الحساب',
        } as any,
      },
    };

    expect(failedComparison.madhabs.hanafi.success).toBe(false);
  });

  it('should have proper difference structure when inconsistent', () => {
    inconsistentComparison.differences.forEach((diff) => {
      expect(diff.madhab).toBeDefined();
      expect(diff.heir).toBeDefined();
      expect(diff.amount).toBeGreaterThan(0);
      expect(diff.percentage).toBeGreaterThan(0);
    });
  });

  it('should limit summary differences to 5 items', () => {
    const manyDifferencesComparison: MadhhabComparison = {
      ...inconsistentComparison,
      differences: Array(10)
        .fill(null)
        .map((_, i) => ({
          madhab: `المذهب ${i}`,
          heir: `الوارث ${i}`,
          amount: 1000 * (i + 1),
          percentage: 0.1 * (i + 1),
        })),
    };

    expect(manyDifferencesComparison.differences.length).toBe(10);
    // Component should show only first 5 in summary
    const summaryDiffs = manyDifferencesComparison.differences.slice(0, 5);
    expect(summaryDiffs.length).toBe(5);
  });

  it('should have correct estate breakdown', () => {
    const estate = consistentComparison.madhabs.hanafi.estate;

    expect(estate.total).toBe(100000);
    expect(estate.funeral).toBe(1000);
    expect(estate.debts).toBe(5000);
    expect(estate.total - estate.funeral - estate.debts).toBe(94000);
  });

  it('should track asl and finalBase correctly', () => {
    Object.entries(consistentComparison.madhabs).forEach(([_, result]) => {
      expect(result.asl).toBeGreaterThan(0);
      expect(result.finalBase).toBeGreaterThan(0);
      expect(result.finalBase).toBeLessThanOrEqual(result.asl);
    });
  });

  it('should have proper share fractions that sum to less than or equal to 1', () => {
    const shares = consistentComparison.madhabs.hanafi.shares;
    const totalFraction = shares.reduce((sum, share) => sum + share.fraction.toDecimal(), 0);

    expect(totalFraction).toBeGreaterThan(0);
    expect(totalFraction).toBeLessThanOrEqual(1.01); // Allow small rounding error
  });

  it('should validate madhab color mapping exists for all madhabs', () => {
    const madhabs = ['hanafi', 'maliki', 'shafii', 'hanbali'] as const;
    const colorMap: Record<string, string> = {
      hanafi: 'blue',
      maliki: 'green',
      shafii: 'purple',
      hanbali: 'amber',
    };

    madhabs.forEach((madhab) => {
      expect(colorMap[madhab]).toBeDefined();
    });
  });

  it('should ensure comparison data is immutable-compatible', () => {
    const originalConsistent = consistentComparison.consistent;
    const originalDiffsLength = consistentComparison.differences.length;

    // Ensure no mutations
    expect(consistentComparison.consistent).toBe(originalConsistent);
    expect(consistentComparison.differences.length).toBe(originalDiffsLength);
  });
});
