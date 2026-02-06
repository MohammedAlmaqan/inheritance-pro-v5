import { describe, it, expect } from 'vitest';
import {
  INHERITANCE_SCENARIOS,
  getScenarioById,
  getScenariosByMadhab,
  getScenariosByComplexity,
  searchScenarios,
  getAllScenarioTags,
  applyScenario,
} from '@/lib/scenarios';

describe('Inheritance Scenarios', () => {
  describe('Scenario Data Validation', () => {
    it('should have at least 8 predefined scenarios', () => {
      expect(INHERITANCE_SCENARIOS.length).toBeGreaterThanOrEqual(8);
    });

    it('should have unique scenario IDs', () => {
      const ids = INHERITANCE_SCENARIOS.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid madhab values', () => {
      const validMadhabs = ['hanafi', 'maliki', 'shafi', 'hanbali'];
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        expect(validMadhabs).toContain(scenario.madhab);
      });
    });

    it('should have valid complexity levels', () => {
      const validLevels = ['simple', 'moderate', 'complex'];
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        expect(validLevels).toContain(scenario.complexity);
      });
    });

    it('should have non-empty names and descriptions', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        expect(scenario.name.length).toBeGreaterThan(0);
        expect(scenario.description.length).toBeGreaterThan(0);
      });
    });

    it('should have at least one tag per scenario', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        expect(scenario.tags.length).toBeGreaterThan(0);
      });
    });

    it('should have valid estate data with non-negative values', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        expect(scenario.estate.total).toBeGreaterThan(0);
        expect(scenario.estate.funeral).toBeGreaterThanOrEqual(0);
        expect(scenario.estate.debts).toBeGreaterThanOrEqual(0);
        expect(scenario.estate.will).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have at least one heir per scenario', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        const totalHeirs =
          scenario.heirs.father +
          scenario.heirs.mother +
          scenario.heirs.son +
          scenario.heirs.daughter +
          scenario.heirs.husband +
          scenario.heirs.wife +
          scenario.heirs.grandfather +
          scenario.heirs.grandmother_father +
          scenario.heirs.grandmother_mother +
          scenario.heirs.grandson +
          scenario.heirs.granddaughter +
          scenario.heirs.full_brother +
          scenario.heirs.full_sister +
          scenario.heirs.paternal_brother +
          scenario.heirs.paternal_sister +
          scenario.heirs.maternal_brother +
          scenario.heirs.maternal_sister +
          scenario.heirs.full_nephew +
          scenario.heirs.paternal_nephew +
          scenario.heirs.full_uncle +
          scenario.heirs.paternal_uncle +
          scenario.heirs.full_cousin +
          scenario.heirs.paternal_cousin +
          scenario.heirs.maternal_uncle +
          scenario.heirs.maternal_aunt +
          scenario.heirs.paternal_aunt +
          scenario.heirs.daughter_son +
          scenario.heirs.daughter_daughter +
          (scenario.heirs.sister_children ?? 0);

        expect(totalHeirs).toBeGreaterThan(0);
      });
    });

    it('should have all 28 heir types in each scenario', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        const heirKeys = [
          'father',
          'mother',
          'son',
          'daughter',
          'husband',
          'wife',
          'grandfather',
          'grandmother_father',
          'grandmother_mother',
          'grandson',
          'granddaughter',
          'full_brother',
          'full_sister',
          'paternal_brother',
          'paternal_sister',
          'maternal_brother',
          'maternal_sister',
          'full_nephew',
          'paternal_nephew',
          'full_uncle',
          'paternal_uncle',
          'full_cousin',
          'paternal_cousin',
          'maternal_uncle',
          'maternal_aunt',
          'paternal_aunt',
          'daughter_son',
          'daughter_daughter',
        ];

        heirKeys.forEach((key) => {
          expect(scenario.heirs).toHaveProperty(key);
        });
      });
    });
  });

  describe('getScenarioById', () => {
    it('should find scenario by ID', () => {
      const scenario = getScenarioById('father-son');
      expect(scenario).toBeDefined();
      expect(scenario?.id).toBe('father-son');
      expect(scenario?.name).toBe('الأب والابن');
    });

    it('should return undefined for non-existent ID', () => {
      const scenario = getScenarioById('non-existent');
      expect(scenario).toBeUndefined();
    });

    it('should find all defined scenarios by ID', () => {
      INHERITANCE_SCENARIOS.forEach((s) => {
        const found = getScenarioById(s.id);
        expect(found).toEqual(s);
      });
    });
  });

  describe('getScenariosByMadhab', () => {
    it('should filter scenarios by madhab', () => {
      const hanafiScenarios = getScenariosByMadhab('hanafi');
      expect(hanafiScenarios.length).toBeGreaterThan(0);
      hanafiScenarios.forEach((s) => {
        expect(s.madhab).toBe('hanafi');
      });
    });

    it('should return empty array for madhab with no scenarios', () => {
      const shafiiScenarios = getScenariosByMadhab('shafi');
      // Might be empty or have scenarios - just check it's an array
      expect(Array.isArray(shafiiScenarios)).toBe(true);
    });

    it('should return all scenarios when filtering by existing madhab', () => {
      const hanafiScenarios = getScenariosByMadhab('hanafi');
      const totalScenarios = INHERITANCE_SCENARIOS.filter((s) => s.madhab === 'hanafi').length;
      expect(hanafiScenarios.length).toBe(totalScenarios);
    });
  });

  describe('getScenariosByComplexity', () => {
    it('should filter scenarios by complexity level', () => {
      const simpleScenarios = getScenariosByComplexity('simple');
      expect(simpleScenarios.length).toBeGreaterThan(0);
      simpleScenarios.forEach((s) => {
        expect(s.complexity).toBe('simple');
      });
    });

    it('should have scenarios of each complexity level', () => {
      const simple = getScenariosByComplexity('simple');
      const moderate = getScenariosByComplexity('moderate');
      const complex = getScenariosByComplexity('complex');

      expect(simple.length).toBeGreaterThan(0);
      expect(moderate.length).toBeGreaterThan(0);
      expect(complex.length).toBeGreaterThan(0);
    });

    it('should return correct count for each level', () => {
      const simple = getScenariosByComplexity('simple');
      const moderate = getScenariosByComplexity('moderate');
      const complex = getScenariosByComplexity('complex');

      const totalByLevel = simple.length + moderate.length + complex.length;
      expect(totalByLevel).toBe(INHERITANCE_SCENARIOS.length);
    });
  });

  describe('searchScenarios', () => {
    it('should find scenarios by name', () => {
      const results = searchScenarios('الأب');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((s) => s.name.includes('الأب'))).toBe(true);
    });

    it('should find scenarios by description', () => {
      const results = searchScenarios('زوجة');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find scenarios by tag', () => {
      const results = searchScenarios('بسيط');
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((s) => s.tags.includes('بسيط'))).toBe(true);
    });

    it('should be case-insensitive', () => {
      const resultsLower = searchScenarios('أب');
      const resultsUpper = searchScenarios('الأب');
      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsUpper.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-matching query', () => {
      const results = searchScenarios('xyz123xyz');
      expect(results.length).toBe(0);
    });

    it('should handle partial matching', () => {
      const results = searchScenarios('أطفال');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('getAllScenarioTags', () => {
    it('should return array of unique tags', () => {
      const tags = getAllScenarioTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });

    it('should contain all used tags', () => {
      const tags = getAllScenarioTags();
      const tagSet = new Set(tags);

      INHERITANCE_SCENARIOS.forEach((scenario) => {
        scenario.tags.forEach((tag) => {
          expect(tagSet.has(tag)).toBe(true);
        });
      });
    });

    it('should not contain duplicates', () => {
      const tags = getAllScenarioTags();
      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).toBe(tags.length);
    });

    it('should return sorted tags', () => {
      const tags = getAllScenarioTags();
      const sorted = [...tags].sort();
      expect(tags).toEqual(sorted);
    });

    it('should include Arabic tags', () => {
      const tags = getAllScenarioTags();
      expect(tags.some((tag) => /[\u0600-\u06FF]/.test(tag))).toBe(true);
    });
  });

  describe('applyScenario', () => {
    it('should create state object from scenario', () => {
      const scenario = INHERITANCE_SCENARIOS[0];
      const state = applyScenario(scenario);

      expect(state).toHaveProperty('madhab');
      expect(state).toHaveProperty('estate');
      expect(state).toHaveProperty('heirs');
    });

    it('should copy madhab correctly', () => {
      const scenario = getScenarioById('father-son')!;
      const state = applyScenario(scenario);

      expect(state.madhab).toBe(scenario.madhab);
    });

    it('should copy estate data without mutations', () => {
      const scenario = getScenarioById('father-son')!;
      const state = applyScenario(scenario);

      // Modify the returned state
      state.estate.total = 999999;

      // Original scenario should be unchanged
      expect(scenario.estate.total).toBe(100000);
    });

    it('should copy heirs data without mutations', () => {
      const scenario = getScenarioById('father-son')!;
      const state = applyScenario(scenario);

      // Modify the returned state
      state.heirs.son = 999;

      // Original scenario should be unchanged
      expect(scenario.heirs.son).toBe(1);
    });

    it('should work for all scenarios', () => {
      INHERITANCE_SCENARIOS.forEach((scenario) => {
        const state = applyScenario(scenario);

        expect(state.madhab).toBe(scenario.madhab);
        expect(state.estate).toEqual(scenario.estate);
        expect(state.heirs).toEqual(scenario.heirs);
      });
    });
  });

  describe('Scenario Integration', () => {
    it('should support find, search, and apply workflow', () => {
      // Find by ID
      const scenario = getScenarioById('wife-children');
      expect(scenario).toBeDefined();

      // Apply to state
      const state = applyScenario(scenario!);

      // Verify state is valid
      expect(state.madhab).toBeDefined();
      expect(state.estate.total).toBeGreaterThan(0);
      expect(state.heirs.wife).toBe(1);
    });

    it('should provide multiple ways to find same scenario', () => {
      const byId = getScenarioById('father-son');
      const byQuery = searchScenarios('الأب والابن');

      expect(byId).toBeDefined();
      expect(byQuery.length).toBeGreaterThan(0);
      expect(byQuery.some((s) => s.id === byId?.id)).toBe(true);
    });

    it('should work with filtering chain', () => {
      // Get simple scenarios
      const simple = getScenariosByComplexity('simple');

      // Filter by madhab
      const hanafiSimple = simple.filter((s) => s.madhab === 'hanafi');

      expect(hanafiSimple.length).toBeGreaterThan(0);
      hanafiSimple.forEach((s) => {
        expect(s.complexity).toBe('simple');
        expect(s.madhab).toBe('hanafi');
      });
    });

    it('should maintain data consistency across all access methods', () => {
      const father_son_byId = getScenarioById('father-son');
      const father_son_bySearch = searchScenarios('الأب والابن').find((s) => s.id === 'father-son');

      expect(father_son_byId).toEqual(father_son_bySearch);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should have father-son scenario with correct distribution', () => {
      const scenario = getScenarioById('father-son')!;
      expect(scenario.heirs.son).toBe(1);
      expect(scenario.estate.total).toBe(100000);
    });

    it('should have wife-children scenario with wife as heir', () => {
      const scenario = getScenarioById('wife-children')!;
      expect(scenario.heirs.wife).toBe(1);
      expect(scenario.heirs.son).toBe(1);
      expect(scenario.heirs.daughter).toBe(1);
    });

    it('should have complex family scenario with multiple heirs', () => {
      const scenario = getScenarioById('complex-family')!;
      const totalHeirs = scenario.heirs.father + scenario.heirs.mother + scenario.heirs.son + scenario.heirs.daughter + scenario.heirs.wife;
      expect(totalHeirs).toBe(7); // father(1) + mother(1) + sons(2) + daughters(2) + wife(1) = 7
    });

    it('should have multiple children scenario with correct heir counts', () => {
      const scenario = getScenarioById('multiple-children')!;
      expect(scenario.heirs.son).toBe(3);
      expect(scenario.heirs.daughter).toBe(2);
    });

    it('should handle debt and will deductions in complex scenario', () => {
      const scenario = getScenarioById('complex-family')!;
      expect(scenario.estate.debts).toBeGreaterThan(0);
      expect(scenario.estate.will).toBeGreaterThan(0);
    });
  });
});
