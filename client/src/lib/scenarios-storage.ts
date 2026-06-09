/**
 * Scenario Storage & Management
 * CRUD operations for saving and managing calculation scenarios
 */

import type { EstateData, HeirsData } from '@/lib/types';
import type { Madhab } from '@/lib/fiqh-database';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  estate: EstateData;
  heirs: HeirsData;
  madhab: Madhab;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited: boolean;
  useCount: number; // Track how many times scenario was used
}

interface ScenarioIndex {
  scenarios: string[]; // Array of scenario IDs
  lastModified: number;
}

const SCENARIO_STORAGE_KEY = 'inheritance-pro-scenarios';
const SCENARIO_INDEX_KEY = 'inheritance-pro-scenario-index';
const MAX_SCENARIOS = 100; // Limit to prevent localStorage overflow

/**
 * Generate unique scenario ID
 */
function generateId(): string {
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Validate scenario data
 */
function validateScenario(scenario: Partial<Scenario>): boolean {
  return !!(
    scenario.name &&
    scenario.name.trim().length > 0 &&
    scenario.estate &&
    scenario.heirs &&
    scenario.madhab
  );
}

/**
 * Scenario Manager Class
 * Handles all CRUD operations for scenarios
 */
export class ScenarioManager {
  private static instance: ScenarioManager;
  private enabled: boolean = typeof localStorage !== 'undefined';

  private constructor() {}

  static getInstance(): ScenarioManager {
    if (!ScenarioManager.instance) {
      ScenarioManager.instance = new ScenarioManager();
    }
    return ScenarioManager.instance;
  }

  /**
   * Create a new scenario
   */
  createScenario(data: Omit<Scenario, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>): Scenario | null {
    if (!this.enabled || !validateScenario(data)) {
      return null;
    }

    try {
      const scenario: Scenario = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        useCount: 0,
        favorited: false,
      };

      const key = `${SCENARIO_STORAGE_KEY}-${scenario.id}`;
      localStorage.setItem(key, JSON.stringify(scenario));
      this.addToIndex(scenario.id);

      return scenario;
    } catch (error) {
      console.warn('Scenario creation error:', error);
      return null;
    }
  }

  /**
   * Get scenario by ID
   */
  getScenario(id: string): Scenario | null {
    if (!this.enabled) return null;

    try {
      const key = `${SCENARIO_STORAGE_KEY}-${id}`;
      const data = localStorage.getItem(key);
      if (!data) return null;

      const scenario = JSON.parse(data) as Scenario;
      // Convert date strings back to Date objects
      scenario.createdAt = new Date(scenario.createdAt);
      scenario.updatedAt = new Date(scenario.updatedAt);
      return scenario;
    } catch (error) {
      console.warn('Scenario retrieval error:', error);
      return null;
    }
  }

  /**
   * Get all scenarios
   */
  getAllScenarios(): Scenario[] {
    if (!this.enabled) return [];

    try {
      const index = this.getIndex();
      const scenarios: Scenario[] = [];

      index.scenarios.forEach((id) => {
        const scenario = this.getScenario(id);
        if (scenario) {
          scenarios.push(scenario);
        }
      });

      // Sort by updated date (newest first)
      return scenarios.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      console.warn('Scenario retrieval error:', error);
      return [];
    }
  }

  /**
   * Update scenario
   */
  updateScenario(id: string, updates: Partial<Scenario>): Scenario | null {
    if (!this.enabled) return null;

    try {
      const scenario = this.getScenario(id);
      if (!scenario) return null;

      const updated: Scenario = {
        ...scenario,
        ...updates,
        id: scenario.id, // Don't allow ID change
        createdAt: scenario.createdAt, // Don't allow creation date change
        updatedAt: new Date(),
      };

      if (!validateScenario(updated)) {
        return null;
      }

      const key = `${SCENARIO_STORAGE_KEY}-${id}`;
      localStorage.setItem(key, JSON.stringify(updated));

      return updated;
    } catch (error) {
      console.warn('Scenario update error:', error);
      return null;
    }
  }

  /**
   * Delete scenario
   */
  deleteScenario(id: string): boolean {
    if (!this.enabled) return false;

    try {
      const key = `${SCENARIO_STORAGE_KEY}-${id}`;
      localStorage.removeItem(key);
      this.removeFromIndex(id);
      return true;
    } catch (error) {
      console.warn('Scenario deletion error:', error);
      return false;
    }
  }

  /**
   * Search scenarios
   */
  searchScenarios(query: string): Scenario[] {
    const searchQuery = query.toLowerCase().trim();
    if (!searchQuery) return this.getAllScenarios();

    return this.getAllScenarios().filter((scenario) => {
      return (
        scenario.name.toLowerCase().includes(searchQuery) ||
        scenario.description.toLowerCase().includes(searchQuery) ||
        scenario.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
      );
    });
  }

  /**
   * Filter scenarios by madhab
   */
  filterByMadhab(madhab: Madhab): Scenario[] {
    return this.getAllScenarios().filter((scenario) => scenario.madhab === madhab);
  }

  /**
   * Filter scenarios by estate value range
   */
  filterByEstateRange(min: number, max: number): Scenario[] {
    return this.getAllScenarios().filter((scenario) => {
      const value = scenario.estate.value;
      return value >= min && value <= max;
    });
  }

  /**
   * Get favorite scenarios
   */
  getFavorites(): Scenario[] {
    return this.getAllScenarios().filter((scenario) => scenario.favorited);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): boolean {
    const scenario = this.getScenario(id);
    if (!scenario) return false;

    const updated = this.updateScenario(id, {
      favorited: !scenario.favorited,
    });

    return !!updated;
  }

  /**
   * Increment use count
   */
  recordUsage(id: string): boolean {
    const scenario = this.getScenario(id);
    if (!scenario) return false;

    return !!this.updateScenario(id, {
      useCount: scenario.useCount + 1,
    });
  }

  /**
   * Export scenarios (for backup)
   */
  exportScenarios(ids?: string[]): Scenario[] {
    const scenarios = ids
      ? ids.map((id) => this.getScenario(id)).filter(Boolean) as Scenario[]
      : this.getAllScenarios();

    return scenarios;
  }

  /**
   * Export scenarios as JSON string
   */
  exportAsJSON(ids?: string[]): string {
    const scenarios = this.exportScenarios(ids);
    return JSON.stringify(scenarios, null, 2);
  }

  /**
   * Import scenarios
   */
  importScenarios(data: Scenario[]): number {
    if (!this.enabled) return 0;

    let count = 0;
    data.forEach((scenario) => {
      // Create new IDs to avoid conflicts
      const newScenario = this.createScenario({
        name: scenario.name,
        description: scenario.description,
        estate: scenario.estate,
        heirs: scenario.heirs,
        madhab: scenario.madhab,
        tags: scenario.tags,
        favorited: scenario.favorited,
      });

      if (newScenario) count++;
    });

    return count;
  }

  /**
   * Clear all scenarios
   */
  clearAll(): boolean {
    if (!this.enabled) return false;

    try {
      const scenarios = this.getAllScenarios();
      scenarios.forEach((scenario) => {
        this.deleteScenario(scenario.id);
      });
      localStorage.removeItem(SCENARIO_INDEX_KEY);
      return true;
    } catch (error) {
      console.warn('Clear scenarios error:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): {
    totalScenarios: number;
    totalFavorites: number;
    mostUsed: Scenario | null;
    createdToday: number;
    storageSize: number;
  } {
    const scenarios = this.getAllScenarios();
    const today = new Date().toDateString();

    return {
      totalScenarios: scenarios.length,
      totalFavorites: scenarios.filter((s) => s.favorited).length,
      mostUsed: scenarios.reduce((max, s) => (s.useCount > (max?.useCount || 0) ? s : max), null),
      createdToday: scenarios.filter((s) => s.createdAt.toDateString() === today).length,
      storageSize: this.calculateStorageSize(),
    };
  }

  /**
   * Check if storage is full
   */
  isStorageFull(): boolean {
    return this.getAllScenarios().length >= MAX_SCENARIOS;
  }

  /**
   * Private methods
   */

  private getIndex(): ScenarioIndex {
    try {
      const index = localStorage.getItem(SCENARIO_INDEX_KEY);
      if (index) {
        return JSON.parse(index);
      }
    } catch (error) {
      console.warn('Index read error:', error);
    }
    return { scenarios: [], lastModified: Date.now() };
  }

  private saveIndex(index: ScenarioIndex): void {
    try {
      localStorage.setItem(SCENARIO_INDEX_KEY, JSON.stringify(index));
    } catch (error) {
      console.warn('Index save error:', error);
    }
  }

  private addToIndex(id: string): void {
    const index = this.getIndex();
    if (!index.scenarios.includes(id)) {
      index.scenarios.push(id);
      index.lastModified = Date.now();
      this.saveIndex(index);
    }
  }

  private removeFromIndex(id: string): void {
    const index = this.getIndex();
    index.scenarios = index.scenarios.filter((sid) => sid !== id);
    index.lastModified = Date.now();
    this.saveIndex(index);
  }

  private calculateStorageSize(): number {
    if (!this.enabled) return 0;

    let size = 0;
    try {
      const index = localStorage.getItem(SCENARIO_INDEX_KEY);
      if (index) size += index.length;

      this.getAllScenarios().forEach((scenario) => {
        const key = `${SCENARIO_STORAGE_KEY}-${scenario.id}`;
        const data = localStorage.getItem(key);
        if (data) size += data.length;
      });
    } catch (error) {
      console.warn('Storage size calculation error:', error);
    }

    return Math.round(size / 1024); // Return in KB
  }
}

/**
 * Export singleton instance
 */
export const scenarioManager = ScenarioManager.getInstance();
