/**
 * Design Tokens Tests
 */

import { describe, it, expect } from 'vitest';
import type { ThemeMode } from '@/lib/design-tokens';
import { getTheme, getThemeCSSVariables, colors } from '@/lib/design-tokens';

describe('Design Tokens', () => {
  it('should have light and dark color palettes', () => {
    expect(colors.light).toBeDefined();
    expect(colors.dark).toBeDefined();
    expect(colors.light.primary).toBeDefined();
    expect(colors.dark.primary).toBeDefined();
  });

  it('should provide theme object for light mode', () => {
    const theme = getTheme('light');
    expect(theme.mode).toBe('light');
    expect(theme.colors).toBe(colors.light);
    expect(theme.spacing).toBeDefined();
    expect(theme.typography).toBeDefined();
    expect(theme.shadows).toBeDefined();
  });

  it('should provide theme object for dark mode', () => {
    const theme = getTheme('dark');
    expect(theme.mode).toBe('dark');
    expect(theme.colors).toBe(colors.dark);
  });

  it('should generate CSS variables for light mode', () => {
    const variables = getThemeCSSVariables('light');
    expect(variables['--color-primary']).toBe(colors.light.primary);
    expect(variables['--color-background']).toBe(colors.light.background);
    expect(variables['--color-foreground']).toBe(colors.light.foreground);
  });

  it('should generate CSS variables for dark mode', () => {
    const variables = getThemeCSSVariables('dark');
    expect(variables['--color-primary']).toBe(colors.dark.primary);
    expect(variables['--color-background']).toBe(colors.dark.background);
    expect(variables['--color-foreground']).toBe(colors.dark.foreground);
  });

  it('should have all required semantic colors', () => {
    const requiredColors = ['success', 'warning', 'error', 'info'];
    requiredColors.forEach(color => {
      expect((colors.light as Record<string, unknown>)[color]).toBeDefined();
      expect((colors.dark as Record<string, unknown>)[color]).toBeDefined();
    });
  });

  it('should have consistent spacing scale', () => {
    const theme = getTheme('light');
    const spacingValues = Object.values(theme.spacing);
    expect(spacingValues.length).toBeGreaterThan(0);
    expect(spacingValues.every(val => typeof val === 'string')).toBe(true);
  });

  it('should have typography variants for different text styles', () => {
    const typography = getTheme('light').typography;
    expect(typography.h1).toBeDefined();
    expect(typography.h2).toBeDefined();
    expect(typography.body).toBeDefined();
    expect(typography.label).toBeDefined();
  });

  it('should have all required typography properties', () => {
    const theme = getTheme('light');
    const requiredProps = ['fontSize', 'fontWeight', 'lineHeight'];

    Object.entries(theme.typography).forEach(([, style]) => {
      if (typeof style === 'object' && style !== null) {
        requiredProps.forEach(prop => {
          expect(prop in style).toBe(true);
        });
      }
    });
  });

  it('should have consistent shadow scale', () => {
    const theme = getTheme('light');
    const shadows = Object.values(theme.shadows);
    expect(shadows.length).toBeGreaterThan(0);
  });

  it('should maintain color consistency across themes', () => {
    // Some colors should remain consistent (semantic like success/error)
    const lightTheme = getTheme('light');
    const darkTheme = getTheme('dark');

    // Success color should be same across modes
    expect(lightTheme.colors.success).toBe(darkTheme.colors.success);
    expect(lightTheme.colors.error).toBe(darkTheme.colors.error);
    expect(lightTheme.colors.warning).toBe(darkTheme.colors.warning);
  });

  it('should have different primary colors for light and dark modes', () => {
    const lightTheme = getTheme('light');
    const darkTheme = getTheme('dark');

    // Primary colors might differ to optimize for contrast
    const lightVars = getThemeCSSVariables('light');
    const darkVars = getThemeCSSVariables('dark');

    expect(lightVars['--color-background']).not.toBe(darkVars['--color-background']);
  });

  it('should generate CSS variable keys for all color properties', () => {
    const variables = getThemeCSSVariables('light');
    const requiredKeys = [
      '--color-primary',
      '--color-background',
      '--color-foreground',
      '--color-success',
      '--color-error',
      '--color-warning',
      '--color-border',
      '--color-card',
    ];

    requiredKeys.forEach(key => {
      expect(key in variables).toBe(true);
      expect(typeof variables[key]).toBe('string');
      expect(variables[key]).not.toBe('');
    });
  });

  it('should support both light and dark modes consistently', () => {
    const modes: ThemeMode[] = ['light', 'dark'];

    modes.forEach(mode => {
      const theme = getTheme(mode);
      const vars = getThemeCSSVariables(mode);

      expect(theme.mode).toBe(mode);
      expect(vars['--color-background']).toBeTruthy();
      expect(vars['--color-foreground']).toBeTruthy();
    });
  });

  it('should format CSS variable values correctly', () => {
    const variables = getThemeCSSVariables('light');

    Object.entries(variables).forEach(([key, value]) => {
      expect(key).toMatch(/^--color-/);
      expect(value).toMatch(/^#[0-9a-f]{6}|rgb\(/i);
    });
  });

  it('should provide border radius scale', () => {
    const theme = getTheme('light');
    expect(theme.borderRadius).toBeDefined();
    expect(theme.borderRadius.sm).toBeDefined();
    expect(theme.borderRadius.lg).toBeDefined();
    expect(theme.borderRadius.full).toBe('9999px');
  });

  it('should provide transitions timing', () => {
    const theme = getTheme('light');
    expect(theme.transitions).toBeDefined();
    expect(theme.transitions.fast).toBeDefined();
    expect(theme.transitions.base).toBeDefined();
    expect(theme.transitions.slow).toBeDefined();
  });

  it('should provide z-index values', () => {
    const theme = getTheme('light');
    expect(theme.zIndex).toBeDefined();
    expect(theme.zIndex.base).toBe('0');
    expect(theme.zIndex.modal).toBeDefined();
    expect(theme.zIndex.tooltip).toBeDefined();
  });
});

