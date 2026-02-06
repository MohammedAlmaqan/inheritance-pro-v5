/**
 * Madhab Comparison Utility
 * Calculate and compare inheritance results across all 4 madhabs
 */

import { calculateInheritance } from './inheritance-engine';
import { FIQH_DATABASE } from './fiqh-database';
import type { EstateData, HeirsData, CalculationResult, Madhab } from './types';

export interface MadhhabComparison {
  madhabs: {
    hanafi: CalculationResult;
    maliki: CalculationResult;
    shafii: CalculationResult;
    hanbali: CalculationResult;
  };
  consistent: boolean;
  differences: {
    madhab: string;
    heir: string;
    amount: number;
    percentage: number;
  }[];
}

/**
 * Compare inheritance calculations across all 4 madhabs
 */
export function compareAllMadhabs(
  estate: EstateData,
  heirs: HeirsData
): MadhhabComparison {
  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  const results: Record<string, CalculationResult> = {};
  for (const madhab of madhabs) {
    results[madhab] = calculateInheritance(madhab, estate, heirs);
  }

  // Check if all results are consistent
  const allSuccessful = madhabs.every((m) => results[m].success);

  // Find differences in distributions
  const differences: MadhhabComparison['differences'] = [];

  if (allSuccessful) {
    const firstResult = results['hanafi'];
    const heirNames = new Set<string>();

    // Collect all heir names
    madhabs.forEach((m) => {
      results[m].shares.forEach((share) => {
        heirNames.add(share.name);
      });
    });

    // Compare heir amounts across madhabs
    heirNames.forEach((heirName) => {
      const amounts: Record<string, number> = {};

      madhabs.forEach((m) => {
        const share = results[m].shares.find((s) => s.name === heirName);
        amounts[m] = share ? share.amount || 0 : 0;
      });

      // Check if amounts differ
      const unique = new Set(Object.values(amounts));
      if (unique.size > 1) {
        // Find differences from first madhab
        const hanafiAmount = amounts['hanafi'] || 0;
        madhabs.forEach((m) => {
          if (m !== 'hanafi' && amounts[m] !== hanafiAmount) {
            const madhabhData = (FIQH_DATABASE.madhabs as any)[m];
            const madhabhName = madhabhData?.name || m;
            differences.push({
              madhab: madhabhName,
              heir: heirName,
              amount: Math.abs(amounts[m] - hanafiAmount),
              percentage: hanafiAmount > 0 ? Math.abs(amounts[m] - hanafiAmount) / hanafiAmount : 0,
            });
          }
        });
      }
    });
  }

  return {
    madhabs: {
      hanafi: results['hanafi'] as CalculationResult,
      maliki: results['maliki'] as CalculationResult,
      shafii: results['shafii'] as CalculationResult,
      hanbali: results['hanbali'] as CalculationResult,
    },
    consistent: differences.length === 0 && allSuccessful,
    differences,
  };
}

/**
 * Get summary of differences between two madhabs
 */
export function getMadhhabDifferences(
  comparison: MadhhabComparison,
  madhab1: Madhab,
  madhab2: Madhab
): Map<string, { madhab1: number; madhab2: number; difference: number }> {
  const result1 = comparison.madhabs[madhab1];
  const result2 = comparison.madhabs[madhab2];

  if (!result1.success || !result2.success) {
    return new Map();
  }

  const differences = new Map<string, { madhab1: number; madhab2: number; difference: number }>();

  result1.shares.forEach((share1) => {
    const share2 = result2.shares.find((s) => s.name === share1.name);
    const amount1 = share1.amount || 0;
    const amount2 = share2 ? share2.amount || 0 : 0;

    if (amount1 !== amount2) {
      differences.set(share1.name, {
        madhab1: amount1,
        madhab2: amount2,
        difference: Math.abs(amount1 - amount2),
      });
    }
  });

  return differences;
}

/**
 * Get percentage difference for each madhab
 */
export function getMadhhabPercentageDifferences(
  comparison: MadhhabComparison
): Record<string, Record<string, number>> {
  const percentages: Record<string, Record<string, number>> = {
    hanafi: {},
    maliki: {},
    shafii: {},
    hanbali: {},
  };

  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  madhabs.forEach((m) => {
    const result = comparison.madhabs[m as keyof typeof comparison.madhabs];
    if (result && result.success) {
      result.shares.forEach((share) => {
        percentages[m][share.name] = share.fraction.toDecimal() * 100;
      });
    }
  });

  return percentages;
}

/**
 * Check if a specific heir has different treatments across madhabs
 */
export function checkHeirVariations(
  comparison: MadhhabComparison,
  heirName: string
): { madhab: Madhab; amount: number; percentage: number; treatment: string }[] {
  const variations: { madhab: Madhab; amount: number; percentage: number; treatment: string }[] = [];
  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  madhabs.forEach((m) => {
    const result = comparison.madhabs[m as keyof typeof comparison.madhabs];
    if (result) {
      const share = result.shares.find((s) => s.name === heirName);

      if (share) {
        variations.push({
          madhab: m,
          amount: share.amount || 0,
          percentage: share.fraction.toDecimal() * 100,
          treatment: share.reason,
        });
      }
    }
  });

  return variations;
}

/**
 * Get summary statistics for madhab comparison
 */
export function getMadhhabSummary(
  comparison: MadhhabComparison
): Record<string, { netEstate: number; totalDistributed: number; heirCount: number }> {
  const summary: Record<string, { netEstate: number; totalDistributed: number; heirCount: number }> = {
    hanafi: { netEstate: 0, totalDistributed: 0, heirCount: 0 },
    maliki: { netEstate: 0, totalDistributed: 0, heirCount: 0 },
    shafii: { netEstate: 0, totalDistributed: 0, heirCount: 0 },
    hanbali: { netEstate: 0, totalDistributed: 0, heirCount: 0 },
  };

  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];

  madhabs.forEach((m) => {
    const result = comparison.madhabs[m];
    if (result.success) {
      summary[m].netEstate = result.netEstate;
      summary[m].heirCount = result.shares.length;
      summary[m].totalDistributed = result.shares.reduce((sum, share) => sum + (share.amount || 0), 0);
    }
  });

  return summary;
}

/**
 * Format comparison results for display
 */
export function formatMadhhabComparison(comparison: MadhhabComparison): string {
  const madhabs: Madhab[] = ['hanafi', 'maliki', 'shafii', 'hanbali'];
  let output = 'مقارنة المذاهب الفقهية\n';
  output += '==================\n\n';

  madhabs.forEach((m) => {
    const result = comparison.madhabs[m];
    const madhab = (FIQH_DATABASE.madhabs as any)[m];

    output += `${madhab.icon} ${madhab.name}\n`;
    output += `صافي التركة: ${result.netEstate.toLocaleString()}\n`;

    result.shares.forEach((share) => {
      const percentage = (share.fraction.toDecimal() * 100).toFixed(2);
      output += `  • ${share.name}: ${percentage}% (${(share.amount || 0).toLocaleString()})\n`;
    });

    output += '\n';
  });

  if (!comparison.consistent) {
    output += 'الفروقات:\n';
    output += '--------\n';
    comparison.differences.forEach((diff) => {
      output += `${diff.madhab} - ${diff.heir}: فرق ${diff.amount.toLocaleString()} (${(diff.percentage * 100).toFixed(2)}%)\n`;
    });
  }

  return output;
}
