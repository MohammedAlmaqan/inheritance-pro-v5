/**
 * Accessibility Utilities - WCAG AA Compliance
 * Provides utilities for keyboard navigation, ARIA attributes, and semantic HTML
 */

/**
 * Generate ARIA attributes for screen readers
 */
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  'aria-checked'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-readonly'?: boolean;
  'aria-hidden'?: boolean;
  'aria-level'?: number;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-labelledby'?: string;
  role?: string;
  tabIndex?: number;
}

/**
 * Create accessible button attributes
 */
export function createButtonAriaAttributes(options: {
  label?: string;
  pressed?: boolean;
  disabled?: boolean;
  ariaDescribedBy?: string;
}): AriaAttributes {
  return {
    'aria-label': options.label,
    'aria-pressed': options.pressed,
    'aria-disabled': options.disabled,
    'aria-describedby': options.ariaDescribedBy,
    role: 'button',
    tabIndex: options.disabled ? -1 : 0,
  };
}

/**
 * Create accessible form input attributes
 */
export function createInputAriaAttributes(options: {
  label?: string;
  required?: boolean;
  invalid?: boolean;
  describedBy?: string;
  readonly?: boolean;
}): AriaAttributes {
  return {
    'aria-label': options.label,
    'aria-required': options.required,
    'aria-invalid': options.invalid,
    'aria-describedby': options.describedBy,
    'aria-readonly': options.readonly,
    tabIndex: 0,
  };
}

/**
 * Create accessible dialog/modal attributes
 */
export function createDialogAriaAttributes(options: {
  labelledBy?: string;
  describedBy?: string;
  modal?: boolean;
}): AriaAttributes {
  return {
    role: options.modal ? 'alertdialog' : 'dialog',
    'aria-labelledby': options.labelledBy,
    'aria-describedby': options.describedBy,
    'aria-hidden': false,
  };
}

/**
 * Create accessible list attributes
 */
export function createListAriaAttributes(options: {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}): AriaAttributes {
  return {
    role: 'list',
    'aria-label': options.label,
    'aria-orientation': options.orientation || 'vertical',
  };
}

/**
 * Create accessible list item attributes
 */
export function createListItemAriaAttributes(options: {
  selected?: boolean;
  disabled?: boolean;
  label?: string;
}): AriaAttributes {
  return {
    role: 'listitem',
    'aria-selected': options.selected,
    'aria-disabled': options.disabled,
    'aria-label': options.label,
    tabIndex: options.disabled ? -1 : (options.selected ? 0 : -1),
  };
}

/**
 * Create accessible navigation attributes
 */
export function createNavAriaAttributes(options: {
  label?: string;
  ariaLabel?: string;
  current?: 'page' | boolean;
}): AriaAttributes {
  return {
    role: 'navigation',
    'aria-label': options.ariaLabel || options.label || 'Navigation',
    'aria-current': options.current ? 'page' : undefined,
  };
}

/**
 * Create accessible heading attributes
 */
export function createHeadingAriaAttributes(options: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  id?: string;
}): AriaAttributes {
  return {
    role: `heading`,
    'aria-level': options.level || 2,
  };
}

/**
 * Check component keyboard accessibility
 */
export function isKeyboardAccessible(element: HTMLElement | null): boolean {
  if (!element) return false;

  // Check if element has a keyboard-accessible role or is interactive
  const interactiveRoles = ['button', 'link', 'menuitem', 'checkbox', 'radio', 'tab'];
  const role = element.getAttribute('role');
  const isInteractive =
    interactiveRoles.includes(role || '') ||
    ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);

  if (!isInteractive) return false;

  // Check if focusable
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex === '-1') return false;

  // Check if disabled
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
    return false;
  }

  return true;
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
    '[role="menuitem"]:not([aria-disabled="true"])',
  ].join(', ');

  const elements = Array.from(container.querySelectorAll(focusableSelector));
  
  // Filter out elements with tabindex="-1"
  return elements.filter((el) => {
    const tabindex = el.getAttribute('tabindex');
    return tabindex !== '-1';
  });
}

/**
 * Trap focus within a container (for modals/dialogs)
 */
