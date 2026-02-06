/**
 * Inheritance Scenarios & Templates
 * Predefined common inheritance cases for quick-start
 */

import type { EstateData, HeirsData } from './types';
import { Madhab } from './fiqh-database';

export interface InheritanceScenario {
  id: string;
  name: string;
  description: string;
  madhab: Madhab;
  estate: EstateData;
  heirs: HeirsData;
  tags: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

/**
 * Predefined inheritance scenarios
 * Common real-world cases for quick setup
 */
export const INHERITANCE_SCENARIOS: InheritanceScenario[] = [
  {
    id: 'father-son',
    name: 'الأب والابن',
    description: 'حالة بسيطة: الأب متوفى لديه ابن واحد وتركة 100 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: {
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
    },
    tags: ['بسيط', 'أب', 'ابن'],
    complexity: 'simple',
  },
  {
    id: 'father-daughter',
    name: 'الأب والابنة',
    description: 'حالة بسيطة: الأب متوفى لديه ابنة واحدة وتركة 100 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 100000,
      funeral: 5000,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 0,
      son: 0,
      daughter: 1,
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
    },
    tags: ['بسيط', 'أب', 'ابنة'],
    complexity: 'simple',
  },
  {
    id: 'wife-children',
    name: 'الزوجة والأطفال',
    description: 'حالة معتدلة: زوجة مع ابن وابنة من تركة 200 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 200000,
      funeral: 10000,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 0,
      son: 1,
      daughter: 1,
      husband: 0,
      wife: 1,
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
    },
    tags: ['معتدل', 'زوجة', 'أطفال'],
    complexity: 'moderate',
  },
  {
    id: 'mother-father-son',
    name: 'الأب والأم والابن',
    description: 'حالة متوسطة: الأب والأم والابن من تركة 300 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 300000,
      funeral: 15000,
      debts: 0,
      will: 0,
    },
    heirs: {
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
    },
    tags: ['معتدل', 'والدين', 'ابن'],
    complexity: 'moderate',
  },
  {
    id: 'husband-wife',
    name: 'الزوج والزوجة',
    description: 'حالة بسيطة: زوج وزوجة من دون أطفال من تركة 150 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 150000,
      funeral: 7500,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 0,
      son: 0,
      daughter: 0,
      husband: 1,
      wife: 1,
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
    },
    tags: ['بسيط', 'زوج', 'زوجة'],
    complexity: 'simple',
  },
  {
    id: 'multiple-children',
    name: 'عدة أطفال',
    description: 'حالة معتدلة: ثلاثة أبناء وابنتان من تركة 500 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 500000,
      funeral: 25000,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 0,
      son: 3,
      daughter: 2,
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
    },
    tags: ['معتدل', 'أطفال متعددين'],
    complexity: 'moderate',
  },
  {
    id: 'complex-family',
    name: 'عائلة معقدة',
    description: 'حالة معقدة: والدان وأطفال وزوجة من تركة 1 مليون ريال',
    madhab: 'hanafi',
    estate: {
      total: 1000000,
      funeral: 50000,
      debts: 100000,
      will: 50000,
    },
    heirs: {
      father: 1,
      mother: 1,
      son: 2,
      daughter: 2,
      husband: 0,
      wife: 1,
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
    },
    tags: ['معقد', 'عائلة', 'ديون'],
    complexity: 'complex',
  },
  {
    id: 'brothers-only',
    name: 'الإخوة فقط',
    description: 'حالة متوسطة: ثلاثة إخوة شقيقين من تركة 200 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 200000,
      funeral: 10000,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 0,
      son: 0,
      daughter: 0,
      husband: 0,
      wife: 0,
      grandfather: 0,
      grandmother_father: 0,
      grandmother_mother: 0,
      grandson: 0,
      granddaughter: 0,
      full_brother: 3,
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
    },
    tags: ['معتدل', 'إخوة'],
    complexity: 'moderate',
  },
  {
    id: 'mother-only',
    name: 'الأم فقط',
    description: 'حالة بسيطة: الأم الوحيدة الوارثة من تركة 50 ألف ريال',
    madhab: 'hanafi',
    estate: {
      total: 50000,
      funeral: 2500,
      debts: 0,
      will: 0,
    },
    heirs: {
      father: 0,
      mother: 1,
      son: 0,
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
    },
    tags: ['بسيط', 'أم'],
    complexity: 'simple',
  },
];

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): InheritanceScenario | undefined {
  return INHERITANCE_SCENARIOS.find((s) => s.id === id);
}

/**
 * Get all scenarios for a specific madhab
 */
export function getScenariosByMadhab(madhab: Madhab): InheritanceScenario[] {
  return INHERITANCE_SCENARIOS.filter((s) => s.madhab === madhab);
}

/**
 * Get scenarios by complexity level
 */
export function getScenariosByComplexity(complexity: 'simple' | 'moderate' | 'complex'): InheritanceScenario[] {
  return INHERITANCE_SCENARIOS.filter((s) => s.complexity === complexity);
}

/**
 * Search scenarios by name or description
 */
export function searchScenarios(query: string): InheritanceScenario[] {
  const lowerQuery = query.toLowerCase();
  return INHERITANCE_SCENARIOS.filter(
    (s) =>
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all unique tags from scenarios
 */
export function getAllScenarioTags(): string[] {
  const tags = new Set<string>();
  INHERITANCE_SCENARIOS.forEach((s) => {
    s.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

/**
 * Apply a scenario to store state
 * Returns an object that can be spread into state
 */
export function applyScenario(scenario: InheritanceScenario) {
  return {
    madhab: scenario.madhab,
    estate: { ...scenario.estate },
    heirs: { ...scenario.heirs },
  };
}
