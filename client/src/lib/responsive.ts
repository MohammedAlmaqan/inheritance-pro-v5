/**
 * Responsive Mobile Design Utilities
 * Breakpoint management and responsive helpers for mobile-first design
 */

/**
 * Tailwind breakpoints in pixels
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Media query utility
 */
export function createMediaQuery(breakpoint: Breakpoint, operators: 'min' | 'max' = 'min'): string {
  const px = BREAKPOINTS[breakpoint];
  if (operators === 'max') {
    return `@media (max-width: ${px - 1}px)`;
  }
  return `@media (min-width: ${px}px)`;
}

/**
 * Get current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';

  const width = window.innerWidth;

  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

/**
 * Check if viewport is mobile-sized
 */
export function isMobileViewport(): boolean {
  const breakpoint = getCurrentBreakpoint();
  return BREAKPOINTS[breakpoint] < BREAKPOINTS.md;
}

/**
 * Check if viewport is tablet-sized
 */
export function isTabletViewport(): boolean {
  const breakpoint = getCurrentBreakpoint();
  return BREAKPOINTS[breakpoint] >= BREAKPOINTS.md && BREAKPOINTS[breakpoint] < BREAKPOINTS.lg;
}

/**
 * Check if viewport is desktop-sized
 */
export function isDesktopViewport(): boolean {
  const breakpoint = getCurrentBreakpoint();
  return BREAKPOINTS[breakpoint] >= BREAKPOINTS.lg;
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

/**
 * Get device pixel ratio (for high DPI screens)
 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  return window.devicePixelRatio || 1;
}

/**
 * Check if device supports touch
 */
export function supportsTouchScreen(): boolean {
  if (typeof window === 'undefined') return false;

  return (
    typeof navigator !== 'undefined' &&
    ('ontouchstart' in window ||
      (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0) ||
      (navigator as any).msMaxTouchPoints > 0)
  );
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);

  return {
    top: parseFloat(style.getPropertyValue('--safe-area-inset-top')) || 0,
    right: parseFloat(style.getPropertyValue('--safe-area-inset-right')) || 0,
    bottom: parseFloat(style.getPropertyValue('--safe-area-inset-bottom')) || 0,
    left: parseFloat(style.getPropertyValue('--safe-area-inset-left')) || 0,
  };
}

/**
 * Responsive padding helper
 */
export function getResponsivePadding(
  mobile: number,
  tablet: number,
  desktop: number,
): number {
  const breakpoint = getCurrentBreakpoint();

  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.lg) return desktop;
  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.md) return tablet;
  return mobile;
}

/**
 * Responsive font size helper
 */
export function getResponsiveFontSize(
  mobile: number,
  tablet: number,
  desktop: number,
): number {
  const breakpoint = getCurrentBreakpoint();

  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.lg) return desktop;
  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.md) return tablet;
  return mobile;
}

/**
 * Responsive grid columns helper
 */
export function getResponsiveGridColumns(
  mobile: number,
  tablet: number,
  desktop: number,
): number {
  const breakpoint = getCurrentBreakpoint();

  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.lg) return desktop;
  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.md) return tablet;
  return mobile;
}

/**
 * Get orientation (portrait or landscape)
 */
export function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait';

  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Check if in landscape mode
 */
export function isLandscape(): boolean {
  return getOrientation() === 'landscape';
}

/**
 * Check if in portrait mode
 */
export function isPortrait(): boolean {
  return getOrientation() === 'portrait';
}

/**
 * Get safe content area width (accounting for safe areas)
 */
export function getSafeContentWidth(): number {
  const { width } = getViewportDimensions();
  const { left, right } = getSafeAreaInsets();

  return Math.max(0, width - left - right);
}

/**
 * Get safe content area height (accounting for safe areas)
 */
export function getSafeContentHeight(): number {
  const { height } = getViewportDimensions();
  const { top, bottom } = getSafeAreaInsets();

  return Math.max(0, height - top - bottom);
}

/**
 * Calculate responsive gap/spacing
 */
export function getResponsiveGap(mobileGap: string, desktopGap: string): string {
  const breakpoint = getCurrentBreakpoint();

  if (BREAKPOINTS[breakpoint] >= BREAKPOINTS.md) return desktopGap;
  return mobileGap;
}

/**
 * Check if should show sidebar or use drawer on mobile
 */
export function shouldUseDrawerNavigation(): boolean {
  return isMobileViewport();
}

/**
 * Check if should hide element on mobile
 */
export function shouldHideOnMobile(): boolean {
  return isMobileViewport();
}

/**
 * Check if should hide element on desktop
 */
export function shouldHideOnDesktop(): boolean {
  return isDesktopViewport();
}

/**
 * Get maximum container width
 */
export function getMaxContainerWidth(): number {
  const breakpoint = getCurrentBreakpoint();

  switch (breakpoint) {
    case '2xl':
      return 1400;
    case 'xl':
      return 1200;
    case 'lg':
      return 1024;
    case 'md':
      return 768;
    default:
      return 640;
  }
}
