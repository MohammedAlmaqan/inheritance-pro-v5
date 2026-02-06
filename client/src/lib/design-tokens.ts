/**
 * Design Tokens - Centralized design system
 * Colors, spacing, typography, shadows for light and dark modes
 */

export const colors = {
  light: {
    // Primary colors
    primary: '#2563eb', // Blue
    primaryLight: '#3b82f6',
    primaryDark: '#1e40af',

    // Secondary colors
    secondary: '#7c3aed', // Purple
    secondaryLight: '#a78bfa',
    secondaryDark: '#5b21b6',

    // Semantic colors
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    info: '#0ea5e9', // Cyan

    // UI colors
    background: '#ffffff',
    foreground: '#1f2937', // Gray-800
    muted: '#6b7280', // Gray-500
    mutedForeground: '#9ca3af', // Gray-400
    border: '#e5e7eb', // Gray-200
    input: '#f3f4f6', // Gray-100

    // Card/Surface
    card: '#ffffff',
    cardForeground: '#1f2937',

    // Destructive
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Accent
    accent: '#f0ad4e', // Orange
    accentForeground: '#1f2937',
  },

  dark: {
    // Primary colors
    primary: '#3b82f6', // Brighter blue for dark mode
    primaryLight: '#60a5fa',
    primaryDark: '#1e40af',

    // Secondary colors
    secondary: '#a78bfa', // Lighter purple for dark mode
    secondaryLight: '#c4b5fd',
    secondaryDark: '#7c3aed',

    // Semantic colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',

    // UI colors
    background: '#0f172a', // Slate-900
    foreground: '#f1f5f9', // Slate-100
    muted: '#94a3b8', // Slate-400
    mutedForeground: '#64748b', // Slate-500
    border: '#1e293b', // Slate-800
    input: '#1e293b', // Slate-800

    // Card/Surface
    card: '#1e293b', // Slate-800
    cardForeground: '#f1f5f9',

    // Destructive
    destructive: '#ef4444',
    destructiveForeground: '#f8fafc',

    // Accent
    accent: '#f59e0b', // Orange
    accentForeground: '#0f172a',
  },
};

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '3.5rem', // 56px
};

export const typography = {
  // Headings
  h1: {
    fontSize: '2rem',
    fontWeight: '700',
    lineHeight: '2.5rem',
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: '700',
    lineHeight: '2rem',
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.75rem',
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: '600',
    lineHeight: '1.5rem',
  },

  // Body text
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.5rem',
  },
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.25rem',
  },
  bodyXSmall: {
    fontSize: '0.75rem',
    fontWeight: '400',
    lineHeight: '1rem',
  },

  // Labels & captions
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    lineHeight: '1.25rem',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: '500',
    lineHeight: '1rem',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  none: 'none',
};

export const borderRadius = {
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px', // Pill shape
};

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slowest: '500ms',
};

export const zIndex = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1100',
  fixed: '1200',
  modalBackdrop: '1300',
  modal: '1400',
  popover: '1500',
  tooltip: '1600',
};

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof colors.light;
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  transitions: typeof transitions;
  zIndex: typeof zIndex;
}

/**
 * Get theme object for specified mode
 */
export function getTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: mode === 'light' ? colors.light : colors.dark,
    spacing,
    typography,
    shadows,
    borderRadius,
    transitions,
    zIndex,
  };
}

/**
 * Merge theme colors with CSS variables
 */
export function getThemeCSSVariables(mode: ThemeMode): Record<string, string> {
  const themeColors = getTheme(mode).colors;

  return {
    '--color-primary': themeColors.primary,
    '--color-primary-light': themeColors.primaryLight,
    '--color-primary-dark': themeColors.primaryDark,
    '--color-secondary': themeColors.secondary,
    '--color-secondary-light': themeColors.secondaryLight,
    '--color-secondary-dark': themeColors.secondaryDark,
    '--color-success': themeColors.success,
    '--color-warning': themeColors.warning,
    '--color-error': themeColors.error,
    '--color-info': themeColors.info,
    '--color-background': themeColors.background,
    '--color-foreground': themeColors.foreground,
    '--color-muted': themeColors.muted,
    '--color-muted-foreground': themeColors.mutedForeground,
    '--color-border': themeColors.border,
    '--color-input': themeColors.input,
    '--color-card': themeColors.card,
    '--color-card-foreground': themeColors.cardForeground,
    '--color-destructive': themeColors.destructive,
    '--color-destructive-foreground': themeColors.destructiveForeground,
    '--color-accent': themeColors.accent,
    '--color-accent-foreground': themeColors.accentForeground,
  };
}