export function createFocusTrap(container: HTMLElement | null) {
  if (!container) return null;

  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    return null;
  }

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab pressed
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        (lastFocusable as HTMLElement).focus();
      }
    } else {
      // Tab pressed
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only'; // Visually hidden
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Skip link component for keyboard users
 */
export function createSkipLink(targetId: string, label: string = 'Skip to main content') {
  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className =
    'sr-only focus:not-sr-only fixed top-0 left-0 z-50 bg-blue-600 text-white px-4 py-2';
  return link;
}

/**
 * Check if color contrast meets WCAG AA standards (4.5:1 for normal text)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance =
      (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance <= 0.03928 ? luminance / 12.92 : Math.pow((luminance + 0.055) / 1.055, 2.4);
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA
 */
export function meetsWCAGAA(color1: string, color2: string, largeText: boolean = false): boolean {
  const contrast = getContrastRatio(color1, color2);
  const minContrast = largeText ? 3 : 4.5;
  return contrast >= minContrast;
}

/**
 * Validate semantic HTML structure
 */
export function validateSemanticHTML(element: HTMLElement | null): {
  valid: boolean;
  issues: string[];
} {
  if (!element) return { valid: false, issues: ['Element is null'] };

  const issues: string[] = [];

  // Check for proper heading hierarchy
  const headings = Array.from(element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length > 1) {
    const levels = headings.map((h) => parseInt(h.tagName[1]));
    
    // Check if first heading is h1
    if (levels[0] !== 1) {
      issues.push(`Page should start with h1, found h${levels[0]}`);
    }
    
    // Check for skipped levels (e.g., h1 to h3)
    for (let i = 1; i < levels.length; i++) {
      const levelDiff = levels[i] - levels[i - 1];
      // Allow increase to higher level (e.g., h2 to h3), but not jumps (e.g., h2 to h4)
      if (levelDiff > 1) {
        issues.push(`Heading hierarchy broken: jumped from h${levels[i - 1]} to h${levels[i]}`);
      }
    }
  }

  // Check for images with alt text
  const images = Array.from(element.querySelectorAll('img'));
  const imagesWithoutAlt = images.filter((img) => !img.getAttribute('alt'));
  if (imagesWithoutAlt.length > 0) {
    issues.push(`${imagesWithoutAlt.length} images found without alt text`);
  }

  // Check for form labels
  const inputs = Array.from(element.querySelectorAll('input, select, textarea'));
  const inputsWithoutLabels = inputs.filter((input) => {
    const id = input.getAttribute('id');
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    return !label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby');
  });
  if (inputsWithoutLabels.length > 0) {
    issues.push(`${inputsWithoutLabels.length} form inputs found without labels`);
  }

  // Check for buttons with accessible names
  const buttons = Array.from(element.querySelectorAll('button'));
  const buttonsWithoutNames = buttons.filter((btn) => {
    return (
      !btn.textContent?.trim() &&
      !btn.getAttribute('aria-label') &&
      !btn.getAttribute('aria-labelledby')
    );
  });
  if (buttonsWithoutNames.length > 0) {
    issues.push(`${buttonsWithoutNames.length} buttons found without accessible names`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Debounce function for accessibility-sensitive operations
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Create accessible tooltip attributes
 */
export function createTooltipAriaAttributes(options: {
  id: string;
  label?: string;
  visible?: boolean;
}): AriaAttributes {
  return {
    role: 'tooltip',
    id: options.id,
    'aria-label': options.label,
    'aria-hidden': !options.visible,
  };
}

/**
 * Test helper: Check if element is visible to screen readers
 */
export function isVisibleToScreenReaders(element: HTMLElement | null): boolean {
  if (!element) return false;

  const style = window.getComputedStyle(element);

  // Check for display: none
  if (style.display === 'none') return false;

  // Check for visibility: hidden
  if (style.visibility === 'hidden') return false;

  // Check for aria-hidden
  if (element.getAttribute('aria-hidden') === 'true') return false;

  // Check for sr-only (visually hidden but screen-reader visible)
  const hasClass = element.className.includes('sr-only');
  if (hasClass) return true;

  // Check for opacity: 0
  if (style.opacity === '0') return false;

  return true;
}
