/**
 * useKeyboardNavigation Hook
 * Handle keyboard navigation for accessible components
 */

import { useEffect, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onTab?: (shiftKey: boolean) => void;
  enabled?: boolean;
  target?: HTMLElement | null;
}

/**
 * Hook for handling keyboard navigation
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = options.target || ref.current;
    if (!element || options.enabled === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          options.onArrowUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          options.onArrowDown?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          options.onArrowLeft?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          options.onArrowRight?.();
          break;
        case 'Enter':
          e.preventDefault();
          options.onEnter?.();
          break;
        case ' ':
          e.preventDefault();
          options.onSpace?.();
          break;
        case 'Escape':
          e.preventDefault();
          options.onEscape?.();
          break;
        case 'Tab':
          options.onTab?.(e.shiftKey);
          break;
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  return ref;
}

/**
 * Hook for managing focus within a list
 */
export function useFocusManagement(options: {
  enabled?: boolean;
  onFocusChange?: (index: number) => void;
  direction?: 'horizontal' | 'vertical';
}) {
  const ref = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element || options.enabled === false) return;

    const focusableElements = Array.from(
      element.querySelectorAll(
        'button:not([disabled]), a[href], [role="button"]:not([aria-disabled="true"])',
      ),
    );

    const handleKeyDown = (e: KeyboardEvent) => {
      const isVertical = options.direction !== 'horizontal';
      const isHorizontal = options.direction === 'horizontal';

      let shouldMove = false;
      let nextIndex = currentIndexRef.current;

      if ((isVertical || !isHorizontal) && e.key === 'ArrowDown') {
        shouldMove = true;
        nextIndex = (currentIndexRef.current + 1) % focusableElements.length;
      } else if ((isVertical || !isHorizontal) && e.key === 'ArrowUp') {
        shouldMove = true;
        nextIndex =
          (currentIndexRef.current - 1 + focusableElements.length) % focusableElements.length;
      } else if ((isHorizontal || !isVertical) && e.key === 'ArrowRight') {
        shouldMove = true;
        nextIndex = (currentIndexRef.current + 1) % focusableElements.length;
      } else if ((isHorizontal || !isVertical) && e.key === 'ArrowLeft') {
        shouldMove = true;
        nextIndex =
          (currentIndexRef.current - 1 + focusableElements.length) % focusableElements.length;
      }

      if (shouldMove && focusableElements.length > 0) {
        e.preventDefault();
        currentIndexRef.current = nextIndex;
        (focusableElements[nextIndex] as HTMLElement).focus();
        options.onFocusChange?.(nextIndex);
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [options]);

  return ref;
}

/**
 * Hook for handling escape key
 */
export function useEscapeKey(
  onEscape: () => void,
  options: {
    enabled?: boolean;
    target?: HTMLElement | null | Window;
  } = {},
) {
  useEffect(() => {
    if (options.enabled === false) return;

    const target = options.target || window;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    };

    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, options.enabled, options.target]);
}

/**
 * Hook for preventing body scroll (useful for modals)
 */
export function usePreventBodyScroll(shouldPrevent: boolean = true) {
  useEffect(() => {
    if (!shouldPrevent) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [shouldPrevent]);
}

/**
 * Hook for focus on mount (for modals/dialogs)
 */
export function useFocusOnMount(ref: React.RefObject<HTMLElement>, options: { enabled?: boolean } = {}) {
  useEffect(() => {
    if (options.enabled === false || !ref.current) return;

    ref.current.focus();
  }, [ref, options.enabled]);
}

/**
 * Hook for restoring focus (for modals/dialogs)
 */
export function useRestoreFocus(shouldRestore: boolean = true) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!shouldRestore) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    return () => {
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [shouldRestore]);
}

/**
 * Hook for managing tab order
 */
export function useTabOrder(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Ensure element is tabbable
    if (!element.getAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }
  }, [ref]);

  return ref;
}

/**
 * Hook for handling enter/space activation on custom elements
 */
export function useActivation(
  onActivate: () => void,
  options: { enabled?: boolean; ref?: React.RefObject<HTMLElement> } = {},
) {
  const defaultRef = useRef<HTMLElement>(null);
  const ref = options.ref || defaultRef;

  useEffect(() => {
    const element = ref.current;
    if (!element || options.enabled === false) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [onActivate, options.enabled, ref]);

  return ref;
}
