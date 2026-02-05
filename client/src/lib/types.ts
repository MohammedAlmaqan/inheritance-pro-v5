/**
 * أنواع البيانات - Data Types
 * مستخرجة من Merath_Cluade_Pro7.html v5.0
 */

import { Fraction } from './fraction';
import { Madhab, HeirKey } from './fiqh-database';

export interface HeirShare {
  key: HeirKey | string;
  name: string;
  type: string;
  fraction: Fraction;
  count: number;
  shares?: number;
  originalFraction?: Fraction;
  reason: string;
}

export interface BlockedHeir {
  heir: string;
  by: string;
  reason: string;
}

export interface SpecialCase {
  type: string;
  name: string;
  description: string;
}

export interface CalculationStep {
  title: string;
  description: string;
  details?: any;
}

export interface Warning {
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface CalculationResult {
  success: boolean;
  error?: string;
  madhab: Madhab;
  madhhabName: string;
  estate: EstateData;
  netEstate: number;
  asl: number;
  finalBase: number;
  awlApplied: boolean;
  raddApplied: boolean;
  bloodRelativesApplied: boolean;
  shares: HeirShare[];
  specialCases: SpecialCase[];
  blockedHeirs: BlockedHeir[];
  madhhabNotes: string[];
  warnings: Warning[];
  steps: CalculationStep[];
  confidence: number;
  confidenceLevel: string;
  calculationTime: number;
}

export interface EstateData {
  total: number;
  funeral: number;
  debts: number;
  will: number;
}

export interface HeirsData {
  husband: number;
  wife: number;
  father: number;
  mother: number;
  grandfather: number;
  grandmother_father: number;
  grandmother_mother: number;
  son: number;
  daughter: number;
  grandson: number;
  granddaughter: number;
  full_brother: number;
  full_sister: number;
  paternal_brother: number;
  paternal_sister: number;
  maternal_brother: number;
  maternal_sister: number;
  full_nephew: number;
  paternal_nephew: number;
  full_uncle: number;
  paternal_uncle: number;
  full_cousin: number;
  paternal_cousin: number;
  maternal_uncle: number;
  maternal_aunt: number;
  paternal_aunt: number;
  daughter_son: number;
  daughter_daughter: number;
  sister_children?: number;
}
