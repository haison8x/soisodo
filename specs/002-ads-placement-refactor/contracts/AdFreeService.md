# Contract: AdFreeService

**File**: `src/services/AdFreeService.ts`  
**Role**: Module-level singleton. Quản lý toàn bộ trạng thái ad suppression (premium + 72h period).

---

## Interface

```typescript
namespace AdFreeService {
  /** Gọi 1 lần trong App.tsx trước khi render. Load AsyncStorage vào memory cache. */
  function initialize(): Promise<void>;

  /** true nếu user đã mua premium IAP */
  function isPremium(): boolean;

  /** true nếu đang trong period miễn quảng cáo 72h (và chưa expire) */
  function isAdFreePeriodActive(): boolean;

  /** isPremium() || isAdFreePeriodActive() — gate chính cho mọi ad logic */
  function isAdSuppressed(): boolean;

  /** Milliseconds còn lại của 72h period. 0 nếu không active hoặc isPremium */
  function getAdFreeRemainingMs(): number;

  /** Ghi adFreeUntil = now + durationMs vào AsyncStorage và update cache.
   *  Không ghi nếu isPremium() === true (không cần thiết). */
  function grantAdFree(durationMs?: number): Promise<void>; // default: 72 * 3600 * 1000

  /** Re-read AsyncStorage vào cache. Gọi sau khi premium status thay đổi. */
  function refreshFromStorage(): Promise<void>;

  /** Đọc timestamp lần cuối prompt Sổ đỏ. 0 nếu chưa có. */
  function getSodoLastPromptMs(): Promise<number>;

  /** Ghi timestamp hiện tại làm lần cuối prompt Sổ đỏ. */
  function saveSodoLastPromptMs(): Promise<void>;
}
```

---

## Behaviour Constraints

1. `isAdSuppressed()` PHẢI return `true` khi `isPremium() === true`, bất kể 72h period.
2. `grantAdFree()` KHÔNG ghi AsyncStorage nếu `isPremium() === true`.
3. `initialize()` idempotent — gọi nhiều lần không có side effect thêm.
4. `getAdFreeRemainingMs()` luôn return `0` khi `isPremium() === true`.
5. `isAdFreePeriodActive()` check real-time `Date.now() < adFreeUntil` — không cache booleans.
6. Tất cả sync reads (`isPremium`, `isAdSuppressed`, etc.) PHẢI return consistent values sau `initialize()`.

---

## Usage

```typescript
// App.tsx — gọi một lần lúc start
await AdFreeService.initialize();

// Trong bất kỳ component/hook nào
if (AdFreeService.isAdSuppressed()) return; // skip ad

// Sau khi premium mua thành công (SettingsScreen)
await AsyncStorage.setItem('is_premium', 'true');
await AdFreeService.refreshFromStorage();

// Sau khi user earn reward
await AdFreeService.grantAdFree(); // 72h mặc định
```

---

## Error Handling

- AsyncStorage failures trong `initialize()`: log warning, default về `{ isPremium: false, adFreeUntil: 0 }` (safe — chỉ mất period, không crash)
- AsyncStorage failures trong `grantAdFree()`: throw error → caller (Settings screen) hiển thị toast lỗi
- Parse failures (NaN): treat as `0` → không active
