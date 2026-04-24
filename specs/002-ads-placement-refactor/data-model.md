# Data Model: Tái cấu trúc vị trí quảng cáo và Reward Ads Logic

**Branch**: 002-ads-placement-refactor | **Date**: 2026-04-24

---

## Entities

### AdUnits (compile-time constants)

Không lưu trữ. Chọn platform lúc compile-time bằng `Platform.select()`.

| Field | Type | Android ID | iOS ID |
|-------|------|-----------|--------|
| `banner` | `string` | `ca-app-pub-8386795729138351/5993605118` | `ca-app-pub-8386795729138351/7987829516` |
| `appOpen` | `string` | `ca-app-pub-8386795729138351/6888167193` | `ca-app-pub-8386795729138351/3605731374` |
| `rewarded` | `string` | `ca-app-pub-8386795729138351/1847234719` | `ca-app-pub-8386795729138351/5361666173` |
| `nativeAdvanced` | `string` | `ca-app-pub-8386795729138351/4122403052` | `ca-app-pub-8386795729138351/4918813042` |
| `rewardedInterstitial` | `string` | `ca-app-pub-8386795729138351/2809321388` | `ca-app-pub-8386795729138351/6231894714` |
| `interstitial` | `string` | `ca-app-pub-8386795729138351/97412784` | `ca-app-pub-8386795729138351/6674747843` |

> Trong `__DEV__` mode: mỗi field dùng `TestIds.*` tương ứng thay vì production ID.

---

### AdFreeStatus (in-memory cache + AsyncStorage)

Kiểm soát toàn bộ logic hiển thị quảng cáo của user.

| Field | In-memory type | AsyncStorage key | Giá trị lưu |
|-------|---------------|-----------------|-------------|
| `isPremium` | `boolean` | `is_premium` | `'true'` / `'false'` |
| `adFreeUntil` | `number` | `ad_free_until` | Timestamp ms dạng string |

**Derived fields (không lưu trữ)**:
- `isAdFreePeriodActive = adFreeUntil > Date.now()`
- `isAdSuppressed = isPremium || isAdFreePeriodActive`

**State transitions**:

```
[Trạng thái ban đầu]: isPremium=false, adFreeUntil=0
  → Mua IAP premium     : isPremium=true, isAdSuppressed=true (vĩnh viễn)
  → Xem rewarded ad     : adFreeUntil=now+72h, isAdSuppressed=true (tạm thời)
  → Hết hạn 72h         : adFreeUntil < now, isAdFreePeriodActive=false
  → Premium hết hạn (N/A): premium là one-time purchase, không expire
```

---

### RewardedAdPromptRecord (AsyncStorage)

Kiểm soát tần suất prompt rewarded ad trên màn hình Sổ đỏ.

| Field | AsyncStorage key | Giá trị lưu | Mô tả |
|-------|-----------------|-------------|-------|
| `lastPromptTimestamp` | `sodo_rewarded_last_prompt` | Timestamp ms dạng string | Lần cuối prompt hiển thị |

**Validation rule**: Chỉ hiển thị prompt mới nếu `Date.now() - lastPromptTimestamp > 600_000` (10 phút)

**Khởi tạo**: Nếu key không tồn tại → `0` → điều kiện `Date.now() - 0 > 600_000` luôn `true` → prompt ngay

---

## AsyncStorage Key Registry (toàn bộ)

| Key | Owner | Giá trị | Mô tả |
|-----|-------|---------|-------|
| `is_premium` | `AdFreeService`, `SettingsScreen` | `'true'` / `'false'` | Premium IAP status |
| `ad_free_until` | `AdFreeService` | `string` (number ms) | Hết hạn 72h rewarded period |
| `sodo_rewarded_last_prompt` | `AdFreeService` | `string` (number ms) | Timestamp lần cuối prompt Sổ đỏ |
| `saved_projects` | `SoDoScreen`, `HomeScreen` | JSON string | Danh sách sổ đỏ *(existing)* |

---

## TypeScript Types

```typescript
// src/constants/adUnits.ts
export type AdUnitKey =
  | 'banner'
  | 'appOpen'
  | 'rewarded'
  | 'nativeAdvanced'
  | 'rewardedInterstitial'
  | 'interstitial';

export type AdUnitsMap = Record<AdUnitKey, string>;

// src/services/AdFreeService.ts
export interface AdFreeState {
  isPremium: boolean;
  adFreeUntil: number; // ms timestamp, 0 = none
}
```
