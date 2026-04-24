# Research: Tái cấu trúc vị trí quảng cáo và Reward Ads Logic

**Branch**: 002-ads-placement-refactor | **Date**: 2026-04-24

---

## 1. RewardedAd API — react-native-google-mobile-ads v16

**Decision**: Dùng `RewardedAd.createForAdRequest()` với listener pattern (tương tự `InterstitialAd` hiện có trong codebase)

**Rationale**:
- API của `RewardedAd` nhất quán với `InterstitialAd` đã được dùng — cùng `.load()`, `.show()`, `.addAdEventListener()` pattern
- Event `RewardedAdEventType.EARNED_REWARD` chỉ fire khi user xem đủ → đây là trigger duy nhất để ghi nhận 72h ad-free (không fire khi user bỏ ngang)
- Event `AdEventType.CLOSED` fire trong mọi trường hợp đóng quảng cáo → dùng để detect "user bỏ ngang"
- Pattern singleton ad instance (như `useInterstitialAd.ts` hiện tại) phù hợp với preloading

**Alternatives considered**:
- `useRewardedAd` hook từ thư viện: available nhưng ít kiểm soát hơn, khó phân biệt earned vs dismissed
- `RewardedInterstitialAd`: dùng làm fallback khi rewarded không fill được — cùng event API

**Key API pattern**:
```typescript
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const ad = RewardedAd.createForAdRequest(
  __DEV__ ? TestIds.REWARDED : AD_UNITS.rewarded,
  { requestNonPersonalizedAdsOnly: true }
);

// Listeners
ad.addAdEventListener(RewardedAdEventType.LOADED, () => setLoaded(true));
ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (_reward) => {
  earnedFlag = true; // set flag, check in CLOSED handler
});
ad.addAdEventListener(AdEventType.CLOSED, () => {
  if (earnedFlag) { onRewarded(); earnedFlag = false; }
  else { onDismissed?.(); }
  setLoaded(false);
  ad.load(); // preload next
});

ad.load(); // preload on init
```

---

## 2. Ad-Free Period Persistence

**Decision**: Lưu timestamp hết hạn (`ad_free_until`) vào AsyncStorage dưới dạng số ms (string)

**Rationale**:
- Không cần dependency mới — AsyncStorage đã có trong codebase
- Lưu timestamp *kết thúc* (không phải bắt đầu) → check đơn giản: `Date.now() < adFreeUntil`
- Đọc một lần lúc app khởi động, cache trong memory → check sync sau đó

**Implementation approach**:
```typescript
// Ghi khi user earn reward:
const until = Date.now() + 72 * 60 * 60 * 1000;
await AsyncStorage.setItem('ad_free_until', String(until));

// Check:
const raw = await AsyncStorage.getItem('ad_free_until');
const until = raw ? Number(raw) : 0;
const isActive = until > Date.now();
```

**Edge cases handled**:
- `null` trong storage → `0` → không active
- `NaN` sau parse → không active (falsy check `isNaN`)
- Period expire trong khi app bật → `isAdFreePeriodActive()` check real-time

---

## 3. Platform-Specific Ad ID Selection

**Decision**: File `src/constants/adUnits.ts` duy nhất, dùng `Platform.select()` cho từng ad unit

**Rationale**:
- Pattern đã tồn tại trong `AdBanner.tsx` và `useInterstitialAd.ts` → nhất quán
- Một file duy nhất → thay đổi ID chỉ sửa 1 chỗ
- `as const` đảm bảo TypeScript strict typing
- Fallback `TestIds.*` trong `__DEV__` → không cần ifdef ở mọi nơi dùng

**Correction từ codebase hiện tại**:
- `AdBanner.tsx` line 9: iOS ID sai — đang dùng Android ID `5993605118` thay vì `7987829516`
- `useInterstitialAd.ts` line 9: iOS ID sai — đang dùng `9741278432` (không hợp lệ) thay vì `6674747843`
- Cả hai sẽ được fix khi migrate sang constants

---

## 4. AdFreeService — Centralized Premium Gate

**Decision**: Module-level singleton service với in-memory cache, không dùng React Context

**Rationale**:
- Mỗi component hiện tại tự đọc AsyncStorage trong `useEffect` → nhiều async reads cho cùng data
- Module singleton: `initialize()` gọi 1 lần trong `App.tsx` → mọi nơi sau đó dùng sync reads
- Không cần React Context vì không cần re-render reactivity — ad gate là fire-and-forget

**Alternatives considered**:
- React Context: overhead không cần thiết, ad status không cần trigger re-render toàn cây
- Zustand/Redux: quá phức tạp cho use case này

---

## 5. SoDoScreen Rewarded Prompt — Throttle Mechanism

**Decision**: Check throttle trong `useFocusEffect` sau khi `loadProjects()` resolve

**Rationale**:
- `useFocusEffect` đã có trong SoDoScreen → không cần thêm lifecycle hook
- Check `projects.length > 10` sau load → có data trước khi quyết định
- Lưu timestamp lần cuối prompt vào AsyncStorage (key: `sodo_rewarded_last_prompt`)
- Ghi timestamp ngay khi *hiển thị* prompt, không phải khi user xem xong → bảo vệ chắc chắn hơn

**Flow**:
```
useFocusEffect →
  loadProjects() →
    if projects.length > 10 AND !AdFreeService.isAdSuppressed():
      lastPrompt = await AdFreeService.getSodoLastPromptMs()
      if Date.now() - lastPrompt > 10 * 60 * 1000:
        await AdFreeService.saveSodoLastPromptMs()
        showRewardedPromptDialog()
```

---

## 6. Web Platform Handling

**Decision**: Guard với `Platform.OS !== 'web'` ở service level và component level

**Rationale**:
- `react-native-google-mobile-ads` không hoạt động trên web
- Hiện tại `SettingsScreen.tsx` đã có pattern này cho `react-native-iap`:
  ```typescript
  const safeInitConnection = !isWeb ? RNIap.initConnection : async () => false;
  ```
- Áp dụng cùng pattern cho ads: export no-op functions khi `Platform.OS === 'web'`
