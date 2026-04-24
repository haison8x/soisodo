# Quickstart: Ads Placement Refactor

**Branch**: `002-ads-placement-refactor`

## Mục tiêu nhanh

Sau bước này, developer biết đúng các file cần tạo/sửa và thứ tự triển khai.

## Thứ tự triển khai (dependency order)

```
1. src/constants/adUnits.ts          ← base, không dependency
2. src/services/AdFreeService.ts     ← dùng AsyncStorage
3. src/hooks/useRewardedAd.ts        ← dùng adUnits.ts
4. App.tsx                           ← gọi AdFreeService.initialize()
5. src/components/AdBanner.tsx       ← dùng adUnits.ts + AdFreeService
6. src/hooks/useInterstitialAd.ts    ← dùng adUnits.ts + AdFreeService
7. src/screens/SettingsScreen.tsx    ← dùng useRewardedAd + AdFreeService
8. src/screens/SoDoScreen.tsx        ← dùng useRewardedAd + AdFreeService
```

## File 1: `src/constants/adUnits.ts` (NEW)

```typescript
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  banner: Platform.select({
    android: 'ca-app-pub-8386795729138351/5993605118',
    ios: 'ca-app-pub-8386795729138351/7987829516',
  }) ?? TestIds.BANNER,
  appOpen: Platform.select({
    android: 'ca-app-pub-8386795729138351/6888167193',
    ios: 'ca-app-pub-8386795729138351/3605731374',
  }) ?? TestIds.APP_OPEN,
  rewarded: Platform.select({
    android: 'ca-app-pub-8386795729138351/1847234719',
    ios: 'ca-app-pub-8386795729138351/5361666173',
  }) ?? TestIds.REWARDED,
  nativeAdvanced: Platform.select({
    android: 'ca-app-pub-8386795729138351/4122403052',
    ios: 'ca-app-pub-8386795729138351/4918813042',
  }) ?? TestIds.NATIVE,
  rewardedInterstitial: Platform.select({
    android: 'ca-app-pub-8386795729138351/2809321388',
    ios: 'ca-app-pub-8386795729138351/6231894714',
  }) ?? TestIds.REWARDED_INTERSTITIAL,
  interstitial: Platform.select({
    android: 'ca-app-pub-8386795729138351/97412784',
    ios: 'ca-app-pub-8386795729138351/6674747843',
  }) ?? TestIds.INTERSTITIAL,
} as const;

export const AD_FREE_DURATION_MS = 72 * 60 * 60 * 1000;
export const SODO_REWARDED_THROTTLE_MS = 10 * 60 * 1000;
export const SODO_REWARDED_MIN_COUNT = 10;
```

## File 2: `src/services/AdFreeService.ts` (NEW)

Xem contract chi tiết: [contracts/AdFreeService.md](./contracts/AdFreeService.md)

Core logic:
- `initialize()`: đọc AsyncStorage → cache `isPremium` + `adFreeUntil`
- `isAdSuppressed()`: sync check từ cache
- `grantAdFree()`: ghi `ad_free_until = now + 72h`
- `getSodoLastPromptMs()` / `saveSodoLastPromptMs()`: throttle helpers

## File 3: `src/hooks/useRewardedAd.ts` (NEW)

Xem contract chi tiết: [contracts/useRewardedAd.md](./contracts/useRewardedAd.md)

Key: dùng `earnedFlag` boolean để phân biệt `EARNED_REWARD` + `CLOSED` vs chỉ `CLOSED`.

## Các thay đổi sửa đổi

| File | Thay đổi |
|------|---------|
| `App.tsx` | Thêm `await AdFreeService.initialize()` trước render |
| `AdBanner.tsx` | Thay hardcoded ID → `AD_UNITS.banner`; thay AsyncStorage check → `AdFreeService.isAdSuppressed()` |
| `useInterstitialAd.ts` | Thay hardcoded ID → `AD_UNITS.interstitial`; thay AsyncStorage check → `AdFreeService.isAdSuppressed()` |
| `SettingsScreen.tsx` | Thêm row "Xem quảng cáo → miễn 72h" trong section Hỗ trợ (chỉ hiện khi free + không active period) |
| `SoDoScreen.tsx` | Trong `useFocusEffect`, sau `loadProjects`: nếu `projects.length > 10` + không suppressed + throttle OK → show rewarded prompt |

## Bugs cần fix (phát hiện trong research)

1. `AdBanner.tsx` line 9: iOS ID sai — `5993605118` (Android) thay vì `7987829516`
2. `useInterstitialAd.ts` line 9: iOS ID sai — `9741278432` (không hợp lệ) thay vì `6674747843`

## Test checklist nhanh

- [ ] `AdFreeService.initialize()` không throw khi AsyncStorage trống
- [ ] `isAdSuppressed()` = true sau `isPremium` = true
- [ ] `isAdSuppressed()` = true trong vòng 72h sau `grantAdFree()`
- [ ] `isAdSuppressed()` = false sau khi 72h hết
- [ ] `useRewardedAd` gọi `onRewarded` chỉ khi EARNED_REWARD + CLOSED
- [ ] `useRewardedAd` gọi `onDismissed` khi chỉ có CLOSED (không EARNED_REWARD)
- [ ] SoDoScreen: không show prompt khi `projects.length <= 10`
- [ ] SoDoScreen: không show prompt hai lần trong 10 phút
