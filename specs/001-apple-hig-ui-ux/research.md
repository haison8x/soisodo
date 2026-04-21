# Research: Apple HIG UI/UX Improvements

**Feature**: 001-apple-hig-ui-ux  
**Date**: 2026-04-21  
**Status**: Complete — all unknowns resolved

---

## R-001: Toast/Banner implementation approach

**Question**: Use third-party library or custom implementation for toast notifications?

**Decision**: Custom implementation using `react-native-reanimated` v4 (already in deps).

**Rationale**:
- `react-native-reanimated` v4 is already installed — zero new dependency
- Full control over visual style to match the app's design tokens
- Reanimated v4 has a simpler API (`useSharedValue`, `withTiming`, `withSpring`) than v2/v3
- Gesture dismiss (swipe-up) handled by `react-native-gesture-handler` (already installed)
- Libraries like `react-native-toast-message` add ~50kB and often have stale RN compat issues

**Alternatives considered**:
- `react-native-toast-message` (popular, but extra dep + harder to customize)
- `react-native-snackbar` (Android-only flavor)
- `@gorhom/bottom-sheet` approach (overkill for a toast)

**Implementation sketch**:
```
ToastProvider (Context) → wraps NavigationContainer
useToast() hook → { showToast(type, message) }
<Toast /> component → Animated.View with translateY + opacity
```
The `Toast` renders at the root level, above all screens, so it is never blocked by ScrollView.

---

## R-002: Haptic feedback — expo-haptics

**Question**: `expo-haptics` is not currently in package.json. Is it compatible with Expo SDK 54?

**Decision**: Add `expo-haptics` — it is a first-party Expo SDK package fully compatible with SDK 54.

**Rationale**:
- `expo-haptics` is part of the Expo ecosystem and is already pre-linked when using `expo-dev-client`
- On Android, it maps to `Vibrator` / `VibrationEffect` API (API 26+); degrades gracefully on older Android (no crash)
- On iOS simulator, haptic calls are silently ignored — no effect, no crash
- API surface is minimal: `Haptics.impactAsync(ImpactFeedbackStyle.Light)` and `Haptics.notificationAsync(NotificationFeedbackType.Success)`

**Alternatives considered**:
- `react-native-haptic-feedback` (community lib, extra dep, less Expo-friendly)
- Manual `Vibration` from React Native core (no impact style support on iOS)

---

## R-003: Design token architecture

**Question**: File structure and naming convention for design tokens in the existing `src/` layout.

**Decision**: Create `src/theme/` directory with named token files.

**Rationale**:
- Consistent with the `src/theme/` recommendation in CLAUDE.md
- Separating colors, spacing, and typography enables tree-shaking and targeted imports
- A barrel `src/theme/index.ts` re-exports everything so screens import from one place: `import { Colors, Spacing } from '../theme'`

**Proposed structure**:
```
src/theme/
  colors.ts       — all color tokens (primitives + semantic aliases)
  typography.ts   — fontSize scale, fontWeight constants
  spacing.ts      — spacing scale based on 4px grid
  radius.ts       — border radius tokens
  shadows.ts      — iOS shadow + Android elevation pairs
  index.ts        — re-exports Colors, Typography, Spacing, Radius, Shadows
```

**Color token strategy**:
- **Primitive colors**: raw hex values with descriptive names (Blue500, Slate800, etc.)
- **Semantic aliases**: purpose-driven names that reference primitives (primary = Blue500, textPrimary = Slate800)
- Screens only import semantic tokens, never primitives directly

---

## R-004: Safe area — correct pattern

**Question**: What is the correct way to handle bottom padding for tab-bar-covered screens in react-native-safe-area-context v5?

**Decision**: Use `useSafeAreaInsets().bottom` combined with the tab bar height token.

**Rationale**:
- `useSafeAreaInsets()` from `react-native-safe-area-context` v5 returns the device's true insets
- Tab bar height is ~49pt (compact) + bottom inset — React Navigation exposes this via `useBottomTabBarHeight()` from `@react-navigation/bottom-tabs`
- Screens inside a tab navigator should use `useBottomTabBarHeight()` as their content bottom padding — this already includes the safe area inset
- Screens in stacks (without tab bar) use `useSafeAreaInsets().bottom` directly

**Pattern**:
```ts
// Inside a tab screen:
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
const tabBarHeight = useBottomTabBarHeight();
// use as: contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg }}

// Inside a stack screen (no tab bar):
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const { bottom } = useSafeAreaInsets();
// use as: contentContainerStyle={{ paddingBottom: bottom + Spacing.lg }}
```

---

## R-005: ScreenHeader component pattern

**Question**: How to build a shared header that works in both stack navigators and standalone usage?

**Decision**: Build a pure presentational `ScreenHeader` component; do NOT override React Navigation's built-in header (to avoid animation conflicts).

**Rationale**:
- The app uses `headerShown: false` on all stack navigators (confirmed from navigation files)
- Since native headers are already hidden, a custom presentational component is the right choice
- React Navigation's `headerShown: false` means we manage header ourselves — no conflict
- The component accepts `title`, optional `onBack`, optional `rightElement`
- Safe area top inset is handled inside `ScreenHeader` via `useSafeAreaInsets().top`

---

## R-006: Grouped Settings pattern

**Question**: Best implementation for grouped settings list on both iOS and Android?

**Decision**: Custom `SettingsSection` + `SettingsRow` components using standard View/TouchableOpacity — no third-party library.

**Rationale**:
- React Native's `SectionList` supports sections but has limited styling flexibility for grouped card appearance
- Custom components give full control over the card-with-rounded-corners grouped look
- Two small components (`SettingsSection` header wrapper, `SettingsRow` cell) are sufficient
- First and last rows in a section get top/bottom border radius respectively — handled via `isFirst`/`isLast` props

---

## R-007: HomeScreen CTA hierarchy

**Question**: How to reduce 5 CTA buttons to a clearer hierarchy?

**Decision**: Keep 2 primary visible CTAs ("Xem Bản Đồ" primary blue, "Lưu Lại" secondary green); move "Thêm Tọa Độ" inline with input row; keep "Sửa X&Y" and "Hoán đổi X↔Y" as secondary pair below coordinate list.

**Rationale**:
- Apple HIG recommends 1 primary CTA per screen, or at most 2 when both have equal importance to the user journey
- "Xem Bản Đồ" is the primary end-goal action — full-width, blue
- "Lưu Lại" is secondary but important — full-width, green (different color signals different category)
- "Thêm Tọa Độ" is a micro-action best placed as a `+` icon button adjacent to the new coordinate input row
- "Sửa X&Y" and "Hoán đổi X↔Y" are power-user actions — kept as compact secondary row, smaller visual weight
