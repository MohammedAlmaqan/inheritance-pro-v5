# Inheritance Pro v5.0 - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Module Structure](#module-structure)
4. [Data Flow](#data-flow)
5. [State Management](#state-management)
6. [Core Business Logic](#core-business-logic)
7. [UI Architecture](#ui-architecture)
8. [Build & Deployment](#build--deployment)
9. [Technology Stack](#technology-stack)
10. [Key Design Decisions](#key-design-decisions)

---

## Project Overview

**Inheritance Pro v5.0** is a professional Islamic inheritance calculator that:
- Calculates Islamic inheritance distributions based on Quranic rules
- Supports all 4 Islamic schools of jurisprudence (Madhabs): Hanafi, Maliki, Shafi'i, Hanbali
- Provides detailed calculation steps and explanations
- Compares results across all madhabs
- Exports results in multiple formats (PDF, CSV, JSON)
- Works on web (React) and mobile (Android via Capacitor)
- Maintains WCAG 2.1 AA accessibility compliance
- Provides responsive design for all device sizes

### Key Features
- **Comprehensive Heir Support**: Spouses, children, grandchildren, siblings, uncles, cousins, and blood relatives
- **Advanced Calculations**: Handles estate deductions (funeral, debts, wills), awl (inflation), radd (return)
- **Madhab Comparison**: Side-by-side comparison of rules across 4 Islamic schools
- **Scenario System**: Pre-built test scenarios and custom scenario creation
- **Accessibility**: Full WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Multiple Exports**: PDF reports, CSV data, JSON serialization, shareable text format
- **Dark/Light Themes**: Full theme support with system preference detection

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE LAYER                         │
│  React 19 + TypeScript + Radix UI + Tailwind CSS + Framer Motion│
├─────────────────────────────────────────────────────────────────┤
│  Home.tsx (Main Page)                                           │
│    ├─ Estate Input Forms (total, funeral, debts, wills)        │
│    ├─ Heir Selection (26+ heir types)                          │
│    ├─ Madhab Selection (4 schools)                             │
│    ├─ Scenario Dialog                                          │
│    ├─ Results Display                                          │
│    └─ Export Options (PDF, CSV, JSON, Share)                   │
└─────────────────────────────────────────────────────────────────┘
         ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STATE MANAGEMENT LAYER                         │
│                      Zustand Store                              │
│  (Global state: madhab, estate, heirs, results, UI state)      │
└─────────────────────────────────────────────────────────────────┘
         ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│               BUSINESS LOGIC LAYER (lib/)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ CALCULATION ENGINE                                       │ │
│  │  inheritance-engine.ts                                   │ │
│  │  - calculateInheritance(madhab, estate, heirs)          │ │
│  │  - Handles all madhab-specific logic                    │ │
│  │  - Generates calculation steps                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ FIQH DATABASE (fiqh-database.ts)                        │ │
│  │  - 4 Islamic schools rules & configurations             │ │
│  │  - Heir definitions & inheritance rights               │ │
│  │  - Special cases (awl, radd, blocking rules)            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ UTILITY MODULES                                          │ │
│  │  - fraction.ts: Precise fraction arithmetic             │ │
│  │  - validation.ts: Zod schemas for input validation      │ │
│  │  - madhab-comparison.ts: Compare all 4 madhabs          │ │
│  │  - scenarios.ts: Pre-built test scenarios               │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ▼              ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OUTPUT/EXPORT LAYER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ pdf-export.ts: PDF generation via jsPDF                 │ │
│  │ CSV: Tabular export via CSV formatting                  │ │
│  │ JSON: Full data serialization                           │ │
│  │ Share: Text format for messaging                        │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────┐
│            MOBILE LAYER (Capacitor/Android)                     │
│  - Native app wrapper                                           │
│  - Android SDK integration                                      │
│  - APK build via Gradle                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Module Structure

### Core Directories

```
client/src/
├── lib/                           # Business logic (85% of complexity)
│   ├── inheritance-engine.ts      # Main calculation logic
│   ├── fiqh-database.ts          # Islamic jurisprudence data
│   ├── fraction.ts               # Fraction arithmetic (high precision)
│   ├── madhab-comparison.ts      # Compare all 4 schools
│   ├── validation.ts             # Zod schemas (input validation)
│   ├── scenarios.ts              # Pre-built test scenarios
│   ├── pdf-export.ts             # Export to PDF/CSV/JSON
│   ├── accessibility.ts          # ARIA utilities
│   ├── animations.ts             # Animation helpers
│   ├── responsive.ts             # Responsive design utilities
│   ├── errors.ts                 # Error handling
│   ├── utils.ts                  # General utilities
│   ├── design-tokens.ts          # Design system tokens
│   └── types.ts                  # TypeScript type definitions
│
├── components/                    # React components
│   ├── ui/                       # Radix UI component wrappers
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── ... (20+ UI components)
│   │
│   ├── ErrorBoundary.tsx         # Error boundary for React errors
│   ├── MadhhabComparisonCard.tsx # Comparison view component
│   ├── ScenariosDialog.tsx        # Scenario management UI
│   ├── ManusDialog.tsx            # Debug/development helper
│   ├── Map.tsx                    # Google Maps integration
│   └── ThemeToggle.tsx            # Theme switcher
│
├── pages/                         # Page-level components
│   ├── Home.tsx                  # Main calculator page
│   ├── NotFound.tsx              # 404 page
│   └── (index).tsx
│
├── stores/                        # Zustand state management
│   └── appStore.ts               # Global application state
│
├── hooks/                         # Custom React hooks
│   ├── useComposition.ts         # Heir composition logic
│   ├── useKeyboardNavigation.ts  # Keyboard handling
│   ├── useMobile.tsx             # Mobile detection
│   └── usePersistFn.ts           # Persist function identity
│
├── contexts/                      # React contexts
│   └── ThemeContext.tsx           # Theme provider & hooks
│
├── App.tsx                        # Root component
├── main.tsx                       # React DOM mount point
└── index.css                      # Global styles

shared/
└── const.ts                       # Shared constants

android/                           # Android-specific config
├── build.gradle
├── app/src/
│   ├── main/AndroidManifest.xml
│   └── ...
└── ...
```

### Key Module Dependencies

```
Home.tsx
  ├── appStore (state management)
  ├── validation.ts (input validation)
  ├── inheritance-engine.ts (calculation)
  ├── madhab-comparison.ts (comparison logic)
  ├── pdf-export.ts (export functionality)
  └── ScenariosDialog, MadhhabComparisonCard (sub-components)

inheritance-engine.ts
  ├── fiqh-database.ts (madhab rules)
  ├── fraction.ts (precise math)
  └── types.ts (TypeScript definitions)

madhab-comparison.ts
  ├── inheritance-engine.ts (4x calls, one per madhab)
  └── fiqh-database.ts

pdf-export.ts
  └── (No internal dependencies, external libraries: jsPDF, etc)

appStore.ts (Zustand)
  ├── types.ts (TypeScript types)
  └── (No circular dependencies)
```

---

## Data Flow

### 1. User Input → Calculation → Results → Display

```
User fills form
    ↓
[Estate] [Heirs] [Madhab] → Home.tsx
    ↓
Validation (Zod) → validateEstate(), validateHeirs()
    ↓
Store State → appStore (madhab, estate, heirs)
    ↓
User clicks "Calculate"
    ↓
calculateInheritance(madhab, estate, heirs)
    ↓
InheritanceEngine:
  1. Validate inputs
  2. Load madhab rules from fiqh-database
  3. Process heirs (identify blocked, shares, etc.)
  4. Apply special cases (awl, radd)
  5. Calculate using Fraction arithmetic
  6. Generate calculation steps
  7. Return CalculationResult
    ↓
Store Result → appStore.result
    ↓
Results Display in Home.tsx
    ↓
User can:
  - View detailed steps
  - Compare madhabs (calls madhab-comparison.ts)
  - Export (PDF, CSV, JSON)
  - Save scenario
```

### 2. Madhab Comparison Flow

```
User clicks "Compare with other schools"
    ↓
compareAllMadhabs(estate, heirs)
    ↓
For each madhab (hanafi, maliki, shafii, hanbali):
  - Call calculateInheritance(madhab, ...)
  - Store result with madhab identifier
    ↓
MadhhabComparison object with:
  {
    hanafi: CalculationResult,
    maliki: CalculationResult,
    shafii: CalculationResult,
    hanbali: CalculationResult,
    differences: [...],
    commonalities: [...]
  }
    ↓
Display MadhhabComparisonCard
```

### 3. Export Flow

```
User selects export format
    ↓
exportToPDF(result) / downloadCSV(result) / downloadJSON(result)
    ↓
Format data:
  - Extract shares, amounts, steps
  - Generate document structure
  - Apply styling/formatting
    ↓
Generate file in memory
    ↓
Trigger browser download
```

---

## State Management

### Zustand Store (appStore.ts)

```typescript
AppState {
  // Input Data
  madhab: Madhab                    // Selected school
  estate: EstateData               // Total, funeral, debts, will
  heirs: HeirsData                 // 26+ heir types with counts
  
  // Calculation Results
  result: CalculationResult | null
  
  // UI State
  isCalculating: boolean
  selectedTab: string
  
  // History
  history: CalculationResult[]      // Past calculations
  
  // Actions
  setMadhab(madhab)
  setEstate(estate)
  setHeirs(heirs)
  updateEstateField(field, value)
  updateHeirCount(heirKey, count)
  setResult(result)
  setIsCalculating(boolean)
  addToHistory(result)
  resetAll()
}
```

**Why Zustand?**
- Lightweight (no provider boilerplate)
- TypeScript support
- Immutable updates
- Easy to test
- No Redux complexity

---

## Core Business Logic

### 1. Inheritance Calculation Engine (`inheritance-engine.ts`)

**Purpose**: Calculate inheritance distribution according to Islamic law

**Key Methods**:
- `calculateInheritance(madhab, estate, heirs)` → CalculationResult
- Process heirs based on madhab rules
- Calculate net estate (total - funeral - debts - wills)
- Determine inheritance rights using Fraction math
- Apply special cases (awl, radd, blocking)
- Generate detailed calculation steps

**Madhab Rules**:
Each madhab (school) has different rules in `fiqh-database.ts`:

| Rule | Hanafi | Maliki | Shafi'i | Hanbali |
|------|--------|--------|---------|---------|
| Grandfather with siblings | Blocks | Shares | Blocks | Blocks |
| Radd to spouses | Yes | No | No | No |
| Blood relatives enabled | Yes | No | Yes | Yes |
| Musharaka (sharing) | No | Yes | Yes | No |

### 2. Fiqh Database (`fiqh-database.ts`)

Stores complete Islamic jurisprudence rules:
- **4 Madhabs**: Each with unique inheritance rules
- **Heirs**: 26+ heir types with Islamic names and inheritance rules
- **Fractions**: Quranic inheritance shares (1/2, 1/3, 1/4, 1/6, 1/8, etc.)
- **Blocking Rules**: Who blocks whom from inheritance
- **Special Cases**: Awl (inflation), Radd (return), Musharaka

### 3. Fraction System (`fraction.ts`)

**Why Fractions?**
Islamic inheritance uses complex fractions (1/2, 1/3, 1/4, 1/6, 1/8, etc.) that don't divide evenly. Floating-point arithmetic loses precision at scale.

**Solution**: Fraction class
```typescript
class Fraction {
  numerator: number
  denominator: number
  
  add(other): Fraction         // 1/2 + 1/3 = 5/6
  subtract(other): Fraction    // 1/2 - 1/3 = 1/6
  multiply(other): Fraction    // 1/2 * 1/3 = 1/6
  toDecimal(): number          // Precise conversion only when needed
}
```

### 4. Validation (`validation.ts`)

Uses Zod for runtime type safety:
```typescript
EstateSchema = z.object({
  total: z.number().min(0),
  funeral: z.number().min(0),
  debts: z.number().min(0),
  will: z.number().min(0)
})

HeirsSchema = z.object({
  husband: z.number(),
  wife: z.number(),
  // ... 24 more heir types
})
```

### 5. Madhab Comparison (`madhab-comparison.ts`)

Calls `calculateInheritance()` 4 times (once per madhab) and compares:
- Inheritance shares
- Blocked heirs
- Special cases applied
- Distribution differences

---

## UI Architecture

### Component Hierarchy

```
App
├── ThemeProvider (context)
│   └── TooltipProvider (Radix UI)
│       └── Router
│           ├── Route: / → Home
│           │   ├── EstateForm
│           │   ├── HeirsForm
│           │   ├── MadhhabSelector
│           │   ├── ScenariosDialog
│           │   ├── ResultsDisplay
│           │   │   ├── HeirSharesTable
│           │   │   ├── CalculationSteps
│           │   │   └── Warnings/Alerts
│           │   └── ExportOptions
│           │       ├── ExportPDF
│           │       ├── ExportCSV
│           │       ├── ExportJSON
│           │       └── Share
│           │
│           ├── Route: /404 → NotFound
│           └── ErrorBoundary (wraps all)
```

### Key UI Components

**Form Components**:
- EstateForm: Input (total, funeral, debts, will)
- HeirsForm: Select heir counts
- MadhhabSelector: Choose school

**Display Components**:
- ResultsDisplay: Main results area
- HeirSharesTable: Tabular share display
- CalculationSteps: Step-by-step explanation
- MadhhabComparisonCard: Compare 4 schools

**Dialog Components**:
- ScenariosDialog: Load/save scenarios
- ManusDialog: Debug/development

**Utility Components**:
- ErrorBoundary: Catch React errors
- ThemeToggle: Dark/light switch

### Design System

**UI Framework**: Radix UI
- Unstyled, accessible components
- Built-in ARIA, keyboard support
- Full theming support

**Styling**: Tailwind CSS
- Utility-first CSS
- Custom design tokens in `design-tokens.ts`
- Dark mode support via `next-themes`

**Animation**: Framer Motion
- Smooth transitions
- Spring physics
- Respects `prefers-reduced-motion`

**Icons**: Lucide React
- Consistent icon library
- SVG-based, accessible

---

## Build & Deployment

### Web Build (Vite)

```bash
pnpm run build
# Output: dist/ folder
# - Optimized JS/CSS bundles
# - Assets hashed for cache busting
# - Sourcemaps for debugging
```

**Build Pipeline**:
1. TypeScript compilation
2. JSX → JavaScript
3. CSS processing (Tailwind)
4. Asset optimization
5. Code splitting
6. Minification

### Mobile Build (Capacitor + Android)

```bash
pnpm run build:android
# 1. Build web assets (same as above)
# 2. Sync to Android project
# 3. Build APK via Gradle

bash build-apk.sh debug
# Builds debug APK for testing
```

**Android Structure**:
- `android/app/build.gradle`: APK configuration
- `android/app/src/main/AndroidManifest.xml`: App permissions
- Capacitor plugins bridge web ↔ native APIs

---

## Technology Stack

### Frontend Framework
- **React 19.2**: Latest React version
- **TypeScript 5.7**: Type-safe development
- **Vite 7.1**: Lightning-fast build tool

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS 4.1**: Utility-first styling
- **Framer Motion 12.23**: Animations
- **Lucide React**: Icon library

### Forms & Validation
- **React Hook Form 7.64**: Efficient form state
- **Zod 4.1**: Schema validation

### State Management
- **Zustand 4.5**: Lightweight state store
- **next-themes 0.4**: Theme management

### Routing
- **Wouter 3.3**: Lightweight router

### Export & Data
- **jsPDF**: PDF generation
- **Custom CSV/JSON**: Data export
- **Recharts**: Chart visualization

### Mobile
- **Capacitor 8.0**: Web → Native bridge
- **Android SDK**: APK compilation

### Testing
- **Vitest 2.1**: Test runner
- **Happy DOM**: Lightweight DOM
- **Coverage tools**: vitest/coverage-v8

### Development
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking
- **Vite Plugins**: JSX location, Tailwind, etc.

---

## Key Design Decisions

### 1. **Fraction-Based Math Over Floating Point**
- **Why**: Islamic inheritance uses non-terminating fractions
- **Trade-off**: Performance vs. precision (precision wins)
- **Impact**: 100% accurate calculations at any estate value

### 2. **Client-Side Only Architecture**
- **Why**: Privacy-first, no server required, offline-capable
- **Trade-off**: No cloud sync, user data stays local
- **Impact**: Simple deployment, zero backend maintenance

### 3. **Zustand for State Management**
- **Why**: Lightweight, zero boilerplate, TypeScript-first
- **Alternative Considered**: Redux (too heavy), Context API (prop drilling)
- **Impact**: Faster development, smaller bundle

### 4. **Radix UI for Components**
- **Why**: Unstyled primitives, accessibility built-in, full control
- **Alternative**: Material-UI (opinionated), Chakra (heavier)
- **Impact**: Custom design, better accessibility

### 5. **Vite for Build Tool**
- **Why**: Fast development, modern ES modules, optimized output
- **Alternative**: Webpack (slower), Create React App (abandoned)
- **Impact**: Fast HMR, quick builds

### 6. **Capacitor for Mobile**
- **Why**: Web → Native with minimal code changes
- **Alternative**: React Native (separate codebase)
- **Impact**: One codebase for web + Android

### 7. **TypeScript Strict Mode**
- **Why**: Catch errors at compile time
- **Trade-off**: More typing, slower development initially
- **Impact**: Production confidence, fewer runtime errors

### 8. **WCAG 2.1 AA Accessibility**
- **Why**: Islamic finance serves diverse audiences
- **Implementation**: Semantic HTML, ARIA, keyboard navigation, contrast
- **Impact**: Inclusive design, legal compliance

---

## Future Considerations

### Potential Enhancements
1. **Backend Service** (v6+): User accounts, cloud sync, analytics
2. **Advanced Search**: Scenario filtering, pattern recognition
3. **Internationalization (i18n)**: More language support
4. **AI Features**: Suggested scenarios, predictions
5. **Community Features**: Scenario sharing, discussions
6. **Advanced Export**: Excel, Word, more formats

### Performance Optimizations
1. **Code Splitting**: Lazy load comparison, export features
2. **Caching**: Cache fiqh database, calculation results
3. **Offline Support**: Service worker for PWA capabilities
4. **Bundle Analysis**: Identify and reduce large dependencies

### Testing Roadmap
1. Expand unit test coverage to 85%+
2. Add integration tests for calculation scenarios
3. Add E2E tests for user workflows
4. Add visual regression tests

---

## Glossary

| Term | Definition |
|------|-----------|
| **Madhab** | School of Islamic jurisprudence (legal thought) |
| **Fiqh** | Islamic jurisprudence |
| **Awl** | Increase in number of heirs causing estate shortfall |
| **Radd** | Return of excess estate to heirs when shortfall |
| **Heir** | Person with legal right to inheritance |
| **Blocking** | When one heir prevents another from inheriting |
| **Musharaka** | Sharing/partnership distribution method |
| **Fraction** | Precise mathematical representation of inheritance shares |
| **Estate** | Total property/wealth to be distributed |

---

## Quick Start for Developers

**Understanding the code flow**:
1. Start at `client/src/pages/Home.tsx` to see the UI
2. Follow the `handleCalculate()` function to `inheritance-engine.ts`
3. Study `fiqh-database.ts` to understand madhab rules
4. Look at `fraction.ts` to see the math
5. Review `appStore.ts` for state management

**Making changes**:
1. **UI changes**: Edit components in `components/` or `pages/`
2. **Calculation logic**: Edit `inheritance-engine.ts` or `fiqh-database.ts`
3. **Validation**: Update Zod schemas in `validation.ts`
4. **State**: Modify store actions in `appStore.ts`
5. **Styling**: Update Tailwind classes or add to `design-tokens.ts`

**Testing**:
```bash
pnpm test                    # Run all tests
pnpm test:coverage          # Coverage report
pnpm test:ui                # Interactive UI
```

**Building**:
```bash
pnpm run build              # Build web
pnpm run build:apk          # Build Android APK
```

---

**Last Updated**: June 2026  
**Version**: 5.0  
**Maintainer**: Mohammed Almaqan
