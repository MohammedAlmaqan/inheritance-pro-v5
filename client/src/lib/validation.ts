/**
 * التحقق من صحة البيانات - Data Validation
 * Zod schemas for inheritance calculator inputs
 */

import { z } from 'zod';
import { HeirsData, EstateData } from './types';

/**
 * Estate validation schema
 * تحقق من صحة بيانات التركة
 */
export const EstateSchema = z.object({
  total: z
    .number()
    .positive('قيمة التركة يجب أن تكون موجبة')
    .finite('قيمة التركة يجب أن تكون رقم صحيح')
    .max(Number.MAX_SAFE_INTEGER, 'قيمة التركة كبيرة جداً'),
  
  funeral: z
    .number()
    .nonnegative('تكاليف الجنازة لا يمكن أن تكون سالبة')
    .finite('تكاليف الجنازة يجب أن تكون رقم صحيح')
    .default(0),
  
  debts: z
    .number()
    .nonnegative('الديون لا يمكن أن تكون سالبة')
    .finite('الديون يجب أن تكون رقم صحيح')
    .default(0),
  
  will: z
    .number()
    .nonnegative('الوصية لا يمكن أن تكون سالبة')
    .finite('الوصية يجب أن تكون رقم صحيح')
    .default(0),
}).refine(
  (data) => data.total > (data.funeral + data.debts + data.will),
  {
    message: 'صافي التركة يجب أن يكون موجباً بعد خصم التكاليف والديون والوصية',
    path: ['total'],
  }
);

export type Estate = z.infer<typeof EstateSchema>;

/**
 * Individual heir count validation
 * تحقق من صحة عدد الورثة
 */
const HeirCountSchema = z
  .number()
  .int('عدد الورثة يجب أن يكون رقم صحيح')
  .nonnegative('عدد الورثة لا يمكن أن يكون سالب')
  .max(10, 'لا يمكن أن يكون أكثر من 10 ورثة من نفس النوع');

/**
 * Heirs validation schema
 * تحقق من صحة بيانات الورثة
 */
export const HeirsSchema = z.object({
  husband: HeirCountSchema,
  wife: HeirCountSchema,
  father: HeirCountSchema,
  mother: HeirCountSchema,
  grandfather: HeirCountSchema,
  grandmother_father: HeirCountSchema,
  grandmother_mother: HeirCountSchema,
  son: HeirCountSchema,
  daughter: HeirCountSchema,
  grandson: HeirCountSchema,
  granddaughter: HeirCountSchema,
  full_brother: HeirCountSchema,
  full_sister: HeirCountSchema,
  paternal_brother: HeirCountSchema,
  paternal_sister: HeirCountSchema,
  maternal_brother: HeirCountSchema,
  maternal_sister: HeirCountSchema,
  full_nephew: HeirCountSchema,
  paternal_nephew: HeirCountSchema,
  full_uncle: HeirCountSchema,
  paternal_uncle: HeirCountSchema,
  full_cousin: HeirCountSchema,
  paternal_cousin: HeirCountSchema,
  maternal_uncle: HeirCountSchema,
  maternal_aunt: HeirCountSchema,
  paternal_aunt: HeirCountSchema,
  daughter_son: HeirCountSchema,
  daughter_daughter: HeirCountSchema,
  sister_children: HeirCountSchema.optional(),
}).refine(
  (data) => {
    // Must have at least one heir
    const totalHeirs = Object.values(data).reduce((sum, val) => sum + (val || 0), 0);
    return totalHeirs > 0;
  },
  {
    message: 'يجب أن يكون هناك وارث واحد على الأقل',
  }
);

export type Heirs = z.infer<typeof HeirsSchema>;

/**
 * Combined calculator input schema
 * تحقق من صحة جميع مدخلات الحساب
 */
export const CalculatorInputSchema = z.object({
  estate: EstateSchema,
  heirs: HeirsSchema,
  madhab: z.enum(['hanafi', 'maliki', 'shafii', 'hanbali']),
});

export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;

/**
 * Validation utility functions
 * دوال مساعدة للتحقق
 */

export function validateEstate(data: unknown) {
  const result = EstateSchema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  // result.error is guaranteed to be a ZodError when success is false
  const zodError = result.error!;
  return {
    success: false,
    errors: zodError.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}

export function validateHeirs(data: unknown) {
  const result = HeirsSchema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  // result.error is guaranteed to be a ZodError when success is false
  const zodError = result.error!;
  return {
    success: false,
    errors: zodError.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}

export function validateCalculatorInput(data: unknown) {
  const result = CalculatorInputSchema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }
  
  const zodError = result.error!;
  return {
    success: false,
    errors: zodError.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  };
}

/**
 * Type-safe validator with error handling
 * دالة التحقق الآمنة من حيث النوع
 */
export async function validateInputAsync(
  estate: unknown,
  heirs: unknown,
  madhab: unknown,
) {
  const estateResult = validateEstate(estate);
  const heirsResult = validateHeirs(heirs);

  if (!estateResult.success || !heirsResult.success) {
    const allErrors: Array<{ field: string; message: string }> = [
      ...(estateResult.success ? [] : (estateResult.errors || [])),
      ...(heirsResult.success ? [] : (heirsResult.errors || [])),
    ];

    return {
      success: false,
      errors: allErrors,
    };
  }

  return {
    success: true,
    data: {
      estate: estateResult.data,
      heirs: heirsResult.data,
      madhab: madhab as any,
    },
  };
}
