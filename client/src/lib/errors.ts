/**
 * Custom Error Classes & Handling
 * Inheritance Pro v5.0
 */

export class InheritanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'error' | 'warning' | 'info' = 'error',
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'InheritanceError';
  }
}

// Specific error types
export class ValidationError extends InheritanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 'error', context);
    this.name = 'ValidationError';
  }
}

export class CalculationError extends InheritanceError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CALCULATION_ERROR', 'error', context);
    this.name = 'CalculationError';
  }
}

export class FiqhError extends InheritanceError {
  constructor(message: string, madhab: string, context?: Record<string, any>) {
    super(message, 'FIQH_ERROR', 'error', { madhab, ...context });
    this.name = 'FiqhError';
  }
}

export class InputError extends InheritanceError {
  constructor(message: string, field: string, context?: Record<string, any>) {
    super(message, 'INPUT_ERROR', 'warning', { field, ...context });
    this.name = 'InputError';
  }
}

// Error handler
export const handleError = (error: unknown): InheritanceError => {
  if (error instanceof InheritanceError) {
    return error;
  }
  if (error instanceof Error) {
    return new InheritanceError(
      error.message,
      'UNKNOWN_ERROR',
      'error',
      { originalError: error.name }
    );
  }
  return new InheritanceError(
    'Unknown error occurred',
    'UNKNOWN_ERROR',
    'error'
  );
};

// Error messages in Arabic
export const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  CALCULATION_ERROR: 'خطأ في عملية الحساب',
  FIQH_ERROR: 'خطأ في القاعدة الفقهية',
  INPUT_ERROR: 'خطأ في المدخلات',
  UNKNOWN_ERROR: 'حدث خطأ غير متوقع',
};
