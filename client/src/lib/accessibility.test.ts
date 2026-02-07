/**
 * Accessibility Utilities Tests - WCAG AA Compliance
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createButtonAriaAttributes,
  createInputAriaAttributes,
  createDialogAriaAttributes,
  createListAriaAttributes,
  createListItemAriaAttributes,
  createNavAriaAttributes,
  createHeadingAriaAttributes,
  isKeyboardAccessible,
  getFocusableElements,
  createFocusTrap,
  announceToScreenReader,
  getContrastRatio,
  meetsWCAGAA,
  validateSemanticHTML,
  debounce,
  createTooltipAriaAttributes,
  isVisibleToScreenReaders,
} from '@/lib/accessibility';

describe('Accessibility Utilities', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  });

  // Button Aria Attributes Tests
  describe('createButtonAriaAttributes', () => {
    it('should create basic button attributes', () => {
      const attrs = createButtonAriaAttributes({ label: 'Click me' });

      expect(attrs['aria-label']).toBe('Click me');
      expect(attrs.role).toBe('button');
      expect(attrs.tabIndex).toBe(0);
    });

    it('should set tabindex to -1 when disabled', () => {
      const attrs = createButtonAriaAttributes({ disabled: true });

      expect(attrs['aria-disabled']).toBe(true);
      expect(attrs.tabIndex).toBe(-1);
    });

    it('should handle pressed state', () => {
      const attrs = createButtonAriaAttributes({ pressed: true });

      expect(attrs['aria-pressed']).toBe(true);
    });

    it('should include description when provided', () => {
      const attrs = createButtonAriaAttributes({
        label: 'Delete',
        ariaDescribedBy: 'delete-warning',
      });

      expect(attrs['aria-describedby']).toBe('delete-warning');
    });
  });

  // Input Aria Attributes Tests
  describe('createInputAriaAttributes', () => {
    it('should create basic input attributes', () => {
      const attrs = createInputAriaAttributes({ label: 'Email' });

      expect(attrs['aria-label']).toBe('Email');
      expect(attrs.tabIndex).toBe(0);
    });

    it('should mark required inputs', () => {
      const attrs = createInputAriaAttributes({ required: true });

      expect(attrs['aria-required']).toBe(true);
    });

    it('should mark invalid inputs', () => {
      const attrs = createInputAriaAttributes({ invalid: true });

      expect(attrs['aria-invalid']).toBe(true);
    });

    it('should handle readonly inputs', () => {
      const attrs = createInputAriaAttributes({ readonly: true });

      expect(attrs['aria-readonly']).toBe(true);
    });
  });

  // Dialog Aria Attributes Tests
  describe('createDialogAriaAttributes', () => {
    it('should create dialog attributes', () => {
      const attrs = createDialogAriaAttributes({});

      expect(attrs.role).toBe('dialog');
      expect(attrs['aria-hidden']).toBe(false);
    });

    it('should create alertdialog for modal', () => {
      const attrs = createDialogAriaAttributes({ modal: true });

      expect(attrs.role).toBe('alertdialog');
    });

    it('should link dialog to labels', () => {
      const attrs = createDialogAriaAttributes({
        labelledBy: 'dialog-title',
        describedBy: 'dialog-desc',
      });

      expect(attrs['aria-labelledby']).toBe('dialog-title');
      expect(attrs['aria-describedby']).toBe('dialog-desc');
    });
  });

  // List Aria Attributes Tests
  describe('createListAriaAttributes', () => {
    it('should create list attributes', () => {
      const attrs = createListAriaAttributes({});

      expect(attrs.role).toBe('list');
      expect(attrs['aria-orientation']).toBe('vertical');
    });

    it('should handle horizontal lists', () => {
      const attrs = createListAriaAttributes({ orientation: 'horizontal' });

      expect(attrs['aria-orientation']).toBe('horizontal');
    });

    it('should include label when provided', () => {
      const attrs = createListAriaAttributes({ label: 'Options' });

      expect(attrs['aria-label']).toBe('Options');
    });
  });

  // List Item Aria Attributes Tests
  describe('createListItemAriaAttributes', () => {
    it('should create list item attributes', () => {
      const attrs = createListItemAriaAttributes({});

      expect(attrs.role).toBe('listitem');
    });

    it('should mark selected items', () => {
      const attrs = createListItemAriaAttributes({ selected: true });

      expect(attrs['aria-selected']).toBe(true);
      expect(attrs.tabIndex).toBe(0);
    });

    it('should mark disabled items', () => {
      const attrs = createListItemAriaAttributes({ disabled: true });

      expect(attrs['aria-disabled']).toBe(true);
      expect(attrs.tabIndex).toBe(-1);
    });
  });

  // Navigation Aria Attributes Tests
  describe('createNavAriaAttributes', () => {
    it('should create navigation attributes', () => {
      const attrs = createNavAriaAttributes({});

      expect(attrs.role).toBe('navigation');
      expect(attrs['aria-label']).toBe('Navigation');
    });

    it('should mark current page', () => {
      const attrs = createNavAriaAttributes({ current: 'page' });

      expect(attrs['aria-current']).toBe('page');
    });
  });

  // Heading Aria Attributes Tests
  describe('createHeadingAriaAttributes', () => {
    it('should create heading attributes', () => {
      const attrs = createHeadingAriaAttributes({ level: 1 });

      expect(attrs.role).toBe('heading');
      expect(attrs['aria-level']).toBe(1);
    });

    it('should default to level 2', () => {
      const attrs = createHeadingAriaAttributes({});

      expect(attrs['aria-level']).toBe(2);
    });
  });

  // Keyboard Accessibility Tests
  describe('isKeyboardAccessible', () => {
    it('should identify keyboard-accessible buttons', () => {
      const button = document.createElement('button');
      expect(isKeyboardAccessible(button)).toBe(true);
    });

    it('should identify keyboard-accessible links', () => {
      const link = document.createElement('a');
      link.href = '#';
      expect(isKeyboardAccessible(link)).toBe(true);
    });

    it('should reject disabled buttons', () => {
      const button = document.createElement('button');
      button.disabled = true;
      expect(isKeyboardAccessible(button)).toBe(false);
    });

    it('should reject tabindex=-1', () => {
      const button = document.createElement('button');
      button.setAttribute('tabindex', '-1');
      expect(isKeyboardAccessible(button)).toBe(false);
    });

    it('should identify role="button" as accessible', () => {
      const div = document.createElement('div');
      div.setAttribute('role', 'button');
      expect(isKeyboardAccessible(div)).toBe(true);
    });
  });

  // Focusable Elements Tests
  describe('getFocusableElements', () => {
    it('should find all focusable elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(3);
    });

    it('should exclude disabled elements', () => {
      container.innerHTML = `
        <button>Button 1</button>
        <button disabled>Button 2</button>
        <input type="text" />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(2);
    });

    it('should exclude tabindex=-1', () => {
      container.innerHTML = `
        <button tabindex="-1">Button 1</button>
        <button>Button 2</button>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable.length).toBe(1);
    });
  });

  // Focus Trap Tests
  describe('createFocusTrap', () => {
    it('should create a focus trap', () => {
      container.innerHTML = `
        <button>First</button>
        <button>Last</button>
      `;

      const cleanup = createFocusTrap(container);
      expect(cleanup).not.toBeNull();
      expect(typeof cleanup).toBe('function');
    });

    it('should return null for null container', () => {
      const cleanup = createFocusTrap(null);
      expect(cleanup).toBeNull();
    });

    it('should return null for container with no focusable elements', () => {
      container.innerHTML = `<span>Not focusable</span>`;
      const cleanup = createFocusTrap(container);
      expect(cleanup).toBeNull();
    });
  });

  // Screen Reader Announcement Tests
  describe('announceToScreenReader', () => {
    it('should create announcement element', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test message');
    });

    it('should use polite priority by default', () => {
      announceToScreenReader('Test');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('should support assertive priority', () => {
      announceToScreenReader('Error', 'assertive');

      // Get the last created announcement (there may be multiple)
      const announcements = document.querySelectorAll('[role="status"]');
      const lastAnnouncement = announcements[announcements.length - 1];
      
      expect(lastAnnouncement?.getAttribute('aria-live')).toBe('assertive');
    });
  });

  // Color Contrast Tests
  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should calculate contrast ratio between similar colors', () => {
      const ratio = getContrastRatio('#cccccc', '#ffffff');
      expect(ratio).toBeGreaterThan(1);
    });
  });

  // WCAG AA Tests
  describe('meetsWCAGAA', () => {
    it('should pass for black and white', () => {
      expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
    });

    it('should fail for insufficient contrast', () => {
      expect(meetsWCAGAA('#cccccc', '#ffffff')).toBe(false);
    });

    it('should use 3:1 ratio for large text', () => {
      const contrast = getContrastRatio('#666666', '#ffffff');
      const result = meetsWCAGAA('#666666', '#ffffff', true);
      expect(result).toBe(contrast >= 3);
    });
  });

  // Semantic HTML Validation Tests
  describe('validateSemanticHTML', () => {
    it('should validate proper heading hierarchy starting with h1', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h2>Section</h2>
        <h3>Subsection</h3>
      `;

      const result = validateSemanticHTML(container);
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should flag broken heading hierarchy with skipped levels', () => {
      container.innerHTML = `
        <h1>Main Title</h1>
        <h3>Subsection</h3>
      `;

      const result = validateSemanticHTML(container);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.includes('jumped'))).toBe(true);
    });

    it('should flag when page does not start with h1', () => {
      container.innerHTML = `
        <h2>Section</h2>
        <h3>Subsection</h3>
      `;

      const result = validateSemanticHTML(container);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.includes('h1'))).toBe(true);
    });

    it('should flag images without alt text', () => {
      container.innerHTML = `<img src="test.jpg" />`;

      const result = validateSemanticHTML(container);
      expect(result.valid).toBe(false);
      expect(result.issues.some((issue) => issue.includes('alt text'))).toBe(true);
    });

    it('should allow images with alt text', () => {
      container.innerHTML = `<img src="test.jpg" alt="Test image" />`;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('alt text'))).toBe(false);
    });

    it('should flag form inputs without labels', () => {
      container.innerHTML = `<input type="text" />`;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('labels'))).toBe(true);
    });

    it('should allow inputs with aria-label', () => {
      container.innerHTML = `<input type="text" aria-label="Name" />`;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('without labels'))).toBe(false);
    });

    it('should flag buttons without text', () => {
      container.innerHTML = `<button></button>`;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('without accessible names'))).toBe(true);
    });

    it('should allow buttons with text', () => {
      container.innerHTML = `<button>Click</button>`;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('without accessible names'))).toBe(false);
    });

    it('should allow inputs with labels by id', () => {
      container.innerHTML = `
        <label for="email">Email</label>
        <input type="text" id="email" />
      `;

      const result = validateSemanticHTML(container);
      expect(result.issues.some((issue) => issue.includes('without labels'))).toBe(false);
    });
  });

  // Debounce Tests
  describe('debounce', () => {
    it('should debounce function calls', () => {
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      debounced();
      debounced();

      expect(func).not.toHaveBeenCalled();
    });

    it('should call function after delay', () => {
      vi.useFakeTimers();
      const func = vi.fn();
      const debounced = debounce(func, 100);

      debounced();
      vi.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  // Tooltip Aria Attributes Tests
  describe('createTooltipAriaAttributes', () => {
    it('should create tooltip attributes', () => {
      const attrs = createTooltipAriaAttributes({ id: 'tooltip-1' });

      expect(attrs.role).toBe('tooltip');
      expect(attrs.id).toBe('tooltip-1');
    });

    it('should hide tooltip by default', () => {
      const attrs = createTooltipAriaAttributes({ id: 'tooltip-1' });

      expect(attrs['aria-hidden']).toBe(true);
    });

    it('should show tooltip when visible', () => {
      const attrs = createTooltipAriaAttributes({ id: 'tooltip-1', visible: true });

      expect(attrs['aria-hidden']).toBe(false);
    });
  });

  // Screen Reader Visibility Tests
  describe('isVisibleToScreenReaders', () => {
    it('should identify visible elements', () => {
      container.innerHTML = `<button>Click</button>`;
      const button = container.querySelector('button');

      expect(isVisibleToScreenReaders(button as HTMLElement)).toBe(true);
    });

    it('should reject display:none elements', () => {
      container.innerHTML = `<button style="display:none">Click</button>`;
      const button = container.querySelector('button');

      expect(isVisibleToScreenReaders(button as HTMLElement)).toBe(false);
    });

    it('should reject aria-hidden elements', () => {
      container.innerHTML = `<button aria-hidden="true">Click</button>`;
      const button = container.querySelector('button');

      expect(isVisibleToScreenReaders(button as HTMLElement)).toBe(false);
    });

    it('should accept sr-only elements', () => {
      container.innerHTML = `<button class="sr-only">Click</button>`;
      const button = container.querySelector('button');

      expect(isVisibleToScreenReaders(button as HTMLElement)).toBe(true);
    });

    it('should reject null elements', () => {
      expect(isVisibleToScreenReaders(null)).toBe(false);
    });
  });
});
