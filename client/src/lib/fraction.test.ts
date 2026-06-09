/**
 * Fraction Class Comprehensive Tests
 * Tests for precise fraction arithmetic used in Islamic inheritance calculations
 */

import { describe, it, expect } from 'vitest';
import { Fraction } from './fraction';

describe('Fraction Class - Initialization & Normalization', () => {
  it('should create fraction with numerator and denominator', () => {
    const f = new Fraction(1, 2);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  it('should create fraction with only numerator (default denominator = 1)', () => {
    const f = new Fraction(5);
    expect(f.num).toBe(5);
    expect(f.den).toBe(1);
  });

  it('should normalize fractions to lowest terms', () => {
    const f = new Fraction(2, 4);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  it('should normalize larger fractions', () => {
    const f = new Fraction(6, 9);
    expect(f.num).toBe(2);
    expect(f.den).toBe(3);
  });

  it('should handle negative numerator', () => {
    const f = new Fraction(-1, 2);
    expect(f.num).toBe(-1);
    expect(f.den).toBe(2);
  });

  it('should handle negative denominator (move sign to numerator)', () => {
    const f = new Fraction(1, -2);
    expect(f.num).toBe(-1);
    expect(f.den).toBe(2);
  });

  it('should handle zero numerator', () => {
    const f = new Fraction(0, 5);
    expect(f.num).toBe(0);
    expect(f.den).toBe(1);
  });

  it('should throw error for zero denominator', () => {
    expect(() => new Fraction(1, 0)).toThrow();
  });

  it('should throw error for non-numeric inputs', () => {
    expect(() => new Fraction('abc' as any, 2)).toThrow();
    expect(() => new Fraction(1, null as any)).toThrow();
  });

  it('should throw error for infinity', () => {
    expect(() => new Fraction(Infinity, 2)).toThrow();
    expect(() => new Fraction(1, Infinity)).toThrow();
  });

  it('should throw error for NaN', () => {
    expect(() => new Fraction(NaN, 2)).toThrow();
  });
});

describe('Fraction Class - Addition', () => {
  it('should add fractions with same denominator', () => {
    const f1 = new Fraction(1, 4);
    const f2 = new Fraction(1, 4);
    const result = f1.add(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(2);
  });

  it('should add fractions with different denominators', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    const result = f1.add(f2);
    expect(result.num).toBe(5);
    expect(result.den).toBe(6);
  });

  it('should add Islamic inheritance fractions (1/6 + 1/3)', () => {
    const f1 = new Fraction(1, 6);
    const f2 = new Fraction(1, 3);
    const result = f1.add(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(2);
  });

  it('should add (1/8 + 1/6 + 1/3)', () => {
    const f1 = new Fraction(1, 8);
    const f2 = new Fraction(1, 6);
    const f3 = new Fraction(1, 3);
    const result = f1.add(f2).add(f3);
    // 1/8 + 1/6 = 7/24, 7/24 + 1/3 = 7/24 + 8/24 = 15/24 = 5/8
    expect(result.num).toBe(5);
    expect(result.den).toBe(8);
  });

  it('should handle adding zero', () => {
    const f = new Fraction(1, 2);
    const zero = new Fraction(0);
    const result = f.add(zero);
    expect(result.num).toBe(1);
    expect(result.den).toBe(2);
  });

  it('should handle adding negative fractions', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(-1, 4);
    const result = f1.add(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(4);
  });
});

describe('Fraction Class - Subtraction', () => {
  it('should subtract fractions with same denominator', () => {
    const f1 = new Fraction(3, 4);
    const f2 = new Fraction(1, 4);
    const result = f1.subtract(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(2);
  });

  it('should subtract fractions with different denominators', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    const result = f1.subtract(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(6);
  });

  it('should handle subtracting to zero', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 2);
    const result = f1.subtract(f2);
    expect(result.num).toBe(0);
  });

  it('should handle subtracting resulting in negative', () => {
    const f1 = new Fraction(1, 4);
    const f2 = new Fraction(1, 2);
    const result = f1.subtract(f2);
    expect(result.num).toBe(-1);
    expect(result.den).toBe(4);
  });
});

describe('Fraction Class - Multiplication', () => {
  it('should multiply fractions', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    const result = f1.multiply(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(6);
  });

  it('should multiply by zero', () => {
    const f1 = new Fraction(1, 2);
    const zero = new Fraction(0);
    const result = f1.multiply(zero);
    expect(result.num).toBe(0);
  });

  it('should multiply by one', () => {
    const f = new Fraction(3, 5);
    const one = new Fraction(1);
    const result = f.multiply(one);
    expect(result.num).toBe(3);
    expect(result.den).toBe(5);
  });

  it('should multiply (3/4 * 2/3)', () => {
    const f1 = new Fraction(3, 4);
    const f2 = new Fraction(2, 3);
    const result = f1.multiply(f2);
    expect(result.num).toBe(1);
    expect(result.den).toBe(2);
  });

  it('should multiply (2/3 * 3/4 * 4/5)', () => {
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(3, 4);
    const f3 = new Fraction(4, 5);
    const result = f1.multiply(f2).multiply(f3);
    expect(result.num).toBe(2);
    expect(result.den).toBe(5);
  });
});

describe('Fraction Class - Division', () => {
  it('should divide fractions', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    const result = f1.divide(f2);
    expect(result.num).toBe(3);
    expect(result.den).toBe(2);
  });

  it('should divide (1/2 / 1/4) = 2', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 4);
    const result = f1.divide(f2);
    expect(result.num).toBe(2);
    expect(result.den).toBe(1);
  });

  it('should throw error dividing by zero', () => {
    const f1 = new Fraction(1, 2);
    const zero = new Fraction(0);
    expect(() => f1.divide(zero)).toThrow();
  });

  it('should divide (3/4 / 2/3)', () => {
    const f1 = new Fraction(3, 4);
    const f2 = new Fraction(2, 3);
    const result = f1.divide(f2);
    expect(result.num).toBe(9);
    expect(result.den).toBe(8);
  });
});

describe('Fraction Class - Conversion', () => {
  it('should convert to decimal', () => {
    const f = new Fraction(1, 2);
    expect(f.toDecimal()).toBeCloseTo(0.5, 10);
  });

  it('should convert 1/3 to decimal', () => {
    const f = new Fraction(1, 3);
    expect(f.toDecimal()).toBeCloseTo(0.3333333333, 9);
  });

  it('should convert 3/4 to decimal', () => {
    const f = new Fraction(3, 4);
    expect(f.toDecimal()).toBeCloseTo(0.75, 10);
  });

  it('should convert to string', () => {
    const f = new Fraction(1, 2);
    expect(f.toString()).toBe('1/2');
  });

  it('should convert 3/1 to string as integer', () => {
    const f = new Fraction(3, 1);
    expect(f.toString()).toBe('3');
  });

  it('should convert Islamic fractions to string', () => {
    expect(new Fraction(1, 6).toString()).toBe('1/6');
    expect(new Fraction(1, 8).toString()).toBe('1/8');
    expect(new Fraction(1, 4).toString()).toBe('1/4');
  });
});

describe('Fraction Class - Comparison', () => {
  it('should compare equal fractions', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(2, 4);
    expect(f1.equals(f2)).toBe(true);
  });

  it('should compare unequal fractions', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    expect(f1.equals(f2)).toBe(false);
  });

  it('should check if fraction is greater', () => {
    const f1 = new Fraction(2, 3);
    const f2 = new Fraction(1, 2);
    expect(f1.isGreaterThan(f2)).toBe(true);
  });

  it('should check if fraction is less', () => {
    const f1 = new Fraction(1, 3);
    const f2 = new Fraction(1, 2);
    expect(f1.isLessThan(f2)).toBe(true);
  });

  it('should check if fraction is greater or equal', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(2, 4);
    expect(f1.isGreaterThanOrEqual(f2)).toBe(true);
  });
});

