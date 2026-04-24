# Contract: useRewardedAd

**File**: `src/hooks/useRewardedAd.ts`  
**Role**: Hook quản lý lifecycle của một `RewardedAd` instance, phân biệt reward earned vs dismissed.

---

## Interface

```typescript
interface UseRewardedAdOptions {
  adUnitId: string;
}

interface UseRewardedAdReturn {
  /** Hiển thị quảng cáo. Gọi onRewarded chỉ khi user xem đủ (EARNED_REWARD). */
  showAd: (onRewarded: () => void, onDismissed?: () => void) => void;
  /** true khi ad đã load xong và sẵn sàng hiển thị */
  isLoaded: boolean;
}

function useRewardedAd(adUnitId: string): UseRewardedAdReturn;
```

---

## Behaviour Constraints

1. `onRewarded` chỉ được gọi khi `RewardedAdEventType.EARNED_REWARD` fire TRƯỚC `AdEventType.CLOSED`.
2. `onDismissed` được gọi khi user đóng quảng cáo MÀ KHÔNG earn reward.
3. Nếu `isLoaded === false` khi `showAd()` được gọi: gọi `onDismissed?.()` ngay, KHÔNG chờ load.
4. Hook tự preload ad sau mỗi lần close (sẵn sàng cho lần tiếp theo).
5. Hook KHÔNG check `AdFreeService.isAdSuppressed()` — caller có trách nhiệm guard.
6. Cleanup listeners khi component unmount.

---

## Internal State Machine

```
[IDLE] → load() → [LOADING] → LOADED event → [READY]
  [READY] → showAd() → [SHOWING]
    [SHOWING] → EARNED_REWARD → earnedFlag=true
    [SHOWING] → CLOSED:
      if earnedFlag: onRewarded(), earnedFlag=false
      else: onDismissed?.()
      → load() → [LOADING]
  [SHOWING] → AD_FAILED: onDismissed?.(), load() → [LOADING]
```

---

## Usage

```typescript
// src/screens/SettingsScreen.tsx
const { showAd, isLoaded } = useRewardedAd(AD_UNITS.rewarded);

const handleWatchAd = () => {
  if (AdFreeService.isAdSuppressed()) return;
  showAd(
    async () => {
      // Earned reward
      await AdFreeService.grantAdFree();
      showToast('Bạn đã được miễn quảng cáo trong 72 giờ!', 'success');
    },
    () => {
      showToast('Bạn cần xem hết quảng cáo để nhận thưởng.', 'info');
    }
  );
};

// src/screens/SoDoScreen.tsx
const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);

// Trong useFocusEffect, sau khi check throttle:
showRewardedAd(
  async () => { await AdFreeService.grantAdFree(); },
  () => {} // user dismissed — không penalize
);
```
