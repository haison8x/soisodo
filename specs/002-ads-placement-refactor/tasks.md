# Tasks: Tái cấu trúc vị trí quảng cáo và Reward Ads Logic

**Input**: Design documents from `/specs/002-ads-placement-refactor/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: TDD bắt buộc theo Constitution (Nguyên tắc II — NON-NEGOTIABLE). Test viết trước, fail trước, rồi mới implement.

**Organization**: Tasks nhóm theo user story để mỗi story có thể implement và test độc lập.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không có dependency)
- **[Story]**: User story liên quan (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tạo nền tảng constants trước khi bất kỳ logic ads nào được implement.

- [x] T001 Create `src/constants/adUnits.ts` với tất cả 6 ad unit IDs × 2 platform (Android/iOS) + constants `AD_FREE_DURATION_MS`, `SODO_REWARDED_THROTTLE_MS`, `SODO_REWARDED_MIN_COUNT`
- [x] T002 [P] Create `tests/unit/` directory với placeholder `README.md` để chuẩn bị cho test files

---

## Phase 2: Foundation (Blocking Prerequisites)

**Purpose**: `AdFreeService` là dependency cốt lõi — PHẢI hoàn thành trước khi bất kỳ user story nào có thể implement.

**⚠️ CRITICAL**: Không story nào được bắt đầu cho đến khi Phase 2 hoàn tất.

- [x] T003 Write unit tests (RED) cho `AdFreeService` trong `tests/unit/AdFreeService.test.ts` — cover: `initialize()` với empty storage, `isPremium()` true/false, `isAdFreePeriodActive()` active/expired, `isAdSuppressed()` combinations, `grantAdFree()` ghi đúng AsyncStorage, `refreshFromStorage()` cập nhật cache
- [x] T004 Implement `src/services/AdFreeService.ts` — make T003 tests PASS (GREEN): module singleton với in-memory cache, đọc `is_premium` + `ad_free_until` từ AsyncStorage trong `initialize()`, tất cả sync reads từ cache sau initialize, `grantAdFree()` không ghi nếu isPremium
- [x] T005 Update `App.tsx` — gọi `await AdFreeService.initialize()` trước khi render app (sau `mobileAds().initialize()`)

**Checkpoint**: Foundation ready — AdFreeService hoạt động, cache initialized. Có thể bắt đầu các user stories.

---

## Phase 3: User Story 3 — Premium Users Zero Ads (Priority: P1) 🎯 MVP

**Goal**: Đảm bảo 100% user premium không thấy bất kỳ quảng cáo nào ở bất kỳ màn hình nào.

**Independent Test**: Đăng nhập account premium → điều hướng qua tất cả màn hình → xác nhận không có quảng cáo nào tải hoặc hiển thị.

### Tests cho User Story 3 ⚠️ VIẾT TRƯỚC — PHẢI FAIL TRƯỚC KHI IMPLEMENT

- [x] T006 [P] [US3] Write unit test (RED) cho `AdBanner` trong `tests/unit/AdBanner.test.tsx` — test: render null khi `isAdSuppressed()` = true, render BannerAd khi = false, dùng `AD_UNITS.banner` làm unitId
- [x] T007 [P] [US3] Write unit test (RED) cho `useInterstitialAd` trong `tests/unit/useInterstitialAd.test.ts` — test: `showAd` gọi `onComplete` ngay lập tức khi `isAdSuppressed()` = true, dùng `AD_UNITS.interstitial`

### Implementation cho User Story 3

- [x] T008 [US3] Update `src/components/AdBanner.tsx` — thay hardcoded ID và AsyncStorage check bằng `AD_UNITS.banner` và `AdFreeService.isAdSuppressed()` (GREEN — make T006 pass); sửa iOS ID bug (line 9: `7987829516`)
- [x] T009 [US3] Update `src/hooks/useInterstitialAd.ts` — thay hardcoded ID và AsyncStorage check bằng `AD_UNITS.interstitial` và `AdFreeService.isAdSuppressed()` (GREEN — make T007 pass); sửa iOS ID bug (line 9: `6674747843`)

**Checkpoint**: US3 complete — premium users thấy zero ads. AdBanner và interstitial đều dùng centralized IDs (US4 partially done).

---

## Phase 4: User Story 1 — Settings Rewarded Ad 72h (Priority: P1)

**Goal**: Free tier users có thể xem rewarded ad trong Settings để nhận miễn quảng cáo 72h.

**Independent Test**: Free user → Settings → nhấn "Xem quảng cáo miễn 72h" → xem hết quảng cáo → xác nhận không còn quảng cáo trong 72h; xác nhận timer đếm ngược hiển thị đúng trong Settings.

### Tests cho User Story 1 ⚠️ VIẾT TRƯỚC — PHẢI FAIL TRƯỚC KHI IMPLEMENT

- [x] T010 [US1] Write unit tests (RED) cho `useRewardedAd` trong `tests/unit/useRewardedAd.test.ts` — cover: `onRewarded` chỉ gọi khi EARNED_REWARD + CLOSED cả hai; `onDismissed` gọi khi chỉ CLOSED; `onDismissed` gọi ngay khi `isLoaded = false`; preload sau close
- [x] T011 [P] [US1] Write unit tests (RED) cho Settings rewarded row trong `tests/unit/SettingsScreen.test.tsx` — test: row không hiển thị khi `isAdSuppressed()` = true; row hiển thị khi free tier + no active period; timer text hiển thị đúng remaining time

### Implementation cho User Story 1

- [x] T012 [US1] Implement `src/hooks/useRewardedAd.ts` — (GREEN — make T010 pass): `RewardedAd.createForAdRequest(AD_UNITS.rewarded)`, `earnedFlag` boolean pattern để phân biệt EARNED_REWARD vs dismiss, preload sau close, cleanup listeners on unmount
- [x] T013 [US1] Update `src/screens/SettingsScreen.tsx` — thêm section "Quảng cáo" (sau section "Hỗ trợ") với row "Xem quảng cáo để miễn quảng cáo 72 giờ" chỉ khi `!AdFreeService.isAdSuppressed()`; gọi `useRewardedAd(AD_UNITS.rewarded)`; `onRewarded` → `AdFreeService.grantAdFree()` + toast thành công; `onDismissed` → toast nhắc xem hết (GREEN — make T011 pass)
- [x] T014 [US1] Update `src/screens/SettingsScreen.tsx` — thêm row hiển thị thời gian còn lại khi `isAdFreePeriodActive()` = true (format: "Miễn quảng cáo: còn Xh Ym"); refresh display mỗi phút qua `setInterval` trong `useEffect`

**Checkpoint**: US1 complete — Settings rewarded ad flow hoạt động end-to-end, 72h period được ghi nhận.

---

## Phase 5: User Story 2 — SoDoScreen Rewarded Prompt (Priority: P2)

**Goal**: Users có hơn 10 sổ thấy rewarded ad prompt khi mở màn hình Sổ đỏ, tối đa 1 lần / 10 phút.

**Independent Test**: Account 11+ sổ → mở SoDoScreen → xác nhận prompt xuất hiện → đóng + mở lại sau < 10 phút → xác nhận KHÔNG có prompt; account ≤ 10 sổ → không bao giờ thấy prompt.

### Tests cho User Story 2 ⚠️ VIẾT TRƯỚC — PHẢI FAIL TRƯỚC KHI IMPLEMENT

- [x] T015 [US2] Write unit tests (RED) — mở rộng `tests/unit/AdFreeService.test.ts` để cover `getSodoLastPromptMs()` trả 0 khi chưa có; `saveSodoLastPromptMs()` ghi đúng key `sodo_rewarded_last_prompt`
- [x] T016 [P] [US2] Write unit tests (RED) cho SoDoScreen throttle logic trong `tests/unit/SoDoScreen.test.tsx` — test: prompt không hiển thị khi `projects.length <= 10`; prompt không hiển thị khi `isAdSuppressed()` = true; prompt không hiển thị khi `Date.now() - lastPrompt < 10min`; prompt hiển thị khi tất cả điều kiện thỏa (>10 sổ, không suppressed, >10min)

### Implementation cho User Story 2

- [x] T017 [US2] Update `src/services/AdFreeService.ts` — thêm `getSodoLastPromptMs()` và `saveSodoLastPromptMs()` (GREEN — make T015 pass)
- [x] T018 [US2] Update `src/screens/SoDoScreen.tsx` — trong `useFocusEffect` sau `loadProjects()`: if `projects.length > SODO_REWARDED_MIN_COUNT && !AdFreeService.isAdSuppressed()`: check throttle qua `getSodoLastPromptMs()` → nếu đủ 10 phút: `saveSodoLastPromptMs()` rồi gọi `showRewardedAd`; dùng `useRewardedAd(AD_UNITS.rewarded)`; `onRewarded` → `AdFreeService.grantAdFree()` (GREEN — make T016 pass)

**Checkpoint**: US2 complete — SoDoScreen rewarded prompt hoạt động đúng với tất cả conditions.

---

## Phase 6: User Story 4 — Verification & Cleanup (Priority: P2)

**Goal**: Xác nhận 100% ad unit IDs đều đến từ `adUnits.ts`, không có hardcode nào còn sót.

**Independent Test**: Đọc `adUnits.ts` và xác nhận đủ 6 loại × 2 platform; grep codebase không tìm thấy `ca-app-pub-` ngoài file constants.

- [x] T019 [P] [US4] Grep codebase xác nhận không có string `ca-app-pub-` hardcoded ngoài `src/constants/adUnits.ts` — sửa nếu tìm thấy
- [x] T020 [P] [US4] Verify `src/constants/adUnits.ts` có đủ 6 fields, đúng TypeScript type `as const`, và `__DEV__` fallback đúng cho từng `TestIds.*`

**Checkpoint**: US4 complete — centralized IDs verified, codebase sạch.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Chất lượng code và platform edge cases.

- [x] T021 [P] Run `pnpm typecheck` — xác nhận zero TypeScript errors trên tất cả files đã sửa
- [x] T022 [P] Run `pnpm lint` — xác nhận zero ESLint errors/warnings
- [x] T023 Web platform: verify `AdFreeService.isAdSuppressed()` trả `true` trên `Platform.OS === 'web'` (hoặc ads không load — app không crash)
- [x] T024 [P] Edge case: verify `AdFreeService.initialize()` không throw khi AsyncStorage có giá trị NaN hoặc null cho `ad_free_until`
- [x] T025 Review `src/screens/SettingsScreen.tsx` — xác nhận section quảng cáo tuân thủ Apple Design Philosophy: không tranh sự chú ý, tone màu nhất quán với theme, khoảng cách hợp lý

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Không dependency — bắt đầu ngay
- **Foundation (Phase 2)**: Phụ thuộc Phase 1 — BLOCKS tất cả user stories
- **US3 (Phase 3)**: Phụ thuộc Phase 2 — ưu tiên cao nhất sau Foundation
- **US1 (Phase 4)**: Phụ thuộc Phase 2 — có thể chạy song song với US3 (file khác nhau)
- **US2 (Phase 5)**: Phụ thuộc Phase 2 + cần `useRewardedAd` từ US1 (Phase 4)
- **US4 (Phase 6)**: Phụ thuộc Phase 3 (AdBanner/useInterstitialAd đã dùng constants)
- **Polish (Final)**: Phụ thuộc tất cả user stories complete

### User Story Dependencies

- **US3 (P1)**: Chỉ cần Phase 2 (AdFreeService) — độc lập với US1/US2
- **US1 (P1)**: Chỉ cần Phase 2 (AdFreeService) — có thể chạy song song US3
- **US2 (P2)**: Cần US1 hoàn thành (dùng `useRewardedAd` hook)
- **US4 (P2)**: Xác nhận sau US3 — không blocking

### Trong mỗi User Story

1. Viết test (RED) → xác nhận test FAIL
2. Implement code (GREEN) → xác nhận test PASS
3. Refactor nếu cần
4. Commit và chuyển task tiếp theo

---

## Parallel Example: Phase 3 (US3)

```text
# Có thể chạy song song sau Phase 2:
Task T006: Write unit test cho AdBanner
Task T007: Write unit test cho useInterstitialAd

