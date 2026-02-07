/**
 * Responsive Utilities Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BREAKPOINTS,
  createMediaQuery,
  getCurrentBreakpoint,
  isMobileDevice,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  getViewportDimensions,
  getDevicePixelRatio,
  supportsTouchScreen,
  getSafeAreaInsets,
  getResponsivePadding,
  getResponsiveFontSize,
  getResponsiveGridColumns,
  getOrientation,
  isLandscape,
  isPortrait,
  getSafeContentWidth,
  getSafeContentHeight,
  getResponsiveGap,
  shouldUseDrawerNavigation,
  shouldHideOnMobile,
  shouldHideOnDesktop,
  getMaxContainerWidth,
} from '@/lib/responsive';

describe('Responsive Utilities', () => {
  // Breakpoints Tests
  describe('BREAKPOINTS', () => {
    it('should have all standard Tailwind breakpoints', () => {
      expect(BREAKPOINTS.xs).toBe(0);
      expect(BREAKPOINTS.sm).toBe(640);
      expect(BREAKPOINTS.md).toBe(768);
      expect(BREAKPOINTS.lg).toBe(1024);
      expect(BREAKPOINTS.xl).toBe(1280);
      expect(BREAKPOINTS['2xl']).toBe(1536);
    });

    it('should have breakpoints in ascending order', () => {
      const values = Object.values(BREAKPOINTS);
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  // Media Query Tests
  describe('createMediaQuery', () => {
    it('should create min-width media query by default', () => {
      const query = createMediaQuery('md');
      expect(query).toBe(`@media (min-width: 768px)`);
    });

    it('should create max-width media query', () => {
      const query = createMediaQuery('md', 'max');
      expect(query).toBe(`@media (max-width: 767px)`);
    });

    it('should handle all breakpoints', () => {
      const breakpoints: Array<keyof typeof BREAKPOINTS> = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      
      breakpoints.forEach((breakpoint) => {
        const query = createMediaQuery(breakpoint);
        expect(query).toContain('@media');
        expect(query).toContain('min-width');
      });
    });
  });

  // Viewport Detection Tests
  describe('viewport detection', () => {
    beforeEach(() => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('should get current breakpoint', () => {
      (window as any).innerWidth = 1500;
      expect(getCurrentBreakpoint()).toBe('xl');
    });

    it('should detect mobile viewport', () => {
      (window as any).innerWidth = 500;
      expect(isMobileViewport()).toBe(true);
    });

    it('should detect tablet viewport', () => {
      (window as any).innerWidth = 900;
      expect(isTabletViewport()).toBe(true);
    });

    it('should detect desktop viewport', () => {
      (window as any).innerWidth = 1200;
      expect(isDesktopViewport()).toBe(true);
    });
  });

  // Device Detection Tests
  describe('device detection', () => {
    it('should detect mobile device based on user agent', () => {
      const result = isMobileDevice();
      expect(typeof result).toBe('boolean');
    });

    it('should get viewport dimensions', () => {
      const dims = getViewportDimensions();
      expect(dims.width).toBeGreaterThan(0);
      expect(dims.height).toBeGreaterThan(0);
    });

    it('should get device pixel ratio', () => {
      const ratio = getDevicePixelRatio();
      expect(ratio).toBeGreaterThanOrEqual(1);
    });

    it('should detect touch screen support', () => {
      const result = supportsTouchScreen();
      expect(typeof result).toBe('boolean');
    });
  });

  // Safe Area Tests
  describe('safe areas', () => {
    it('should get safe area insets', () => {
      const insets = getSafeAreaInsets();
      expect(insets.top).toBeGreaterThanOrEqual(0);
      expect(insets.right).toBeGreaterThanOrEqual(0);
      expect(insets.bottom).toBeGreaterThanOrEqual(0);
      expect(insets.left).toBeGreaterThanOrEqual(0);
    });

    it('should get safe content width', () => {
      const width = getSafeContentWidth();
      expect(width).toBeGreaterThanOrEqual(0);
    });

    it('should get safe content height', () => {
      const height = getSafeContentHeight();
      expect(height).toBeGreaterThanOrEqual(0);
    });
  });

  // Responsive Value Helpers Tests
  describe('responsive value helpers', () => {
    it('should get responsive padding', () => {
      const padding = getResponsivePadding(8, 16, 24);
      expect([8, 16, 24]).toContain(padding);
    });

    it('should get responsive font size', () => {
      const size = getResponsiveFontSize(14, 16, 18);
      expect([14, 16, 18]).toContain(size);
    });

    it('should get responsive grid columns', () => {
      const cols = getResponsiveGridColumns(1, 2, 3);
      expect([1, 2, 3]).toContain(cols);
    });

    it('should get responsive gap', () => {
      const gap = getResponsiveGap('4px', '8px');
      expect(['4px', '8px']).toContain(gap);
    });
  });

  // Orientation Tests
  describe('orientation detection', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('should detect landscape orientation', () => {
      expect(isLandscape()).toBe(true);
    });

    it('should detect portrait orientation', () => {
      (window as any).innerHeight = 1200;
      expect(isPortrait()).toBe(true);
    });

    it('should return correct orientation string', () => {
      const orientation = getOrientation();
      expect(['portrait', 'landscape']).toContain(orientation);
    });
  });

  // Navigation Tests
  describe('navigation helpers', () => {
    it('should determine when to use drawer navigation on mobile', () => {
      (window as any).innerWidth = 500;
      expect(shouldUseDrawerNavigation()).toBe(true);
    });

    it('should determine when to hide on mobile', () => {
      (window as any).innerWidth = 500;
      expect(shouldHideOnMobile()).toBe(true);
    });

    it('should determine when to hide on desktop', () => {
      (window as any).innerWidth = 1200;
      expect(shouldHideOnDesktop()).toBe(true);
    });
  });

  // Container Width Tests
  describe('container width', () => {
    it('should return correct max width for breakpoint', () => {
      (window as any).innerWidth = 500;
      const width = getMaxContainerWidth();
      expect([640, 768, 1024, 1200, 1400]).toContain(width);
    });

    it('should have larger width for larger breakpoints', () => {
      (window as any).innerWidth = 500;
      const mobileWidth = getMaxContainerWidth();

      (window as any).innerWidth = 1500;
      const desktopWidth = getMaxContainerWidth();

      expect(desktopWidth).toBeGreaterThanOrEqual(mobileWidth);
    });
  });
});