describe('Fraction Class - Static Methods', () => {
  it('should calculate GCD correctly', () => {
    expect(Fraction.gcd(12, 8)).toBe(4);
    expect(Fraction.gcd(15, 10)).toBe(5);
    expect(Fraction.gcd(7, 3)).toBe(1);
  });

  it('should calculate LCM correctly', () => {
    expect(Fraction.lcm(4, 6)).toBe(12);
    expect(Fraction.lcm(3, 5)).toBe(15);
    expect(Fraction.lcm(12, 18)).toBe(36);
  });

  it('should calculate LCM of array', () => {
    expect(Fraction.lcmArray([2, 3, 4])).toBe(12);
    expect(Fraction.lcmArray([4, 6, 8])).toBe(24);
    expect(Fraction.lcmArray([3, 5, 7])).toBe(105);
  });

  it('should create fraction from decimal', () => {
    const f = Fraction.fromDecimal(0.5);
    expect(f.equals(new Fraction(1, 2))).toBe(true);
  });

  it('should create fraction from decimal (0.333...)', () => {
    const f = Fraction.fromDecimal(0.3333, 100);
    expect(f.num).toBe(1);
    expect(f.den).toBe(3);
  });

  it('should handle ZERO constant', () => {
    const zero = Fraction.ZERO;
    expect(zero.num).toBe(0);
    expect(zero.toDecimal()).toBe(0);
  });

  it('should handle ONE constant', () => {
    const one = Fraction.ONE;
    expect(one.num).toBe(1);
    expect(one.den).toBe(1);
    expect(one.toDecimal()).toBe(1);
  });
});

