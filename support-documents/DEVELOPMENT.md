# Development Guide - Inheritance Pro v5

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to Android
npm run build:android
```

---

## Architecture Overview

### Technology Stack

```
Frontend:
├── React 19 + TypeScript 5.6 (strict mode)
├── Tailwind CSS 4.1 (responsive design)
├── Vite 7.1 (build tool)
├── Radix UI (accessible components)
├── Zustand 4.5 (state management)
└── Zod 4.1 (schema validation)

Testing:
├── Vitest 2.1 (unit testing)
├── React Testing Library (component testing)
└── Playwright (E2E testing)

Mobile:
├── Capacitor 6.1 (iOS/Android bridge)
├── Gradle (Android build)
└── Swift (iOS native)

Backend:
├── Node.js + TypeScript
├── Express pattern
└── SQLite (data storage)
```

### Project Structure

```
/client                    # React frontend
├── src/
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   ├── index.css         # Global styles
│   ├── const.ts          # Constants
│   ├── components/       # React components
│   │   ├── ui/           # Radix UI components
│   │   ├── Home.tsx      # Main page
│   │   ├── Map.tsx       # Diagram component
│   │   └── ...
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   │   ├── accessibility.ts
│   │   ├── responsive.ts
│   │   ├── animations.ts
│   │   ├── inheritance-engine.ts
│   │   └── ...
│   └── pages/            # Page components
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript config

/server                    # Node.js backend
├── index.ts              # Entry point
└── routes/               # API routes

/android                   # Android build
├── app/                  # Android app code
└── gradle/               # Build configuration

/shared                    # Shared code
├── const.ts              # Shared constants
└── types.ts              # Type definitions

/patches                   # npm patch files
```

---

## Key Modules

### 1. Inheritance Engine

**File**: `client/src/lib/inheritance-engine.ts`

**Purpose**: Core calculation logic for Islamic inheritance distribution

**Key Functions**:
```typescript
// Main calculation function
calculateInheritance(
  estate: number,
  heirs: Heir[],
  madhab: MadhhabKey,
  deathCircumstances?: DeathCircumstances
): CalculationResult

// Validation
validateInput(heirs: Heir[]): ValidationError[]

// Helper calculations
calculateShares(heirs: Heir[], madhab: MadhhabKey): Share[]
getHeritageRules(madhab: MadhhabKey): HeritageRules
```

**Usage**:
```typescript
import { calculateInheritance } from '@/lib/inheritance-engine';

const result = calculateInheritance(
  1000000,  // estate
  [
    { type: 'son', count: 2 },
    { type: 'wife', count: 1 }
  ],
  'hanafi',  // madhab
  { deathType: 'natural' }
);

console.log(result.shares);  // [{ heir: 'wife', share: 125000 }, ...]
```

### 2. Accessibility Module

**File**: `client/src/lib/accessibility.ts`

**Purpose**: WCAG 2.1 AA compliance helpers

**Key Functions**:
```typescript
// ARIA generation
generateAriaLabel(type: string, data?: string): string
generateAriaDescription(content: string): string

// Keyboard support
createKeyboardAccessible(el: HTMLElement): void
getTabbableElements(container: HTMLElement): HTMLElement[]

// Color validation
getContrastRatio(color1: string, color2: string): number
meetsWCAGAA(ratio: number): boolean

// Screen reader announcements
announceToScreenReader(message: string): void
```

**Usage**:
```typescript
import { generateAriaLabel, meetsWCAGAA } from '@/lib/accessibility';

const label = generateAriaLabel('button', 'تحديد المذهب');
// Returns: "تحديد المذهب - اختر المذهب الفقهي المراد استخدامه"

if (!meetsWCAGAA(calculateContrastRatio('#000', '#fff'))) {
  console.warn('Color contrast insufficient');
}
```

### 3. Responsive Utilities

**File**: `client/src/lib/responsive.ts`

**Purpose**: Mobile-first responsive design helpers

**Key Functions**:
```typescript
// Viewport detection
isMobileViewport(): boolean
isTabletViewport(): boolean
isDesktopViewport(): boolean