# Sau T006 + T007 xong (cả hai fail), chạy song song:
Task T008: Implement AdBanner update
Task T009: Implement useInterstitialAd update
```

## Parallel Example: Phase 4 (US1)

```text
# Có thể chạy song song:
Task T010: Write tests cho useRewardedAd
Task T011: Write tests cho SettingsScreen rewarded row

# Sau T010 xong:
Task T012: Implement useRewardedAd

# Sau T011 + T012 xong:
Task T013: Update SettingsScreen (depends on hook)
Task T014: Update SettingsScreen timer display
```

---

## Implementation Strategy

### MVP First (US3 + US4 foundation only)

1. Phase 1: Setup → `adUnits.ts`
2. Phase 2: Foundation → `AdFreeService` + `App.tsx`
3. Phase 3: US3 → premium gate fix + iOS ID bug fix
4. **STOP và VALIDATE**: Premium users verified zero ads
5. Deploy — đây là bản fix quan trọng nhất

### Incremental Delivery

1. Phase 1+2 → Foundation (invisible to users)
2. Phase 3 → Fix premium gate + iOS IDs (bug fix release)
3. Phase 4 → Settings 72h feature (new feature release)
4. Phase 5 → SoDoScreen prompt (feature release)
5. Phase 6+Polish → Cleanup (internal)

### Parallel Team Strategy (nếu có 2 dev)

- Sau Phase 2 hoàn thành:
  - Dev A: Phase 3 (US3 — premium gate)
  - Dev B: Phase 4 US1 tests (T010, T011) + implement useRewardedAd (T012)
- Sau Phase 3 và T012 xong:
  - Dev A: Phase 4 T013/T014 (Settings screen update)
  - Dev B: Phase 5 (US2 — SoDoScreen)

---

## Notes

- [P] tasks = file khác nhau, không dependency với nhau
- TDD mandatory: test task phải hoàn thành và FAIL trước implementation task cùng story
- Mỗi Checkpoint là điểm kiểm tra độc lập — có thể demo/deploy sau mỗi checkpoint
- Bug fix: iOS ad IDs được fix tự động trong T008/T009 (không cần task riêng)
- `useRewardedAd` hook được chia sẻ bởi US1 (Settings) và US2 (SoDoScreen) — implement 1 lần trong US1, tái sử dụng trong US2
