/**
 * useScenarios Hook
 * React hook for managing scenarios with state
 */

import { useState, useCallback, useEffect } from 'react';
import { scenarioManager, type Scenario } from '@/lib/scenarios-storage';
import type { EstateData, HeirsData } from '@/lib/types';
import type { Madhab } from '@/lib/fiqh-database';

export function useScenarios() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load scenarios on mount
  useEffect(() => {
    loadScenarios();
  }, []);

  // Apply search filter
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = scenarioManager.searchScenarios(searchQuery);
      setFilteredScenarios(filtered);
    } else {
      setFilteredScenarios(scenarios);
    }
  }, [searchQuery, scenarios]);

  /**
   * Load all scenarios
   */
  const loadScenarios = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      const all = scenarioManager.getAllScenarios();
      setScenarios(all);
      setFilteredScenarios(all);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new scenario
   */
  const createScenario = useCallback(
    (data: {
      name: string;
      description: string;
      estate: EstateData;
      heirs: HeirsData;
      madhab: Madhab;
      tags?: string[];
    }): Scenario | null => {
      try {
        const scenario = scenarioManager.createScenario({
          ...data,
          tags: data.tags || [],
        });

        if (scenario) {
          setScenarios((prev) => [scenario, ...prev]);
          return scenario;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create scenario');
      }
      return null;
    },
    []
  );

  /**
   * Get scenario by ID
   */
  const getScenario = useCallback((id: string): Scenario | null => {
    return scenarioManager.getScenario(id);
  }, []);

  /**
   * Update scenario
   */
  const updateScenario = useCallback(
    (id: string, updates: Partial<Scenario>): Scenario | null => {
      try {
        const updated = scenarioManager.updateScenario(id, updates);
        if (updated) {
          setScenarios((prev) =>
            prev.map((s) => (s.id === id ? updated : s))
          );
          return updated;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update scenario');
      }
      return null;
    },
    []
  );

  /**
   * Delete scenario
   */
  const deleteScenario = useCallback((id: string): boolean => {
    try {
      const success = scenarioManager.deleteScenario(id);
      if (success) {
        setScenarios((prev) => prev.filter((s) => s.id !== id));
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scenario');
    }
    return false;
  }, []);

  /**
   * Search scenarios
   */
  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Filter by madhab
   */
  const filterByMadhab = useCallback((madhab: Madhab) => {
    const filtered = scenarioManager.filterByMadhab(madhab);
    setFilteredScenarios(filtered);
  }, []);

  /**
   * Filter by estate range
   */
  const filterByEstateRange = useCallback((min: number, max: number) => {
    const filtered = scenarioManager.filterByEstateRange(min, max);
    setFilteredScenarios(filtered);
  }, []);

  /**
   * Toggle favorite
   */
  const toggleFavorite = useCallback((id: string): boolean => {
    try {
      const success = scenarioManager.toggleFavorite(id);
      if (success) {
        const scenario = scenarioManager.getScenario(id);
        if (scenario) {
          setScenarios((prev) =>
            prev.map((s) => (s.id === id ? scenario : s))
          );
        }
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
    return false;
  }, []);

  /**
   * Record scenario usage
   */
  const recordUsage = useCallback((id: string): boolean => {
    return scenarioManager.recordUsage(id);
  }, []);

  /**
   * Get favorites
   */
  const getFavorites = useCallback((): Scenario[] => {
    return scenarioManager.getFavorites();
  }, []);

  /**
   * Export scenarios
   */
  const exportScenarios = useCallback((ids?: string[]): string => {
    return scenarioManager.exportAsJSON(ids);
  }, []);

  /**
   * Import scenarios
   */
  const importScenarios = useCallback((json: string): number => {
    try {
      const data = JSON.parse(json);
      const count = scenarioManager.importScenarios(data);
      loadScenarios(); // Reload to update UI
      return count;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import scenarios');
      return 0;
    }
  }, [loadScenarios]);

  /**
   * Clear all scenarios
   */
  const clearAll = useCallback((): boolean => {
    try {
      const success = scenarioManager.clearAll();
      if (success) {
        setScenarios([]);
        setFilteredScenarios([]);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear scenarios');
      return false;
    }
  }, []);

  /**
   * Get storage statistics
   */
  const getStats = useCallback(
    () =>
      ({
        totalScenarios: scenarios.length,
        isFull: scenarioManager.isStorageFull(),
        stats: scenarioManager.getStats(),
      }),
    [scenarios.length]
  );

  return {
    // Data
    scenarios: filteredScenarios,
    allScenarios: scenarios,
    loading,
    error,
    searchQuery,

    // CRUD operations
    createScenario,
    getScenario,
    updateScenario,
    deleteScenario,

    // Search & filter
    search,
    filterByMadhab,
    filterByEstateRange,

    // Favorites
    toggleFavorite,
    getFavorites,

    // Utility
    recordUsage,
    exportScenarios,
    importScenarios,
    clearAll,
    getStats,

    // Refresh
    loadScenarios,
  };
}