describe('Fraction Class - Islamic Inheritance Scenarios', () => {
  it('should calculate wife 1/8 share when children exist', () => {
    const share = new Fraction(1, 8);
    expect(share.toDecimal()).toBeCloseTo(0.125, 10);
  });

  it('should calculate mother 1/6 share', () => {
    const share = new Fraction(1, 6);
    expect(share.toDecimal()).toBeCloseTo(0.1666666667, 9);
  });

  it('should calculate father 1/6 share', () => {
    const share = new Fraction(1, 6);
    expect(share.toDecimal()).toBeCloseTo(0.1666666667, 9);
  });

  it('should handle complex scenario: wife 1/8 + daughters 2/3 + father 1/6', () => {
    const wife = new Fraction(1, 8);
    const daughters = new Fraction(2, 3);
    const father = new Fraction(1, 6);
    
    const total = wife.add(daughters).add(father);
    // 1/8 + 2/3 + 1/6 = 3/24 + 16/24 + 4/24 = 23/24 (less than 1, father gets remainder)
    expect(total.num).toBe(23);
    expect(total.den).toBe(24);
  });

  it('should handle awl case: sum exceeds 1', () => {
    // When heirs are mother 1/3 + wife 1/4 + father 1/4 (equal parents with wife)
    const mother = new Fraction(1, 3);
    const wife = new Fraction(1, 4);
    // Total would be 1/3 + 1/4 = 7/12 < 1
    const total = mother.add(wife);
    expect(total.num).toBe(7);
    expect(total.den).toBe(12);
  });

  it('should preserve precision in multi-heir calculation', () => {
    // 3 daughters share 2/3
    const daughters = new Fraction(2, 3);
    const perDaughter = daughters.divide(new Fraction(3));
    expect(perDaughter.num).toBe(2);
    expect(perDaughter.den).toBe(9);
  });
});

describe('Fraction Class - Edge Cases', () => {
  it('should handle very large numbers', () => {
    const f = new Fraction(1000000, 2000000);
    expect(f.num).toBe(1);
    expect(f.den).toBe(2);
  });

  it('should handle very small fractions', () => {
    const f = new Fraction(1, 1000000);
    expect(f.toDecimal()).toBeCloseTo(0.000001, 10);
  });

  it('should maintain immutability (operations don\'t modify original)', () => {
    const f1 = new Fraction(1, 2);
    const f2 = new Fraction(1, 3);
    const f3 = f1.add(f2);
    
    expect(f1.num).toBe(1);
    expect(f1.den).toBe(2);
    expect(f2.num).toBe(1);
    expect(f2.den).toBe(3);
    expect(f3.num).toBe(5);
    expect(f3.den).toBe(6);
  });

  it('should handle chained operations', () => {
    const result = new Fraction(1, 2)
      .add(new Fraction(1, 4))
      .multiply(new Fraction(2, 1))
      .subtract(new Fraction(1, 4));
    
    expect(result.num).toBe(1);
    expect(result.den).toBe(1);
  });
});
