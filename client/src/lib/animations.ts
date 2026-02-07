/**
 * Animation Utilities
 * Smooth transitions and animations respecting accessibility preferences
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Get animation duration based on motion preference
 * Returns 0ms if reduced motion is preferred, otherwise returns specified duration
 */
export function getAnimationDuration(durationMs: number, instantIfReduced: boolean = true): number {
  if (prefersReducedMotion() && instantIfReduced) {
    return 0;
  }
  return prefersReducedMotion() ? durationMs * 0.2 : durationMs;
}

/**
 * CSS class names for common animations
 * All animations respect prefers-reduced-motion
 */
export const animationClasses = {
  /* Fade animations */
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  
  /* Slide animations */
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  slideOutToTop: 'animate-out slide-out-to-top duration-300',
  
  /* Scale animations */
  scaleIn: 'animate-in zoom-in duration-200 scale-95',
  scaleOut: 'animate-out zoom-out duration-200',
  
  /* Pulse/bounce animations */
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  
  /* Smooth transition utility */
  smoothTransition: 'transition-all duration-300 ease-in-out',
  smoothTransitionFast: 'transition-all duration-150 ease-in-out',
  smoothTransitionSlow: 'transition-all duration-500 ease-in-out',
};

/**
 * Tailwind CSS animation configuration
 * Add to tailwind.config.ts extend.animation
 */
export const tailwindAnimationConfig = {
  // Entrance animations
  'in': 'fadeInScale 0.3s ease-out forwards',
  'in-slow': 'fadeInScale 0.5s ease-out forwards',
  'in-fast': 'fadeInScale 0.15s ease-out forwards',
  
  // Exit animations
  'out': 'fadeOutScale 0.2s ease-in forwards',
  'out-slow': 'fadeOutScale 0.4s ease-in forwards',
  
  // Bounce animations
  'bounce-sm': 'bounce 1s infinite',
  'bounce-md': 'bounce 1.2s infinite',
  
  // Pulse animations
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

/**
 * Keyframes for custom animations
 * Add to tailwind.config.ts extend.keyframes
 */
export const keyframes = {
  fadeInScale: {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
  fadeOutScale: {
    '0%': { opacity: '1', transform: 'scale(1)' },
    '100%': { opacity: '0', transform: 'scale(0.95)' },
  },
  slideInUp: {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  slideOutDown: {
    '0%': { opacity: '1', transform: 'translateY(0)' },
    '100%': { opacity: '0', transform: 'translateY(10px)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' },
  },
};

/**
 * Spring animation values
 * For physics-based animations
 */
export const springConfig = {
  default: { tension: 280, friction: 60, mass: 1 },
  gentle: { tension: 180, friction: 26, mass: 1 },
  bouncy: { tension: 300, friction: 10, mass: 1 },
  stiff: { tension: 210, friction: 20, mass: 1.2 },
  slow: { tension: 280, friction: 100, mass: 1 },
};

/**
 * Easing functions for animations
 */
export const easing = {
  easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
  easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
  easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
};

/**
 * Create animation class based on motion preference
 */
export function createAnimationClass(
  animation: string,
  respectMotionPreference: boolean = true,
): string {
  if (respectMotionPreference && prefersReducedMotion()) {
    return 'transition-opacity duration-0';
  }
  return animation;
}

/**
 * Delay class for staggered animations
 */
export const delayClasses = {
  delay75: 'delay-75',
  delay100: 'delay-100',
  delay150: 'delay-150',
  delay200: 'delay-200',
  delay300: 'delay-300',
  delay500: 'delay-500',
  delay700: 'delay-700',
  delay1000: 'delay-1000',
};

/**
 * Stagger animation helper
 * Returns appropriate delay class for index
 */
export function getStaggerDelay(index: number, baseDelay: number = 50): string {
  const delayMs = index * baseDelay;
  
  if (delayMs <= 75) return 'delay-75';
  if (delayMs <= 100) return 'delay-100';
  if (delayMs <= 150) return 'delay-150';
  if (delayMs <= 200) return 'delay-200';
  if (delayMs <= 300) return 'delay-300';
  if (delayMs <= 500) return 'delay-500';
  if (delayMs <= 700) return 'delay-700';
  return 'delay-1000';
}

/**
 * Smooth scroll animation settings
 */
export const scrollConfig = {
  smooth: {
    behavior: 'smooth' as const,
  },
  instant: {
    behavior: 'auto' as const,
  },
};

/**
 * Get scroll behavior based on motion preference
 */
export function getScrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/**
 * Touch feedback animations
 */
export const touchFeedback = {
  active: 'active:scale-95 active:opacity-80 transition-transform duration-75',
  hover: 'hover:opacity-90 transition-opacity duration-200',
  focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200',
};

/**
 * Loading skeleton animation
 */
export const skeletonAnimation = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700';

/**
 * Success animation (confetti effect foundation)
 */
export const successAnimation = {
  icon: 'animate-bounce text-green-500',
  text: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
};
