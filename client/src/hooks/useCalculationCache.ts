/**
 * useCalculationCache Hook
 * Integrates calculation caching with React
 * Reduces redundant calculations and improves performance
 */

import { useCallback } from 'react';
import { calculateInheritance } from '@/lib/inheritance-engine';
import { calculationCache, historyCache } from '@/lib/cache';
import type { EstateData, HeirsData, CalculationResult } from '@/lib/types';
import type { Madhab } from '@/lib/fiqh-database';

interface UseCalculationCacheOptions {
  enableHistory?: boolean;
  onCacheHit?: () => void;
  onCacheMiss?: () => void;
}

/**
 * Hook for cached inheritance calculations
 * 
 * Usage:
 * ```tsx
 * const { calculate, isCached } = useCalculationCache();
 * const result = calculate('hanafi', estate, heirs);
 * ```
 */
export function useCalculationCache(options: UseCalculationCacheOptions = {}) {
  const {
    enableHistory = true,
    onCacheHit,
    onCacheMiss,
  } = options;

  /**
   * Calculate with automatic caching
   */
  const calculate = useCallback(
    (madhab: Madhab, estate: EstateData, heirs: HeirsData): CalculationResult => {
      // Check cache first
      const cached = calculationCache.getCalculation(madhab, estate, heirs);
      
      if (cached) {
        onCacheHit?.();
        return cached;
      }

      onCacheMiss?.();

      // Perform calculation
      const result = calculateInheritance(madhab, estate, heirs);

      // Cache the result
      if (result.success) {
        calculationCache.setCalculation(madhab, estate, heirs, result);
        
        // Add to history if enabled
        if (enableHistory) {
          historyCache.addToHistory(result);
        }
      }

      return result;
    },
    [enableHistory, onCacheHit, onCacheMiss]
  );

  /**
   * Clear all cached calculations
   */
  const clearCache = useCallback(() => {
    calculationCache.clearCalculations();
  }, []);

  /**
   * Get calculation history
   */
  const getHistory = useCallback(() => {
    return historyCache.getHistory();
  }, []);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    historyCache.clearHistory();
  }, []);

  return {
    calculate,
    clearCache,
    getHistory,
    clearHistory,
  };
}
