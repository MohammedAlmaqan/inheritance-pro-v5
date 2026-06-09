/**
 * Caching Strategy for Inheritance Pro
 * Implements localStorage-based caching for:
 * - Calculation results (with TTL)
 * - Fiqh database (static, cached indefinitely)
 * - User preferences
 */

import type { CalculationResult, EstateData, HeirsData } from './types';
import type { Madhab } from './fiqh-database';

const CACHE_VERSION = 'v1';
const CALCULATION_CACHE_KEY = `inheritance-pro-${CACHE_VERSION}-calculations`;
const FIQH_CACHE_KEY = `inheritance-pro-${CACHE_VERSION}-fiqh`;
const PREFERENCES_CACHE_KEY = `inheritance-pro-${CACHE_VERSION}-preferences`;
const HISTORY_CACHE_KEY = `inheritance-pro-${CACHE_VERSION}-history`;

// Cache TTL in milliseconds (24 hours for calculations, unlimited for static data)
const CALCULATION_TTL = 24 * 60 * 60 * 1000;
const STATIC_DATA_TTL = Infinity;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheIndex {
  calculationHashes: string[];
  lastCleanup: number;
}

/**
 * Generate a hash for cache key based on calculation input
 * Used to quickly identify cached results
 */
function generateCalculationHash(
  madhab: Madhab,
  estate: EstateData,
  heirs: HeirsData
): string {
  const input = JSON.stringify({ madhab, estate, heirs });
  // Simple hash function - for production consider using a crypto library
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Cache Manager for Inheritance Calculations
 * Reduces redundant calculations and improves performance
 */
export class CalculationCache {
  private static instance: CalculationCache;

  private constructor(private enabled: boolean = typeof localStorage !== 'undefined') {}

  static getInstance(): CalculationCache {
    if (!CalculationCache.instance) {
      CalculationCache.instance = new CalculationCache();
    }
    return CalculationCache.instance;
  }

  /**
   * Get cached calculation result
   * @returns Cached result or null if not found/expired
   */
  getCalculation(
    madhab: Madhab,
    estate: EstateData,
    heirs: HeirsData
  ): CalculationResult | null {
    if (!this.enabled) return null;

    try {
      const hash = generateCalculationHash(madhab, estate, heirs);
      const cacheKey = `${CALCULATION_CACHE_KEY}-${hash}`;
      const cached = localStorage.getItem(cacheKey);

      if (!cached) return null;

      const entry: CacheEntry<CalculationResult> = JSON.parse(cached);
      const isExpired = Date.now() - entry.timestamp > entry.ttl;

      if (isExpired) {
        localStorage.removeItem(cacheKey);
        this.removeFromIndex(hash);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  /**
   * Store calculation result in cache
   */
  setCalculation(
    madhab: Madhab,
    estate: EstateData,
    heirs: HeirsData,
    result: CalculationResult
  ): void {
    if (!this.enabled) return;

    try {
      const hash = generateCalculationHash(madhab, estate, heirs);
      const cacheKey = `${CALCULATION_CACHE_KEY}-${hash}`;
      const entry: CacheEntry<CalculationResult> = {
        data: result,
        timestamp: Date.now(),
        ttl: CALCULATION_TTL,
      };

      localStorage.setItem(cacheKey, JSON.stringify(entry));
      this.addToIndex(hash);
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  /**
   * Clear all cached calculations (but keep static data and preferences)
   */
  clearCalculations(): void {
    if (!this.enabled) return;

    try {
      const index = this.getIndex();
      index.calculationHashes.forEach((hash) => {
        const key = `${CALCULATION_CACHE_KEY}-${hash}`;
        localStorage.removeItem(key);
      });
      index.calculationHashes = [];
      this.saveIndex(index);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): void {
    if (!this.enabled) return;

    try {
      const index = this.getIndex();
      const now = Date.now();

      // Cleanup if last cleanup was more than 1 hour ago
      if (now - index.lastCleanup < 60 * 60 * 1000) return;

      index.calculationHashes.forEach((hash) => {
        const key = `${CALCULATION_CACHE_KEY}-${hash}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          const entry: CacheEntry<CalculationResult> = JSON.parse(cached);
          if (now - entry.timestamp > entry.ttl) {
            localStorage.removeItem(key);
            index.calculationHashes = index.calculationHashes.filter(h => h !== hash);
          }
        }
      });

      index.lastCleanup = now;
      this.saveIndex(index);
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }

  private getIndex(): CacheIndex {
    try {
      const index = localStorage.getItem(`${CALCULATION_CACHE_KEY}-index`);
      if (index) {
        return JSON.parse(index);
      }
    } catch (error) {
      console.warn('Index read error:', error);
    }
    return { calculationHashes: [], lastCleanup: Date.now() };
  }

  private saveIndex(index: CacheIndex): void {
    try {
      localStorage.setItem(`${CALCULATION_CACHE_KEY}-index`, JSON.stringify(index));
    } catch (error) {
      console.warn('Index write error:', error);
    }
  }

  private addToIndex(hash: string): void {
    const index = this.getIndex();
    if (!index.calculationHashes.includes(hash)) {
      index.calculationHashes.push(hash);
      this.saveIndex(index);
    }
  }

  private removeFromIndex(hash: string): void {
    const index = this.getIndex();
    index.calculationHashes = index.calculationHashes.filter(h => h !== hash);
    this.saveIndex(index);
  }
}

/**
 * Static Data Cache for Fiqh Database and other static data
 * Never expires, used for offline access
 */
export class StaticDataCache {
  private static instance: StaticDataCache;

  private constructor(private enabled: boolean = typeof localStorage !== 'undefined') {}

  static getInstance(): StaticDataCache {
    if (!StaticDataCache.instance) {
      StaticDataCache.instance = new StaticDataCache();
    }
    return StaticDataCache.instance;
  }

  /**
   * Get cached static data
   */
  get<T>(key: string): T | null {
    if (!this.enabled) return null;

    try {
      const cached = localStorage.getItem(`${FIQH_CACHE_KEY}-${key}`);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      return entry.data;
    } catch (error) {
      console.warn(`Static cache read error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set static data in cache (never expires)
   */
  set<T>(key: string, data: T): void {
    if (!this.enabled) return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: STATIC_DATA_TTL,
      };
      localStorage.setItem(`${FIQH_CACHE_KEY}-${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn(`Static cache write error for ${key}:`, error);
    }
  }

  /**
   * Check if static data exists in cache
   */
  has(key: string): boolean {
    if (!this.enabled) return false;
    try {
      return localStorage.getItem(`${FIQH_CACHE_KEY}-${key}`) !== null;
    } catch {
      return false;
    }
  }
}

/**
 * User Preferences Cache
 * Stores user settings like preferred madhab, theme, etc.
 */
export class PreferencesCache {
  private static instance: PreferencesCache;

  private constructor(private enabled: boolean = typeof localStorage !== 'undefined') {}

  static getInstance(): PreferencesCache {
    if (!PreferencesCache.instance) {
      PreferencesCache.instance = new PreferencesCache();
    }
    return PreferencesCache.instance;
  }

  /**
   * Get user preference
   */
  getPreference<T>(key: string, defaultValue?: T): T | undefined {
    if (!this.enabled) return defaultValue;

    try {
      const value = localStorage.getItem(`${PREFERENCES_CACHE_KEY}-${key}`);
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      console.warn(`Preferences read error for ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Set user preference
   */
  setPreference<T>(key: string, value: T): void {
    if (!this.enabled) return;

    try {
      localStorage.setItem(`${PREFERENCES_CACHE_KEY}-${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn(`Preferences write error for ${key}:`, error);
    }
  }
}

/**
 * Calculation History Cache
 * Stores last N calculations for user reference
 */
export class HistoryCache {
  private static instance: HistoryCache;
  private static readonly MAX_HISTORY_ITEMS = 20;

  private constructor(private enabled: boolean = typeof localStorage !== 'undefined') {}

  static getInstance(): HistoryCache {
    if (!HistoryCache.instance) {
      HistoryCache.instance = new HistoryCache();
    }
    return HistoryCache.instance;
  }

  /**
   * Get all history items
   */
  getHistory(): CalculationResult[] {
    if (!this.enabled) return [];

    try {
      const history = localStorage.getItem(HISTORY_CACHE_KEY);
      if (!history) return [];
      return JSON.parse(history);
    } catch (error) {
      console.warn('History read error:', error);
      return [];
    }
  }

  /**
   * Add calculation to history
   */
  addToHistory(result: CalculationResult): void {
    if (!this.enabled) return;

    try {
      const history = this.getHistory();
      history.unshift({ ...result, calculationTime: Date.now() });

      // Keep only last MAX_HISTORY_ITEMS
      if (history.length > HistoryCache.MAX_HISTORY_ITEMS) {
        history.pop();
      }

      localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('History write error:', error);
    }
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    if (!this.enabled) return;

    try {
      localStorage.removeItem(HISTORY_CACHE_KEY);
    } catch (error) {
      console.warn('History clear error:', error);
    }
  }
}

/**
 * Initialize caching system
 * Call this once on app startup
 */
export function initializeCache(): void {
  // Perform initial cleanup of expired entries
  CalculationCache.getInstance().cleanup();
}

/**
 * Export cache managers as singleton instances
 */
export const calculationCache = CalculationCache.getInstance();
export const staticDataCache = StaticDataCache.getInstance();
export const preferencesCache = PreferencesCache.getInstance();
export const historyCache = HistoryCache.getInstance();
