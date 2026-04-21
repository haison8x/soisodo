<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Modified principles: Added VI. Apple Design Philosophy
Added sections: none
Removed sections: none
...
-->

# Hiến pháp Dự án: SoiToaDoVN

Ứng dụng định vị sổ đỏ trên bản đồ, dành cho người dùng Việt Nam.

## Nguyên tắc Cốt lõi

### I. Thuần Việt

Toàn bộ văn bản người dùng nhìn thấy (UI, thông báo, tài liệu sản phẩm) phải
bằng tiếng Việt có dấu, đúng chính tả. Tên biến, log kỹ thuật không thuộc
phạm vi này.

### II. Test-Driven Development (NON-NEGOTIABLE)

Mọi thay đổi logic tuân theo chu trình Red-Green-Refactor: viết test trước,
test thất bại trước, rồi mới viết code sản phẩm. PR chỉ có code sản phẩm mà
không có test tương ứng sẽ bị từ chối.

### III. Clean Code

Code phải rõ ràng, tự giải thích, trách nhiệm đơn (SRP), đặt tên theo domain.
Tránh magic number/string, hàm dài, file dài, và import sâu giữa các module.

### IV. Type Safety & Lint Pass

Mọi PR phải vượt qua type check và ESLint trước khi merge. Không dùng `any`,
`@ts-ignore`, hay `eslint-disable` trừ khi có lý do được document inline và
được review approve.

### V. Cross-Platform (iOS + Android)

Mọi tính năng phải chạy đầy đủ trên cả iOS và Android với cùng hành vi
nghiệp vụ. Codebase là một, không fork riêng nền tảng trừ khi bất khả kháng.

### VI. Apple Design Philosophy (Triết lý Thiết kế Apple)

Giao diện người dùng (UI/UX) phải tuân thủ chặt chẽ triết lý thiết kế của Apple (Human Interface Guidelines):
- **Clarity (Sự rõ ràng):** Chữ viết sắc nét, biểu tượng minh họa rõ ý, giao diện có khoảng nghỉ hợp lý.
- **Deference (Sự tôn trọng):** Giao diện phải làm nổi bật nội dung chính (bản đồ, dữ liệu thửa đất), không tranh giành sự chú ý của người dùng.
- **Depth (Chiều sâu):** Sử dụng các hiệu ứng lớp (layers), độ mờ (transparency) và chuyển động mượt mà để thể hiện cấu trúc và phản hồi tương tác.
- **Tính cao cấp:** Tránh các màu sắc loè loẹt, ưu tiên tone màu trung tính, tinh tế và fonts chữ hệ thống (San Francisco/Roboto).

## Ràng buộc Công nghệ

- **Framework:** React Native thông qua Expo SDK.
- **Ngôn ngữ:** TypeScript strict cho toàn bộ application code.
- **Package manager:** `pnpm` (duy nhất; không dùng npm/yarn).
- **Target:** iOS + Android.

## Quy trình Phát triển

Các gate bắt buộc pass trước khi merge:

1. `pnpm typecheck` — zero error.
2. `pnpm lint` — zero error, zero warning.
3. `pnpm test` — toàn bộ test pass, bao gồm test mới/sửa cho thay đổi logic.

## Quản trị

Hiến pháp này đứng trên mọi tài liệu phát triển khác; khi xung đột, Hiến
pháp thắng. Sửa đổi qua PR riêng kèm lý do. Phiên bản theo semantic:

- **MAJOR**: xoá hoặc định nghĩa lại không tương thích một nguyên tắc.
- **MINOR**: thêm nguyên tắc hoặc mở rộng đáng kể.
- **PATCH**: làm rõ ngôn từ, không đổi ngữ nghĩa.

**Version**: 1.1.0 | **Ratified**: 2026-04-21 | **Last Amended**: 2026-04-21
