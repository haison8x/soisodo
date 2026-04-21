# UI Component Contracts

**Feature**: 001-apple-hig-ui-ux  
**Date**: 2026-04-21

These contracts define the public API for shared UI components introduced by this feature.
Implementing code must satisfy these contracts exactly; internal implementation may vary.

---

## `<ScreenHeader />`

**Location**: `src/components/shared/ScreenHeader.tsx`

### Props contract

```typescript
interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}
```

### Behavior contract

| Condition | Expected behavior |
|-----------|-------------------|
| `onBack` provided | Renders a `<` chevron-left button at left edge; calls `onBack` on press |
| `onBack` absent | Left slot is empty |
| `transparent={true}` | Background is transparent; text and icons are white |
| `transparent` absent / false | Background is `Colors.surface` with bottom border |
| `rightElement` provided | Renders in right slot, max width 44pt |
| Title overflow | Truncates with ellipsis on single line |

### Accessibility

- Back button `accessibilityLabel`: `"Quay lại"`
- Header `accessibilityRole`: `"header"`

---

## `useToast()` hook

**Location**: `src/hooks/useToast.ts`  
**Provider**: `<ToastProvider />` in `src/components/shared/ToastProvider.tsx`

### Hook API

```typescript
interface ToastOptions {
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number; // ms, default 2500
}

function useToast(): {
  showToast: (options: ToastOptions) => void;
}
```

### Behavior contract

| Condition | Expected behavior |
|-----------|-------------------|
| `showToast` called | Banner slides in from top, visible for `duration` ms, then slides out |
| Called while banner visible | Previous banner replaced immediately, timer resets |
| User swipes up on banner | Banner dismisses immediately |
| `type: 'success'` | Green accent, checkmark icon |
| `type: 'error'` | Red accent, × icon |
| `type: 'info'` | Blue accent, ℹ icon |
| Device has no haptic support | No crash; haptic call is silently skipped |

### Integration requirement

`<ToastProvider />` MUST wrap `<NavigationContainer>` in `App.tsx` so Toast renders above all navigation screens.

---

## `<SettingsSection />` and `<SettingsRow />`

**Location**: `src/components/shared/SettingsSection.tsx`

### Props contract

```typescript
interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
}

interface SettingsRowProps {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}
```

### Behavior contract

| Condition | Expected behavior |
|-----------|-------------------|
| `onPress` provided | Row is touchable, shows chevron-right at far right |
| `onPress` absent | Row is non-interactive, no chevron |
| `destructive={true}` | Label text uses `Colors.danger` |
| `isFirst={true}` | Top corners have `Radius.md` border radius |
| `isLast={true}` | Bottom corners have `Radius.md` border radius; bottom separator hidden |
| `value` provided | Renders value text in `Colors.textSecondary` before chevron |
| `rightElement` provided | Replaces chevron slot entirely |

---

## Design Token exports

**Location**: `src/theme/index.ts`

### Export contract

```typescript
export { Colors } from './colors';     // semantic color map
export { Spacing } from './spacing';   // numeric spacing scale
export { Typography } from './typography'; // fontSize + fontWeight
export { Radius } from './radius';     // border radius scale
export { Shadows } from './shadows';   // shadow + elevation pairs
```

All tokens are plain JavaScript objects (no class instances) — safe for use in `StyleSheet.create()`.

### Breaking change rule

Adding new tokens is non-breaking. Renaming or removing existing tokens requires a migration pass across all screens in the same PR.
