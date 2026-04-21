# CLAUDE.md

Hướng dẫn dành cho AI coding agent (Claude Code, Cursor, Copilot...) khi làm
việc trên codebase **SoiToaDoVN** — Ứng dụng Định vị Sổ đỏ Việt Nam.

> File này KHÔNG thay thế `.specify/memory/constitution.md`. Khi có xung đột,
> Hiến pháp thắng. File này chỉ nêu các quy ước vận hành hằng ngày mà agent
> nên áp dụng.

---

## 1. Tóm tắt dự án

- **Mục đích:** Giúp người dùng Việt Nam chụp, OCR, và định vị sổ đỏ (giấy
  chứng nhận quyền sử dụng đất) trên bản đồ, hoạt động cả khi offline.
- **Platform:** iOS + Android (primary), Web (best-effort).
- **Tech stack:** React Native (Expo SDK 54) + TypeScript strict + pnpm +
  Firebase + MapLibre + ML Kit.
- **Triết lý:** Thuần Việt UX, Offline-first, TDD, Clean Code, GIS đúng chuẩn.

## 2. Stack kỹ thuật (theo `package.json` hiện tại)

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Language | TypeScript (strict) | Cần bổ sung `typescript` vào devDeps nếu chưa có |
| Framework | Expo SDK 54 + RN 0.81 + React 19 | Managed + `expo-dev-client` |
| Runtime dev | `expo-dev-client` | **KHÔNG** Expo Go (đã có native modules) |
| Package manager | **pnpm** | Không dùng npm/yarn |
| Navigation | React Navigation (stack + bottom-tabs) | Không trộn Expo Router |
| Map | `@maplibre/maplibre-react-native` | Vector tile, hỗ trợ offline |
| GIS | `proj4` | Chuyển VN-2000 ↔ WGS84 |
| Backend / Auth | `firebase` v12 | Auth + Firestore + Storage |
| Local storage (nhẹ) | `@react-native-async-storage/async-storage` | Metadata, settings |
| Local storage (nặng) | `expo-file-system` | Ảnh scan, tile cache |
| Secure storage | `expo-secure-store` | **Cần thêm** cho PII |
| OCR | `@react-native-ml-kit/text-recognition` | On-device, KHÔNG gửi cloud |
| Image picker | `expo-image-picker` | |
| Location | `expo-location` | |
| IDs | `nanoid` + `react-native-get-random-values` | Dùng `nanoid` cho `correlationId` |
| UI primitives | `react-native-svg`, `lucide-react-native`, `react-native-reanimated` v4, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens` | |
| List nâng cao | `react-native-draggable-flatlist` | |
| Utils | `lodash` | Chỉ named import |
| Monetization | `react-native-google-mobile-ads`, `react-native-iap` | Cấu hình ẩn danh |
| Web | `react-native-web` + `react-dom` | Best-effort |
| Test | Jest + RNTL + Detox | **Cần thêm vào devDeps** |
| Lint | ESLint (typescript-eslint, react, react-hooks, react-native, import, unicorn) | **Cần thêm** |
| Format | Prettier | **Cần thêm** |
| Logging | Wrapper nội bộ | Levels: debug, info, warn, error |
| Crash | Firebase Crashlytics hoặc Sentry | Bắt buộc PII scrubbing |

Thay đổi stack phải qua ADR (`docs/adr/NNN-*.md`) và cập nhật Hiến pháp.

## 3. Cấu trúc thư mục đề xuất

```text
src/
├── api/                # Các hàm gọi Firebase / Firestore / Backend
├── assets/             # Hình ảnh, icon, font, vector layer địa chính
├── components/         # UI Components dùng chung (Atoms, Molecules, Organisms)
├── features/           # Các module chức năng chính (Domain-driven)
│   ├── parcel/         # Thông tin thửa đất & ranh giới
│   ├── owner/          # Quản lý chủ sở hữu, thông tin liên hệ
│   ├── plot/           # Quản lý sổ đỏ: danh sách, chi tiết, lưu trữ
│   ├── ocr/            # Nhận diện chữ: xử lý ảnh, trích xuất text
│   ├── map/            # Hiển thị bản đồ: Tile management, GIS logic, VN-2000
│   └── auth/           # Đăng nhập, profile, phân quyền
├── hooks/              # Custom hooks dùng chung (useLocation, useAppState...)
├── i18n/               # Đa ngôn ngữ (ưu tiên vi.json)
├── navigation/         # Cấu hình React Navigation (Stacks, Tabs)
├── services/           # Hạ tầng kỹ thuật (StorageService, ProjectionService)
├── theme/              # Design tokens (colors, spacing, typography)
├── types/              # Global types & interfaces
└── utils/              # Tiện ích tính toán thuần túy (date, format, math)
```

## 4. Lệnh chuẩn (pnpm)

`package.json` hiện tại đã có:
```bash
pnpm start        # expo start
pnpm android      # expo run:android
pnpm ios          # expo run:ios
pnpm web          # expo start --web
```

**Các script sau PHẢI được bổ sung** (Claude nên thêm ngay khi có cơ hội):
```bash
# Chất lượng — gate trước commit
pnpm typecheck          # tsc --noEmit
pnpm lint               # eslint .
pnpm lint:fix           # eslint . --fix
pnpm format             # prettier --write .
pnpm format:check       # prettier --check .
pnpm test               # jest
pnpm test:watch         # jest --watch
pnpm test:coverage      # jest --coverage (≥80% lines / ≥75% branches)

```

## 5. Quy trình làm việc với Claude (TDD bắt buộc)

## 6. Quy tắc UX tiếng Việt (Nguyên tắc I)

- **Không hard-code string tiếng Anh trong JSX.** Dùng
  `const { t } = useTranslation()` với key trong `src/i18n/locales/vi.json`.
- **Thuật ngữ pháp lý chuẩn:**
  - "toạ độ VN-2000", "hệ quy chiếu VN-2000" khi nhắc CRS nội địa.
- **Định dạng:**
  - Ngày: `dd/MM/yyyy`. Ví dụ `21/04/2026`.
- **Tone giọng:** lịch sự, trung tính; xưng hô "Bạn" / "Quý khách" thống
  nhất toàn app.

## 7. Khi gặp tình huống không rõ

Theo thứ tự ưu tiên:

1. Kiểm tra `.specify/memory/constitution.md`.
2. Hỏi người dùng bằng câu hỏi cụ thể.

*File này là tài liệu sống. Cập nhật khi stack hoặc quy ước thay đổi, nhưng
luôn đảm bảo đồng bộ với `.specify/memory/constitution.md`.*
