# Data Model: Apple HIG UI/UX Improvements

**Feature**: 001-apple-hig-ui-ux  
**Date**: 2026-04-21

This feature introduces no new persisted data entities. It creates UI infrastructure components and a design token system.

---

## Design Token Entities

### ColorTokens

Purpose: Single source of truth for all colors in the app.

```
ColorTokens (src/theme/colors.ts)
├── Primitives (internal, not imported directly by screens)
│   ├── Blue500: '#007AFF'
│   ├── Green500: '#34C759'
│   ├── Red500: '#FF3B30'
│   ├── Orange500: '#F97316'
│   ├── Slate50: '#F8FAFC'
│   ├── Slate100: '#F1F5F9'
│   ├── Slate200: '#E2E8F0'
│   ├── Slate300: '#CBD5E1'
│   ├── Slate400: '#94A3B8'
│   ├── Slate500: '#64748B'
│   ├── Slate600: '#475569'
│   ├── Slate700: '#334155'
│   ├── Slate800: '#1E293B'
│   ├── Gray50: '#F2F2F7'        — iOS system grouped background
│   ├── Gray200: '#E5E5EA'       — iOS separator
│   ├── Gray400: '#8E8E93'       — iOS secondary label
│   ├── Gray600: '#6E6E73'       — iOS tertiary label
│   ├── Gray900: '#1C1C1E'       — iOS label (dark)
│   └── White: '#FFFFFF'
│
└── Semantic (used by all screens)
    ├── primary: Blue500
    ├── primaryLight: '#F0F7FF'
    ├── success: Green500
    ├── danger: Red500
    ├── warning: Orange500
    ├── background: Slate50        — screen background
    ├── surface: White             — card/modal background
    ├── surfaceSecondary: Slate100 — input/tag background
    ├── border: Slate200
    ├── separator: Gray200
    ├── textPrimary: Slate800
    ├── textSecondary: Slate500
    ├── textTertiary: Slate400
    ├── textOnPrimary: White
    └── overlay: 'rgba(0,0,0,0.5)'
```

### SpacingTokens

Purpose: 4px base grid for consistent layout rhythm.

```
SpacingTokens (src/theme/spacing.ts)
├── xs:  4
├── sm:  8
├── md:  12
├── lg:  16
├── xl:  20
├── xxl: 24
├── xxxl: 32
└── section: 40
```

### TypographyTokens

Purpose: Consistent font scale matching iOS Dynamic Type categories.

```
TypographyTokens (src/theme/typography.ts)
├── fontSizes
│   ├── xs:    11  — caption2
│   ├── sm:    12  — caption1
│   ├── md:    14  — subheadline / footnote
│   ├── base:  16  — body
│   ├── lg:    17  — headline
│   ├── xl:    20  — title3
│   ├── xxl:   24  — title2
│   └── xxxl:  28  — title1 / largeTitle
│
└── fontWeights
    ├── regular: '400'
    ├── medium:  '500'
    ├── semibold:'600'
    └── bold:    '700'
```

### RadiusTokens

```
RadiusTokens (src/theme/radius.ts)
├── xs:   4
├── sm:   8
├── md:   12
├── lg:   16
├── xl:   20
├── xxl:  24
└── full: 9999
```

---

## UI Component Entities

### Toast

Purpose: Non-blocking overlay notification that auto-dismisses.

```
Toast state (managed by ToastContext)
├── visible: boolean
├── type: 'success' | 'error' | 'info'
├── message: string
├── duration: number (default 2500ms)
└── animatedY: SharedValue<number>   — reanimated shared value

ToastConfig (passed to showToast)
├── type: 'success' | 'error' | 'info'
├── message: string
└── duration?: number
```

State transitions:
```
hidden → show (animatedY: -80 → 0, opacity: 0 → 1) → visible → auto-hide after duration 
                                                                  OR swipe-up dismiss
visible → hide (animatedY: 0 → -80, opacity: 1 → 0) → hidden
```

### ScreenHeader

Purpose: Reusable navigation header component.

```
ScreenHeader props
├── title: string               — displayed in center
├── onBack?: () => void         — if provided, renders back chevron on left
├── rightElement?: ReactNode    — optional right slot (icon button, text button)
└── transparent?: boolean       — if true, background is transparent (for MapScreen)
```

Layout:
```
[safe area top inset]
[  ← back   |   Title   |  rightElement  ]  height: 44pt
[border bottom]
```

### SettingsSection

Purpose: Grouped section wrapper for SettingsScreen.

```
SettingsSection props
├── title?: string    — section header label (optional for first section without label)
└── children: ReactNode

SettingsRow props
├── icon?: ReactNode
├── label: string
├── value?: string          — right-side value text (e.g., app version)
├── onPress?: () => void    — if provided, row is touchable with chevron
├── isFirst: boolean        — controls top border radius
├── isLast: boolean         — controls bottom border radius + no bottom separator
├── destructive?: boolean   — renders label in danger color (for "Xóa cache" etc.)
└── rightElement?: ReactNode — custom right slot (Toggle, etc.)
```
