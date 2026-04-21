# Quickstart: Apple HIG UI/UX Improvements

**Feature**: 001-apple-hig-ui-ux  
**Branch**: `001-apple-hig-ui-ux`  
**Date**: 2026-04-21

---

## Setup (one-time)

```bash
# Make sure you're on the feature branch
git checkout 001-apple-hig-ui-ux

# Install new dependency
pnpm add expo-haptics

# Verify no type errors
pnpm typecheck
```

---

## Development order

Work in this order — each step builds on the previous:

### Step 1 — Design tokens (no visual change yet)

Create `src/theme/` with all token files. Run `pnpm typecheck` — zero errors expected.

```bash
# Verify: search for token imports working
pnpm typecheck
```

### Step 2 — Migrate colors (global, high-impact)

Replace all hard-coded hex values in StyleSheets with semantic token references.
Search command to find remaining stragglers:

```bash
# Should return 0 results when done
grep -r "'#[A-Fa-f0-9]\{3,8\}'" src/ --include="*.tsx" --include="*.ts"
```

### Step 3 — ScreenHeader component

Build `src/components/shared/ScreenHeader.tsx`.
Apply to: ConvertGoogleScreen, SettingsScreen, AppInfoScreen, UserManualScreen, TermsScreen, PrivacyScreen.

### Step 4 — Toast system

Build `ToastProvider` + `useToast` hook.
Wire into `App.tsx`.
Replace all success `Alert.alert()` calls:

```bash
# Find remaining success alerts
grep -rn "Alert.alert('Thành công'" src/
```

### Step 5 — Safe area fix

Replace `paddingBottom: 220` with safe-area-aware values.
Affected files: HomeScreen, SettingsScreen, SoDoScreen, PlanningScreen, VN2000Screen.

### Step 6 — Haptic feedback

Add `Haptics.impactAsync` to CTA buttons: Lưu Lại, Xem Bản Đồ, Chuyển đổi sang WGS84.

### Step 7 — SettingsScreen redesign

Build `SettingsSection` + `SettingsRow` components.
Reorganize SettingsScreen into grouped sections.

### Step 8 — HomeScreen CTA hierarchy

Reduce visual noise: elevate "Xem Bản Đồ" to primary full-width, "Lưu Lại" as secondary full-width, compact secondary row for edit/swap actions.

---

## Verification checklist

```bash
pnpm typecheck          # zero errors
pnpm lint               # zero errors, zero warnings

# Manual checks on device:
# [ ] Scroll to bottom of HomeScreen — last button fully visible, not hidden by tab bar
# [ ] Save a project — toast appears, auto-dismisses in ~2.5s, no Alert
# [ ] Open Settings — 3+ grouped sections with headers visible
# [ ] Tap "Lưu Lại" on physical device — feel haptic response
# [ ] Open app on Android — colors, layout identical to iOS screenshots
```

---

## Key files

| What | Where |
|------|-------|
| Design tokens | `src/theme/` |
| Shared components | `src/components/shared/` |
| Toast provider wiring | `App.tsx` |
| useToast hook | `src/hooks/useToast.ts` |
| Screens to update | HomeScreen, MapScreen, SettingsScreen, SoDoScreen, VN2000Screen, PlanningScreen, ConvertGoogleScreen, settings/* |
