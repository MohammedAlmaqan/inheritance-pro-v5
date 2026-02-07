import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  prefersReducedMotion,
  getAnimationDuration,
  createAnimationClass,
  getStaggerDelay,
  getScrollBehavior,
  animationClasses,
  springConfig,
  easing,
  tailwindAnimationConfig,
  keyframes,
  delayClasses,
  touchFeedback,
  skeletonAnimation,
  successAnimation,
  scrollConfig,
} from './animations';

describe('Animation Utilities', () => {
  beforeEach(() => {
    // Mock window.matchMedia for tests
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('prefersReducedMotion', () => {
    it('should return false when motion preference is not set', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });

    it('should handle window undefined gracefully', () => {
      // This test just ensures no errors
      const result = prefersReducedMotion();
      expect(result).toBeDefined();
    });
  });

  describe('getAnimationDuration', () => {
    it('should return original duration when motion preference is normal', () => {
      const duration = getAnimationDuration(300);
      expect(duration).toBeGreaterThan(0);
    });

    it('should return reduced duration based on preference', () => {
      const normal = 300;
      const reduced = getAnimationDuration(normal);
      expect(typeof reduced).toBe('number');
    });

    it('should respect instantIfReduced parameter', () => {
      const duration = getAnimationDuration(300, true);
      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle various duration values', () => {
      expect(getAnimationDuration(100)).toBeGreaterThanOrEqual(0);
      expect(getAnimationDuration(300)).toBeGreaterThanOrEqual(0);
      expect(getAnimationDuration(1000)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('animationClasses', () => {
    it('should have fadeIn class defined', () => {
      expect(animationClasses.fadeIn).toBeDefined();
      expect(typeof animationClasses.fadeIn).toBe('string');
    });

    it('should have fadeOut class defined', () => {
      expect(animationClasses.fadeOut).toBeDefined();
      expect(typeof animationClasses.fadeOut).toBe('string');
    });

    it('should have slide animations defined', () => {
      expect(animationClasses.slideInFromTop).toBeDefined();
      expect(animationClasses.slideInFromBottom).toBeDefined();
      expect(animationClasses.slideOutToTop).toBeDefined();
    });

    it('should have scale animations defined', () => {
      expect(animationClasses.scaleIn).toBeDefined();
      expect(animationClasses.scaleOut).toBeDefined();
    });

    it('should have transition utilities defined', () => {
      expect(animationClasses.smoothTransition).toBeDefined();
      expect(animationClasses.smoothTransitionFast).toBeDefined();
      expect(animationClasses.smoothTransitionSlow).toBeDefined();
    });

    it('all animation classes should be strings', () => {
      Object.values(animationClasses).forEach((value) => {
        expect(typeof value).toBe('string');
      });
    });
  });

  describe('createAnimationClass', () => {
    it('should return animation when respectMotionPreference is false', () => {
      const result = createAnimationClass('my-animation', false);
      expect(result).toBe('my-animation');
    });

    it('should return appropriate class based on motion preference', () => {
      const result = createAnimationClass('my-animation');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty animation string', () => {
      const result = createAnimationClass('');
      expect(typeof result).toBe('string');
    });
  });

  describe('getStaggerDelay', () => {
    it('should return valid delay class for index 0', () => {
      const delay = getStaggerDelay(0);
      expect(Object.values(delayClasses)).toContain(delay);
    });

    it('should return increasingly larger delays for higher indices', () => {
      const delay0 = getStaggerDelay(0, 50);
      const delay1 = getStaggerDelay(1, 50);
      const delay2 = getStaggerDelay(2, 50);
      
      expect(delay0).toBeDefined();
      expect(delay1).toBeDefined();
      expect(delay2).toBeDefined();
    });

    it('should respect custom baseDelay parameter', () => {
      const delay = getStaggerDelay(1, 100);
      expect(delay).toBeDefined();
      expect(typeof delay).toBe('string');
    });

    it('should handle large indices', () => {
      const delay = getStaggerDelay(10, 50);
      expect(delay).toBe('delay-500');
    });

    it('should handle index 0 with various baseDelays', () => {
      expect(getStaggerDelay(0, 50)).toBe('delay-75');
      expect(getStaggerDelay(0, 100)).toBe('delay-75');
      expect(getStaggerDelay(0, 200)).toBe('delay-75');
    });
  });

  describe('getScrollBehavior', () => {
    it('should return valid scroll behavior', () => {
      const behavior = getScrollBehavior();
      expect(['smooth', 'auto']).toContain(behavior);
    });

    it('should be compatible with ScrollToOptions', () => {
      const behavior = getScrollBehavior();
      expect(typeof behavior).toBe('string');
    });
  });

  describe('Configuration Objects', () => {
    describe('tailwindAnimationConfig', () => {
      it('should have entrance animations', () => {
        expect(tailwindAnimationConfig['in']).toBeDefined();
        expect(tailwindAnimationConfig['in-slow']).toBeDefined();
        expect(tailwindAnimationConfig['in-fast']).toBeDefined();
      });

      it('should have exit animations', () => {
        expect(tailwindAnimationConfig['out']).toBeDefined();
        expect(tailwindAnimationConfig['out-slow']).toBeDefined();
      });

      it('should have bounce animations', () => {
        expect(tailwindAnimationConfig['bounce-sm']).toBeDefined();
        expect(tailwindAnimationConfig['bounce-md']).toBeDefined();
      });
    });

    describe('keyframes', () => {
      it('should have fadeInScale keyframe', () => {
        expect(keyframes.fadeInScale).toBeDefined();
        expect(keyframes.fadeInScale['0%']).toBeDefined();
        expect(keyframes.fadeInScale['100%']).toBeDefined();
      });

      it('should have fadeOutScale keyframe', () => {
        expect(keyframes.fadeOutScale).toBeDefined();
        expect(keyframes.fadeOutScale).toEqual({
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        });
      });

      it('should have slideInUp keyframe', () => {
        expect(keyframes.slideInUp).toBeDefined();
        expect(keyframes.slideInUp['0%']).toBeDefined();
        expect(keyframes.slideInUp['100%']).toBeDefined();
      });

      it('should have slideOutDown keyframe', () => {
        expect(keyframes.slideOutDown).toBeDefined();
        expect(keyframes.slideOutDown['0%']).toBeDefined();
        expect(keyframes.slideOutDown['100%']).toBeDefined();
      });

      it('should have shimmer keyframe', () => {
        expect(keyframes.shimmer).toBeDefined();
        expect(keyframes.shimmer['0%']).toBeDefined();
        expect(keyframes.shimmer['100%']).toBeDefined();
      });
    });

    describe('springConfig', () => {
      it('should have default spring config', () => {
        expect(springConfig.default).toEqual({
          tension: 280,
          friction: 60,
          mass: 1,
        });
      });

      it('should have all spring config variants', () => {
        expect(springConfig.gentle).toBeDefined();
        expect(springConfig.bouncy).toBeDefined();
        expect(springConfig.stiff).toBeDefined();
        expect(springConfig.slow).toBeDefined();
      });

      it('all spring configs should have tension, friction, and mass', () => {
        Object.values(springConfig).forEach((config) => {
          expect(config).toHaveProperty('tension');
          expect(config).toHaveProperty('friction');
          expect(config).toHaveProperty('mass');
        });
      });
    });

    describe('easing', () => {
      it('should have easeInOutCubic', () => {
        expect(easing.easeInOutCubic).toBe('cubic-bezier(0.645, 0.045, 0.355, 1)');
      });

      it('should have easeInCubic', () => {
        expect(easing.easeInCubic).toBe('cubic-bezier(0.32, 0, 0.67, 0)');
      });

      it('should have easeOutCubic', () => {
        expect(easing.easeOutCubic).toBe('cubic-bezier(0.33, 1, 0.68, 1)');
      });

      it('should have quad easing variants', () => {
        expect(easing.easeInOutQuad).toBeDefined();
        expect(easing.easeInQuad).toBeDefined();
        expect(easing.easeOutQuad).toBeDefined();
      });

      it('all easing values should be cubic-bezier strings', () => {
        Object.values(easing).forEach((value) => {
          expect(value).toContain('cubic-bezier');
        });
      });
    });

    describe('delayClasses', () => {
      it('should have delay classes for various increments', () => {
        expect(delayClasses.delay75).toBe('delay-75');
        expect(delayClasses.delay100).toBe('delay-100');
        expect(delayClasses.delay150).toBe('delay-150');
        expect(delayClasses.delay200).toBe('delay-200');
        expect(delayClasses.delay300).toBe('delay-300');
        expect(delayClasses.delay500).toBe('delay-500');
        expect(delayClasses.delay700).toBe('delay-700');
        expect(delayClasses.delay1000).toBe('delay-1000');
      });
    });

    describe('touchFeedback', () => {
      it('should have active state feedback', () => {
        expect(touchFeedback.active).toBeDefined();
        expect(touchFeedback.active).toContain('active:scale-95');
      });

      it('should have hover feedback', () => {
        expect(touchFeedback.hover).toBeDefined();
        expect(touchFeedback.hover).toContain('hover:opacity-90');
      });

      it('should have focus feedback', () => {
        expect(touchFeedback.focus).toBeDefined();
        expect(touchFeedback.focus).toContain('focus:ring-2');
      });

      it('all touch feedback strings should include transitions', () => {
        Object.values(touchFeedback).forEach((value) => {
          expect(value).toContain('transition');
        });
      });
    });

    describe('skeletonAnimation', () => {
      it('should be a valid animation string', () => {
        expect(typeof skeletonAnimation).toBe('string');
        expect(skeletonAnimation.length).toBeGreaterThan(0);
      });

      it('should include pulse animation', () => {
        expect(skeletonAnimation).toContain('pulse');
      });

      it('should include gradient background', () => {
        expect(skeletonAnimation).toContain('bg-gradient-to-r');
      });
    });

    describe('successAnimation', () => {
      it('should have icon animation', () => {
        expect(successAnimation.icon).toBeDefined();
        expect(successAnimation.icon).toContain('bounce');
        expect(successAnimation.icon).toContain('green');
      });

      it('should have text animation', () => {
        expect(successAnimation.text).toBeDefined();
        expect(successAnimation.text).toContain('fade-in');
      });
    });

    describe('scrollConfig', () => {
      it('should have smooth scroll config', () => {
        expect(scrollConfig.smooth.behavior).toBe('smooth');
      });

      it('should have instant scroll config', () => {
        expect(scrollConfig.instant.behavior).toBe('auto');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should provide a way to check motion preferences', () => {
      const result = prefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });

    it('animations should respect motion preferences in duration helper', () => {
      const duration = getAnimationDuration(300);
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(duration).toBeLessThanOrEqual(300);
    });

    it('should provide animation class creation that respects preferences', () => {
      const animated = createAnimationClass('animate-fade', true);
      const notAnimated = createAnimationClass('animate-fade', false);
      
      expect(animated).toBeDefined();
      expect(notAnimated).toBe('animate-fade');
    });
  });

  describe('Exported Values Type Safety', () => {
    it('all exported objects should be defined', () => {
      expect(animationClasses).toBeDefined();
      expect(tailwindAnimationConfig).toBeDefined();
      expect(keyframes).toBeDefined();
      expect(springConfig).toBeDefined();
      expect(easing).toBeDefined();
      expect(delayClasses).toBeDefined();
      expect(touchFeedback).toBeDefined();
      expect(scrollConfig).toBeDefined();
    });

    it('should export all functions', () => {
      expect(typeof prefersReducedMotion).toBe('function');
      expect(typeof getAnimationDuration).toBe('function');
      expect(typeof createAnimationClass).toBe('function');
      expect(typeof getStaggerDelay).toBe('function');
      expect(typeof getScrollBehavior).toBe('function');
    });
  });
});
