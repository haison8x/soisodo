# Implementation Plan: Tái cấu trúc vị trí quảng cáo và Reward Ads Logic

**Branch**: `002-ads-placement-refactor` | **Date**: 2026-04-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-ads-placement-refactor/spec.md`

## Summary

Tái cấu trúc hệ thống quảng cáo AdMob: (1) tập trung tất cả ad unit IDs vào file constants duy nhất với đúng IDs theo platform Android/iOS, (2) tạo `AdFreeService` singleton thay thế các async premium checks rải rác, (3) thêm rewarded ad trong Settings để user nhận miễn quảng cáo 72h, (4) thêm rewarded ad prompt trên màn hình Sổ đỏ với điều kiện >10 sổ và throttle 10 phút, (5) sửa iOS ad IDs bị sai trong codebase hiện tại.

## Technical Context

**Language/Version**: TypeScript strict — React Native 0.81, Expo SDK 54  
**Primary Dependencies**: `react-native-google-mobile-ads ^16.0.3`, `react-native-iap ^14.7.11`, `@react-native-async-storage/async-storage`  
**Storage**: AsyncStorage (local device) — keys mới: `ad_free_until`, `sodo_rewarded_last_prompt`; key hiện có: `is_premium`, `saved_projects`  
**Testing**: Jest + RNTL  
**Target Platform**: iOS 15+ và Android (web: graceful no-op)  
**Project Type**: Mobile app  
**Performance Goals**: Ad gate check < 5ms (sync read từ in-memory cache sau initialize)  
**Constraints**: Zero ads cho premium users, web platform không crash, iOS/Android IDs riêng biệt  
**Scale/Scope**: 2 file mới (service + hook + constants), 4 file sửa đổi

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Ghi chú |
|------|--------|---------|
| TDD (Red-Green-Refactor) | ✅ PASS | `AdFreeService` và `useRewardedAd` sẽ có unit test viết trước |
| TypeScript strict | ✅ PASS | Không dùng `any`; `AdUnitsMap` và `AdFreeState` typed đầy đủ |
| Cross-platform iOS+Android | ✅ PASS | `Platform.select()` cho mỗi ad unit ID trong constants |
| UI tiếng Việt | ✅ PASS | Mọi string UI mới bằng tiếng Việt có dấu |
| Apple Design Philosophy — Deference | ✅ PASS | Rewarded prompt là bottom sheet nhẹ nhàng, không auto-play |
| Web graceful fallback | ✅ PASS | `AdFreeService` và hooks return no-op khi `Platform.OS === 'web'` |
| Premium users zero ads | ✅ PASS | `AdFreeService.isAdSuppressed()` làm gate duy nhất, kiểm tra trước mọi ad load |

**Post-design re-check**: Không có vi phạm mới sau Phase 1. Không cần Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-ads-placement-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 ✅
├── data-model.md        # Phase 1 ✅
├── contracts/           # Phase 1 ✅
│   ├── AdFreeService.md
│   └── useRewardedAd.md
└── tasks.md             # Phase 2 — /speckit.tasks command
```

### Source Code (repository root)

```text
src/
├── constants/
│   └── adUnits.ts              # NEW — tất cả ad unit IDs theo platform (fix iOS IDs sai)
├── services/
│   └── AdFreeService.ts        # NEW — singleton: premium check + 72h period + throttle
├── hooks/
│   ├── useRewardedAd.ts        # NEW — RewardedAd lifecycle, earned vs dismissed
│   ├── useInterstitialAd.ts    # MODIFY — import từ adUnits.ts thay vì hardcode
│   └── (useAdStatus.ts)        # không cần — AdFreeService đủ
├── components/
│   └── AdBanner.tsx            # MODIFY — import từ adUnits.ts, dùng AdFreeService
├── screens/
│   ├── SettingsScreen.tsx      # MODIFY — thêm row rewarded ad 72h (chỉ free tier)
│   └── SoDoScreen.tsx          # MODIFY — thêm rewarded prompt (>10 sổ, throttle 10min)
└── App.tsx                     # MODIFY — thêm AdFreeService.initialize()

tests/
├── unit/
│   ├── AdFreeService.test.ts   # NEW — unit tests cho service
│   └── useRewardedAd.test.ts   # NEW — unit tests cho hook
```

**Structure Decision**: Single project, React Native mobile app. Theo CLAUDE.md: `services/` cho business logic, `hooks/` cho React integration, `constants/` cho configuration values.