// Breakpoint calculations
getActiveBreakpoint(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
shouldShowElement(breakpoint: string): boolean

// Safe areas (notches, etc.)
getSafeAreaInsets(): SafeAreaInsets

// Touch capabilities
hasTouchSupport(): boolean
```

**Usage**:
```typescript
import { isMobileViewport, hasTouchSupport } from '@/lib/responsive';

if (isMobileViewport()) {
  // Show mobile layout
}

if (hasTouchSupport()) {
  // Apply touch-friendly spacing
}
```

### 4. Animations Module

**File**: `client/src/lib/animations.ts`

**Purpose**: Motion-aware, accessible animations

**Key Exports**:
```typescript
// Motion preference
prefersReducedMotion(): boolean
getAnimationDuration(ms: number, instant?: boolean): number

// Animation helpers
animationClasses.fadeIn
animationClasses.slideInFromTop
animationClasses.scaleIn
// ... and more

// Spring physics
springConfig.default
springConfig.bouncy
springConfig.gentle
// ... and more

// Easing functions
easing.easeInOutCubic
easing.easeInCubic
easing.easeOutCubic
// ... and more

// Touch feedback
touchFeedback.active
touchFeedback.hover
touchFeedback.focus

// Loading state
skeletonAnimation

// Success state
successAnimation
```

**Usage**:
```typescript
import { 
  prefersReducedMotion, 
  animationClasses,
  getAnimationDuration 
} from '@/lib/animations';

<div 
  className={animationClasses.fadeIn}
  style={{ 
    animationDuration: `${getAnimationDuration(300)}ms` 
  }}
>
  Content
</div>
```

---

## Custom Hooks

### Keyboard Navigation

```typescript
// useKeyboardNavigation - Handle arrow keys and activation
useKeyboardNavigation({
  onArrowUp: () => moveToPrevious(),
  onArrowDown: () => moveToNext(),
  onEnter: () => selectItem(),
  onEscape: () => closeDialog(),
})

// useEscapeKey - Close on Escape
useEscapeKey(() => setOpen(false), { enabled: isOpen })

// useFocusManagement - Virtual focus for custom components
const { focusedIndex, setFocusedIndex } = useFocusManagement({
  itemCount: items.length,
  direction: 'vertical'
})

// usePreventBodyScroll - Disable scroll (for modals)
usePreventBodyScroll(shouldDisable)

// useActivation - Enter/Space support for custom buttons
const activationProps = useActivation(handleClick)
```

---

## State Management (Zustand)

### Store Structure

```typescript
// Example store for calculation results
import { create } from 'zustand';

type CalculationStore = {
  // State
  results: CalculationResult | null;
  madhab: MadhhabKey;
  estate: number;
  
  // Actions
  setResults: (results: CalculationResult) => void;
  setMadhab: (madhab: MadhhabKey) => void;
  clear: () => void;
};

export const useCalculation = create<CalculationStore>((set) => ({
  results: null,
  madhab: 'hanafi',
  estate: 0,
  
  setResults: (results) => set({ results }),
  setMadhab: (madhab) => set({ madhab }),
  clear: () => set({ results: null, estate: 0 }),
}));
```

### Usage in Components

```typescript
function CalculationResults() {
  const { results, madhab } = useCalculation();
  
  if (!results) return <div>No results</div>;
  
  return (
    <div>
      <h2>Results ({madhab})</h2>
      {results.shares.map(share => (
        <div key={share.heir}>{share.heir}: {share.amount}</div>
      ))}
    </div>
  );
}
```

---

## Testing Guide

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

describe('Component: Button', () => {
  it('should render with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    
    await userEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- accessibility

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run single test
npm test -- -t "should render with label"
```

### Test Files Organization

```
client/src/
├── lib/
│   ├── accessibility.test.ts
│   ├── responsive.test.ts
│   ├── animations.test.ts
│   ├── inheritance-engine.test.ts
│   └── ...
├── components/
│   ├── Home.test.tsx
│   ├── ManusDialog.test.tsx
│   └── ...
└── hooks/
    └── useKeyboardNavigation.test.ts
```

---

## Adding New Features

### 1. Creating an Accessible Component

```typescript
// components/CustomButton.tsx
import { FC } from 'react';
import { generateAriaLabel } from '@/lib/accessibility';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

interface CustomButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
}

export const CustomButton: FC<CustomButtonProps> = ({
  onClick,
  ariaLabel,
  children
}) => {
  const keyboardProps = useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick,
  });
  
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel || generateAriaLabel('button', String(children))}
      className="px-4 py-2 transition-all duration-300 focus:ring-2 focus:ring-blue-500"
      {...keyboardProps}
      role="button"
      tabIndex={0}
    >
      {children}
    </button>
  );
};
```

### 2. Creating a Custom Hook

```typescript
// hooks/useCustomHook.ts
import { useEffect, useState, useCallback } from 'react';

interface UseCustomHookOptions {
  initialValue?: string;
  onValueChange?: (value: string) => void;
}

export const useCustomHook = (options: UseCustomHookOptions = {}) => {
  const { initialValue = '', onValueChange } = options;
  const [value, setValue] = useState(initialValue);
  
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  }, [onValueChange]);
  
  return { value, handleChange };
};
```

### 3. Creating Tests

```typescript
// components/CustomButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomButton } from './CustomButton';

describe('CustomButton', () => {
  it('should render with text', () => {
    render(<CustomButton onClick={vi.fn()}>Click me</CustomButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('should have aria-label', () => {
    render(<CustomButton onClick={vi.fn()}>Button</CustomButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
  });
  
  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<CustomButton onClick={handleClick}>Click</CustomButton>);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Performance Optimization

### Code Splitting

```typescript
// Route-based code splitting
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/Home'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
```

### Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Prevent unnecessary re-renders
const ResultCard = memo(({ result }: { result: Result }) => {
  // Component only re-renders if 'result' changes
  return <div>{result.heir}: {result.amount}</div>;
});

// Memoize expensive calculations
function Calculator() {
  const items = useMemo(() => {
    return expensiveCalculation();
  }, [depend1, depend2]);
  
  // Memoize callbacks
  const handleChange = useCallback((value) => {
    // ...
  }, []);
  
  return <div>{items}</div>;
}
```

### Bundle Size Monitoring

```bash
# Check bundle size
npm run build

# Analyze with vite-plugin-visualizer
npm install --save-dev vite-plugin-visualizer

# View analysis
# Check dist/ files and sizes
```

---

## Debugging

### Using React DevTools
1. Install React DevTools browser extension
2. Open DevTools (F12)
3. Go to "Components" tab
4. Inspect component props and state

### Using Zustand DevTools
```typescript
import { devtools } from 'zustand/middleware';

export const useCalculation = create<CalculationStore>(
  devtools((set) => ({
    // Store definition
  }), { name: 'CalculationStore' })
);
```

### Console Logging
```typescript
// In development
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// Or use debug package
import debug from 'debug';
const log = debug('app:component');
log('Component mounted');
```

### Browser DevTools
```javascript
// Check calculated values
> Performance > Record > Stop
// View bottlenecks

// Check accessibility
> Lighthouse

// Check CSS
> Elements > Styles

// Check network
> Network > Look for slow resources
```

---

## Build & Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Serve on localhost to test
npx serve dist

# Check bundle analysis
npm run build -- --analyze
```

### Android Build

```bash
# Build Android app
npm run build:android

# Deploy to device/emulator
cd android
./gradlew installDebug

# Build release APK
./gradlew assembleRelease
```

### Environment Variables

Create `.env.local`:
```
VITE_API_URL=https://api.example.com
VITE_APP_VERSION=5.0.0
```

Usage:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Common Tasks

### Adding a New Madhab
```typescript
// lib/types.ts
export type MadhhabKey = 'hanafi' | 'maliki' | 'shafi' | 'hanbali' | 'ja\'fari' | 'ibadi';

// lib/inheritance-engine.ts
const MADHAB_RULES: Record<MadhhabKey, HeritageRules> = {
  ibadi: {
    // Define rules for Ibadi madhab
  },
  // ...
};
```

### Changing Colors/Themes
```typescript
// components/ui/theme.ts
export const colors = {
  primary: '#0066cc',
  success: '#00cc66',
  warning: '#ff9900',
  error: '#cc0000',
};

// In components
<Button className="bg-blue-600 hover:bg-blue-700">
  Action
</Button>
```

### Updating Translations
Translations are embedded in component text. To add multi-language support:

```typescript
// hooks/useTranslation.ts
const translations = {
  'button.calculate': {
    ar: 'احسب الميراث',
    en: 'Calculate Inheritance',
  },
};

export const useTranslation = (key: string) => {
  const language = useLanguage(); // Get from context
  return translations[key]?.[language] || key;
};
```

---

## Troubleshooting

### Tests Failing
```bash
# Clear cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install

# Run tests
npm test -- --no-coverage
```

### Build Errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Clear dist folder
rm -rf dist

# Rebuild
npm run build
```

### Component Not Rendering
- Check React DevTools
- Verify props are passed correctly
- Check for conditional rendering
- Look for console errors

### Accessibility Issues
- Use Axe DevTools extension
- Check WAVE browser extension
- Test with keyboard navigation
- Test with screen reader

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org)

---

**Last Updated**: February 2026
**Version**: 5.0 (Phase 2 Complete)
