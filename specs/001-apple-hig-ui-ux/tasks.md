# Tasks: Cải tiến UI/UX theo triết lý Apple HIG

**Input**: Design documents from `/specs/001-apple-hig-ui-ux/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅  
**Tests**: TDD bắt buộc theo Constitution Principle II — test tasks được bao gồm cho mọi component mới  
**Organization**: Tasks nhóm theo user story để mỗi story có thể implement và test độc lập

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Có thể chạy song song (file khác nhau, không phụ thuộc nhau)
- **[Story]**: User story tương ứng (US1–US6)
- File path đầy đủ trong mỗi task

---

## Phase 1: Setup

**Purpose**: Cài đặt dependency mới và tạo cấu trúc thư mục

- [X] T001 Thêm `expo-haptics` vào dependencies trong `package.json` và chạy `pnpm install`
- [X] T002 Tạo thư mục `src/theme/` và `src/components/shared/` và `tests/components/`

---

## Phase 2: Foundational — Design Token System

**Purpose**: Tạo toàn bộ design token files — **BẮT BUỘC hoàn thành trước khi bắt đầu bất kỳ User Story nào**

**⚠️ CRITICAL**: Mọi screen migration (US1–US6) đều phụ thuộc vào phase này

- [X] T003 [P] Tạo `src/theme/colors.ts` — ColorTokens primitives (Blue500, Slate800, Gray50...) và semantic aliases (primary, background, surface, textPrimary, textSecondary, success, danger, border, separator, overlay) theo data-model.md
- [X] T004 [P] Tạo `src/theme/spacing.ts` — SpacingTokens theo 4px grid: xs(4), sm(8), md(12), lg(16), xl(20), xxl(24), xxxl(32), section(40)
- [X] T005 [P] Tạo `src/theme/typography.ts` — TypographyTokens: fontSizes (xs:11 → xxxl:28) và fontWeights (regular/medium/semibold/bold) theo data-model.md
- [X] T006 [P] Tạo `src/theme/radius.ts` — RadiusTokens: xs(4), sm(8), md(12), lg(16), xl(20), xxl(24), full(9999)
- [X] T007 [P] Tạo `src/theme/shadows.ts` — ShadowTokens: mỗi level gồm iOS shadow props và Android elevation tương đương (sm, md, lg)
- [X] T008 Tạo `src/theme/index.ts` — re-export Colors, Spacing, Typography, Radius, Shadows từ các file trên (phụ thuộc T003–T007)
- [X] T009 Chạy `pnpm typecheck` — xác nhận toàn bộ theme module compile không lỗi

**Checkpoint**: `src/theme/index.ts` export đúng, typecheck pass → có thể bắt đầu các User Story

---

## Phase 3: User Story 1 — Nhất quán màu sắc toàn ứng dụng (Priority: P1) 🎯 MVP

**Goal**: Thay thế toàn bộ hex literal hard-code bằng semantic token từ `src/theme/colors.ts`

**Independent Test**: `grep -r "'#[A-Fa-f0-9]\{3,8\}'" src/ --include="*.tsx" --include="*.ts"` trả về 0 kết quả (ngoại trừ `src/theme/colors.ts`)

### Implementation US1

- [X] T010 [P] [US1] Migrate màu trong `src/components/HomeScreen/CityModal.tsx`, `CitySelector.tsx`, `ProjectTitleInput.tsx` — thay hex bằng `Colors.*`
- [X] T011 [P] [US1] Migrate màu trong `src/components/HomeScreen/CoordinateRow.tsx`, `CoordinateEditModal.tsx`, `SaveProjectModal.tsx` — thay hex bằng `Colors.*`
- [X] T012 [P] [US1] Migrate màu trong `src/components/AdBanner.tsx` và `src/components/shared/` (nếu có style) — thay hex bằng `Colors.*`
- [X] T013 [P] [US1] Migrate màu trong `src/screens/HomeScreen.tsx` — thay toàn bộ hex trong `StyleSheet.create()` bằng `Colors.*`, `Spacing.*`, `Radius.*`
- [X] T014 [P] [US1] Migrate màu trong `src/screens/SoDoScreen.tsx` và `src/screens/PlanningScreen.tsx`
- [X] T015 [P] [US1] Migrate màu trong `src/screens/VN2000Screen.tsx` và `src/screens/ConvertGoogleScreen.tsx`
- [X] T016 [P] [US1] Migrate màu trong `src/screens/SettingsScreen.tsx`
- [X] T017 [P] [US1] Migrate màu trong `src/screens/MapScreen.tsx` (giữ nguyên màu overlay glassmorphism, chỉ migrate màu solid)
- [X] T018 [P] [US1] Migrate màu trong `src/screens/settings/AppInfoScreen.tsx`, `UserManualScreen.tsx`, `TermsScreen.tsx`, `PrivacyScreen.tsx`
- [X] T019 [US1] Chạy `grep -r "'#[A-Fa-f0-9]" src/ --include="*.tsx" --include="*.ts" | grep -v "theme/colors"` — xác nhận output rỗng (phụ thuộc T010–T018)

**Checkpoint**: SC-001 đạt — 0 hex literal ngoài `colors.ts`. Toàn bộ screen vẫn render đúng màu.

---

## Phase 4: User Story 2 — Header điều hướng nhất quán (Priority: P1)

**Goal**: Xây dựng `ScreenHeader` component dùng chung, áp dụng cho 6 màn hình

**Independent Test**: Mở ConvertGoogleScreen, AppInfoScreen, UserManualScreen — cả 3 có header cùng chiều cao, font size, vị trí nút back

### Tests US2 (TDD — viết trước khi implement) ⚠️

- [X] T020 [P] [US2] Viết test `tests/components/ScreenHeader.test.tsx` — test render với title, render nút back khi có `onBack`, không render nút back khi thiếu `onBack`, render `rightElement`, transparent mode → xác nhận test FAIL trước khi implement

### Implementation US2

- [X] T021 [US2] Implement `src/components/shared/ScreenHeader.tsx` — props: title, onBack?, rightElement?, transparent? — xử lý safe area top inset qua `useSafeAreaInsets()` — pass T020 tests (phụ thuộc T020)
- [X] T022 [P] [US2] Áp dụng `ScreenHeader` vào `src/screens/ConvertGoogleScreen.tsx` — xóa header custom hiện tại, dùng `<ScreenHeader title="Vị trí trên bản đồ" onBack={navigation.goBack} />`
- [X] T023 [P] [US2] Áp dụng `ScreenHeader` vào `src/screens/settings/AppInfoScreen.tsx`, `UserManualScreen.tsx`
- [X] T024 [P] [US2] Áp dụng `ScreenHeader` vào `src/screens/settings/TermsScreen.tsx`, `PrivacyScreen.tsx`
- [X] T025 [US2] Chuẩn hóa header của `src/screens/SettingsScreen.tsx` — dùng `ScreenHeader` hoặc style giống nhau (phụ thuộc T021)

**Checkpoint**: SC-002 đạt — 1 component `ScreenHeader` tái sử dụng. 6 màn hình header đồng nhất.

---

## Phase 5: User Story 3 — Thông báo không chặn (Priority: P2) + User Story 6 — Safe Area (Priority: P2)

**Goal US3**: Thay `Alert.alert('Thành công',...)` bằng toast tự ẩn  
**Goal US6**: Xóa `paddingBottom: 220` hardcode, dùng safe area thực

**Independent Test US3**: Lưu dự án từ HomeScreen → không có Alert popup, banner hiện từ trên xuống rồi tự ẩn sau ~2.5s  
**Independent Test US6**: Cuộn xuống cuối HomeScreen trên iPhone SE và iPhone 15 Pro — nút cuối visible trên cả hai

### Tests US3 (TDD — viết trước) ⚠️

- [X] T026 [P] [US3] Viết test `tests/components/Toast.test.tsx` — test render success/error/info types, auto-dismiss sau duration, swipe-dismiss, replace khi gọi lại → xác nhận test FAIL

### Implementation US3

- [X] T027 [US3] Implement `src/components/shared/ToastProvider.tsx` — `ToastContext`, animated banner (reanimated `withTiming`), 3 types, swipe-up gesture dismiss, duration timer — pass T026 (phụ thuộc T026)
- [X] T028 [US3] Implement `src/hooks/useToast.ts` — export `useToast(): { showToast(options) }` — lấy từ ToastContext (phụ thuộc T027)
- [X] T029 [US3] Wire `<ToastProvider>` vào `App.tsx` — wrap ngoài `<NavigationContainer>` (phụ thuộc T027)
- [X] T030 [P] [US3] Thay `Alert.alert('Thành công', 'Đã lưu dự án thành công!')` bằng `showToast({ type: 'success', message: 'Đã lưu dự án thành công!' })` trong `src/screens/HomeScreen.tsx` và `src/screens/MapScreen.tsx` (phụ thuộc T028)
- [X] T031 [P] [US3] Thay 2 `Alert.alert('Thành công',...)` trong `src/screens/SettingsScreen.tsx` (IAP success, clear cache success) bằng `showToast` (phụ thuộc T028)

### Implementation US6

- [X] T032 [P] [US6] Sửa `src/screens/HomeScreen.tsx` — thay `paddingBottom: 220` bằng `useBottomTabBarHeight()` từ `@react-navigation/bottom-tabs` + `Spacing.lg`
- [X] T033 [P] [US6] Sửa `src/screens/SettingsScreen.tsx` và `src/screens/SoDoScreen.tsx` — thay `paddingBottom: 220` bằng `useBottomTabBarHeight() + Spacing.lg`
- [X] T034 [P] [US6] Sửa `src/screens/PlanningScreen.tsx` và `src/screens/VN2000Screen.tsx` — thay magic padding bằng safe-area-aware value
- [X] T035 [US6] Sửa `src/screens/MapScreen.tsx` và `src/screens/ConvertGoogleScreen.tsx` — thay `bottom: 320` hardcode trong `sideControls` bằng `useSafeAreaInsets().bottom + Spacing.xxl * N`

**Checkpoint**: SC-003 đạt (0 success Alert). SC-004 đạt (0 magic padding). Banner tự ẩn, layout đúng trên mọi kích thước máy.

---

## Phase 6: User Story 4 — SettingsScreen Grouped List (Priority: P2)

**Goal**: Tái cấu trúc SettingsScreen thành grouped sections theo Apple HIG

**Independent Test**: Mở tab Cài đặt → thấy ít nhất 3 section với header label và card border radius

### Tests US4 (TDD — viết trước) ⚠️

- [X] T036 [P] [US4] Viết test `tests/components/SettingsSection.test.tsx` — test render với title, render rows, isFirst/isLast border radius, destructive style, chevron khi có onPress → xác nhận test FAIL

### Implementation US4

- [X] T037 [US4] Implement `src/components/shared/SettingsSection.tsx` — export `SettingsSection` (section wrapper với title) và `SettingsRow` (cell với icon, label, value, chevron, isFirst/isLast radius) — pass T036 (phụ thuộc T036)
- [X] T038 [US4] Tái cấu trúc `src/screens/SettingsScreen.tsx` — chia thành 3+ sections dùng `SettingsSection`/`SettingsRow`: (1) Mua hàng, (2) Ứng dụng, (3) Hỗ trợ — xóa custom list style hiện tại (phụ thuộc T037)

**Checkpoint**: SettingsScreen có grouped layout với 3+ sections. Rows có correct border radius đầu/cuối nhóm.

---

## Phase 7: User Story 5 — Haptic Feedback (Priority: P3)

**Goal**: Thêm haptic response cho các nút CTA chính

**Independent Test**: Nhấn "Lưu Lại" trên thiết bị vật lý — cảm nhận rung nhẹ

### Implementation US5

- [X] T039 [P] [US5] Tạo `src/utils/haptics.ts` — wrapper `triggerImpact(style?: ImpactFeedbackStyle)` và `triggerSuccess()` dùng `expo-haptics`, bọc trong try-catch để degrade gracefully
- [X] T040 [P] [US5] Thêm `triggerImpact()` vào nút "Lưu Lại" và "Xem Bản Đồ" trong `src/screens/HomeScreen.tsx`
- [X] T041 [P] [US5] Thêm `triggerImpact()` vào nút "Chuyển đổi sang WGS84" trong `src/screens/VN2000Screen.tsx`
- [X] T042 [P] [US5] Thêm `triggerSuccess()` sau khi lưu dự án thành công trong `src/screens/HomeScreen.tsx` và `src/screens/MapScreen.tsx` (gọi cùng lúc với `showToast`)

**Checkpoint**: CTA buttons trên thiết bị vật lý có haptic response. Không crash trên Android/simulator.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: HomeScreen CTA hierarchy + verification cuối cùng

- [X] T043 [P] Redesign CTA layout trong `src/screens/HomeScreen.tsx` — "Xem Bản Đồ" full-width primary (màu `Colors.primary`), "Lưu Lại" full-width secondary (màu `Colors.success`) bên dưới, nút "Thêm Tọa Độ" chuyển thành icon `+` inline cạnh input row, "Sửa X&Y" và "Hoán đổi X↔Y" giữ nguyên nhưng compact style nhỏ hơn
- [X] T044 [P] Kiểm tra typography consistency — dùng `Typography.fontSizes.*` và `Typography.fontWeights.*` thay các `fontSize`/`fontWeight` literal còn sót trong màn hình chưa migrate
- [ ] T045 Chạy `pnpm typecheck` — zero errors
- [ ] T046 Chạy `pnpm lint` — zero errors, zero warnings (phụ thuộc T045)
- [ ] T047 Manual test iOS: điều hướng toàn bộ 11 màn hình, lưu dự án, mở bản đồ, xem settings — chụp screenshot trước/sau để confirm visual improvement
- [ ] T048 Manual test Android: lặp lại T047 trên Android emulator/device — xác nhận không có layout vỡ, màu sắc đúng
- [ ] T049 Xác nhận SC-001 đến SC-004 bằng lệnh grep (xem quickstart.md) — output rỗng cho cả 4 metrics
- [ ] T050 Commit final với message mô tả đầy đủ 6 user stories đã hoàn thành

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Không phụ thuộc — bắt đầu ngay
- **Phase 2 (Foundational)**: Phụ thuộc Phase 1 — **BLOCK tất cả User Story**
- **Phase 3 (US1)**: Phụ thuộc Phase 2 (tokens phải có trước khi migrate)
- **Phase 4 (US2)**: Phụ thuộc Phase 2; có thể chạy song song với Phase 3
- **Phase 5 (US3+US6)**: Phụ thuộc Phase 2; US3 phụ thuộc Phase 2 và cần `App.tsx` sạch từ Phase 3/4
- **Phase 6 (US4)**: Phụ thuộc Phase 3 (tokens) và Phase 4 (ScreenHeader style)
- **Phase 7 (US5)**: Phụ thuộc Phase 1 (expo-haptics installed) — có thể làm sau Phase 3
- **Phase 8 (Polish)**: Phụ thuộc tất cả phase trước

### User Story Dependencies

- **US1 (P1 — token migration)**: Start sau Phase 2
- **US2 (P1 — ScreenHeader)**: Start sau Phase 2, song song với US1
- **US3 (P2 — Toast)**: Start sau Phase 2; `ToastProvider` cần wire vào App.tsx sau US1/US2 ổn định
- **US6 (P2 — Safe Area)**: Start sau Phase 2, song song với US3
- **US4 (P2 — Settings grouped)**: Start sau US1 (cần tokens)
- **US5 (P3 — Haptic)**: Start sau Phase 1, song song với US2/US3

### Parallel Opportunities

- T003–T007 (token files): chạy song song hoàn toàn
- T010–T018 (color migration): chạy song song theo từng screen/component
- T022–T024 (áp dụng ScreenHeader): song song với nhau
- T030–T031 (replace Alert): song song
- T032–T034 (safe area): song song
- T039–T042 (haptic): song song

---

## Parallel Example: Phase 2 — Foundation

```
Task T003: src/theme/colors.ts
Task T004: src/theme/spacing.ts
Task T005: src/theme/typography.ts
Task T006: src/theme/radius.ts
Task T007: src/theme/shadows.ts
→ tất cả 5 tasks có thể làm song song
→ sau đó T008 (index.ts) mới được làm
```

## Parallel Example: Phase 3 — US1 Color Migration

```
Task T010: components/HomeScreen/*.tsx (3 files)
Task T011: components/HomeScreen/Coordinate*.tsx (3 files)
Task T013: screens/HomeScreen.tsx
Task T014: screens/SoDoScreen + PlanningScreen
Task T015: screens/VN2000Screen + ConvertGoogleScreen
Task T016: screens/SettingsScreen
Task T017: screens/MapScreen
Task T018: screens/settings/*.tsx
→ tất cả 8 tasks chạy song song
```

---

## Implementation Strategy

### MVP (P1 Stories — US1 + US2)

1. Phase 1: Setup (T001–T002)
2. Phase 2: Foundation tokens (T003–T009)
3. Phase 3: US1 — color migration (T010–T019)
4. Phase 4: US2 — ScreenHeader (T020–T025)
5. **STOP & VALIDATE**: App nhất quán màu sắc, header đồng nhất
6. Deploy internal build

### Incremental Delivery

- **Build 1** (US1+US2): Nhất quán visual, header chuẩn
- **Build 2** (US3+US6): Toast thay Alert, layout không bị che
- **Build 3** (US4): Settings grouped
- **Build 4** (US5+Polish): Haptic + CTA hierarchy cải thiện

### Metrics Verification Commands

```bash
# SC-001: Hex literals còn lại
grep -r "'#[A-Fa-f0-9]\{3,8\}'" src/ --include="*.tsx" --include="*.ts" | grep -v "theme/colors"

# SC-003: Success alerts còn lại
grep -rn "Alert.alert('Thành công'" src/

# SC-004: Magic padding còn lại
grep -rn "paddingBottom: 220\|paddingBottom: 200\|paddingBottom: 180" src/
```

---

## Notes

- `[P]` tasks = file khác nhau, không phụ thuộc nhau — có thể làm đồng thời
- TDD bắt buộc: T020, T026, T036 phải viết và FAIL trước khi implement component tương ứng
- `src/theme/colors.ts` là file DUY NHẤT được phép chứa hex literal sau US1
- Commit sau mỗi phase hoàn thành để dễ review và rollback
- Không thay đổi logic nghiệp vụ — chỉ thay đổi style và component structure
