/**
 * Unit tests for validation schemas
 * اختبارات التحقق من صحة البيانات
 */

import { describe, it, expect } from 'vitest';
import {
  EstateSchema,
  HeirsSchema,
  validateEstate,
  validateHeirs,
  validateCalculatorInput,
} from './validation';

describe('EstateSchema Validation', () => {
  it('should validate correct estate data', () => {
    const validEstate = {
      total: 100000,
      funeral: 5000,
      debts: 10000,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(validEstate);
    expect(result.success).toBe(true);
  });

  it('should reject negative total', () => {
    const invalidEstate = {
      total: -100000,
      funeral: 0,
      debts: 0,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(invalidEstate);
    expect(result.success).toBe(false);
  });

  it('should reject when costs exceed total', () => {
    const invalidEstate = {
      total: 10000,
      funeral: 5000,
      debts: 6000,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(invalidEstate);
    expect(result.success).toBe(false);
  });

  it('should reject negative funeral costs', () => {
    const invalidEstate = {
      total: 100000,
      funeral: -5000,
      debts: 0,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(invalidEstate);
    expect(result.success).toBe(false);
  });

  it('should reject negative debts', () => {
    const invalidEstate = {
      total: 100000,
      funeral: 0,
      debts: -10000,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(invalidEstate);
    expect(result.success).toBe(false);
  });

  it('should reject negative will', () => {
    const invalidEstate = {
      total: 100000,
      funeral: 0,
      debts: 0,
      will: -5000,
    };
    
    const result = EstateSchema.safeParse(invalidEstate);
    expect(result.success).toBe(false);
  });

  it('should allow zero for optional fields', () => {
    const validEstate = {
      total: 100000,
      funeral: 0,
      debts: 0,
      will: 0,
    };
    
    const result = EstateSchema.safeParse(validEstate);
    expect(result.success).toBe(true);
  });

  it('should work with validateEstate helper', () => {
    const validEstate = {
      total: 100000,
      funeral: 0,
      debts: 0,
      will: 0,
    };
    
    const result = validateEstate(validEstate);
    expect(result.success).toBe(true);
  });

  it('should return structured error messages', () => {
    const invalidEstate = {
      total: -100,
      funeral: 0,
      debts: 0,
      will: 0,
    };
    
    const result = validateEstate(invalidEstate);
    expect(result.success).toBe(false);
    // Check error structure
    if (!result.success) {
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });
});

describe('HeirsSchema Validation', () => {
  it('should validate valid heirs data', () => {
    const validHeirs = {
      husband: 0,
      wife: 0,
      father: 1,
      mother: 1,
      grandfather: 0,
      grandmother_father: 0,
      grandmother_mother: 0,
      son: 0,
      daughter: 1,
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
    
    const result = HeirsSchema.safeParse(validHeirs);
    expect(result.success).toBe(true);
  });

  it('should require at least one heir', () => {
    const noHeirs = {
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
    
    const result = HeirsSchema.safeParse(noHeirs);
    expect(result.success).toBe(false);
  });

  it('should accept father and son', () => {
    const validHeirs = {
      husband: 0,
      wife: 0,
      father: 1,
      mother: 0,
      grandfather: 0,
      grandmother_father: 0,
      grandmother_mother: 0,
      son: 1,
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
    
    const result = HeirsSchema.safeParse(validHeirs);
    expect(result.success).toBe(true);
  });

  it('should reject negative heir counts', () => {
    const invalidHeirs = {
      husband: 0,
      wife: 0,
      father: -1,
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
    
    const result = HeirsSchema.safeParse(invalidHeirs);
    expect(result.success).toBe(false);
  });

  it('should reject heir count over 10', () => {
    const invalidHeirs = {
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
      daughter_daughter: 11,
    };
    
    const result = HeirsSchema.safeParse(invalidHeirs);
    expect(result.success).toBe(false);
  });

  it('should work with validateHeirs helper', () => {
    const validHeirs = {
      husband: 0,
      wife: 1,
      father: 1,
      mother: 1,
      grandfather: 0,
      grandmother_father: 0,
      grandmother_mother: 0,
      son: 0,
      daughter: 2,
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
    
    const result = validateHeirs(validHeirs);
    expect(result.success).toBe(true);
  });
});
