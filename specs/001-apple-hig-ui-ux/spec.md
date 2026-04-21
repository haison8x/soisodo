# Feature Specification: Cải tiến UI/UX theo triết lý Apple HIG (cross-platform)

**Feature Branch**: `001-apple-hig-ui-ux`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "Phân tích UI của ứng dụng. Hãy đề xuất các cải tiến UI/UX để follow chặt chẽ triết lý design của Apple. Nhưng cũng đảm bảo đẹp trên Android"

## Bối cảnh

Ứng dụng SoiToaDoVN hiện có 7 màn hình chức năng cùng 4 màn hình cài đặt con. Sau khi chuyển sang TypeScript, codebase đã ổn định nhưng giao diện vẫn còn nhiều vấn đề nhất quán:

- Hơn 30 mã màu hex hard-code rải rác trong 28 file, không có hệ thống design token
- Mỗi màn hình tự dựng header riêng, không có component dùng chung
- `paddingBottom: 220` hard-code ở 5 màn hình thay vì dùng safe area thực
- Thông báo thành công dùng `Alert.alert()` — chặn luồng thao tác người dùng
- Không có haptic feedback
- SettingsScreen dạng danh sách phẳng, chưa theo grouped list pattern của Apple HIG
- 5 nút CTA xếp chồng ở HomeScreen gây nhiễu thị giác

---

## User Scenarios & Testing

### User Story 1 — Nhất quán màu sắc toàn ứng dụng (Priority: P1)

Người dùng mở bất kỳ màn hình nào và thấy màu sắc, kiểu chữ, khoảng cách đồng nhất — không có cảm giác "màn hình này trông khác màn hình kia".

**Why this priority**: Đây là nền tảng cho mọi cải tiến UI khác. Nếu không có design token thống nhất, mọi thay đổi về sau sẽ tạo ra thêm sự không nhất quán.

**Independent Test**: Mở lần lượt HomeScreen → SoDoScreen → SettingsScreen → VN2000Screen. Màu nền, màu chữ, màu nút primary, và divider đều giống nhau trên tất cả màn hình.

**Acceptance Scenarios**:

1. **Given** ứng dụng đang chạy, **When** người dùng điều hướng qua tất cả tab, **Then** màu nền, màu chữ, và màu accent nhất quán trên mọi màn hình
2. **Given** chế độ sáng (light mode), **When** người dùng xem bất kỳ màn hình nào, **Then** contrast ratio của văn bản trên nền đạt tối thiểu WCAG AA (4.5:1 cho body text)
3. **Given** thiết bị Android, **When** người dùng mở ứng dụng, **Then** màu sắc hiển thị chính xác như trên iOS

---

### User Story 2 — Header điều hướng nhất quán (Priority: P1)

Người dùng thấy mỗi màn hình có header cùng chiều cao, font chữ, màu sắc và bố cục. Nút back (nếu có) xuất hiện đúng vị trí theo platform.

**Why this priority**: Header là điểm neo thị giác đầu tiên khi vào màn hình. Sự không nhất quán hiện tại làm ứng dụng trông thiếu chuyên nghiệp.

**Independent Test**: Điều hướng vào ConvertGoogleScreen và SettingsScreen con (UserManual, AppInfo). Header đồng nhất về chiều cao, font title, và vị trí nút back.

**Acceptance Scenarios**:

1. **Given** màn hình con có nút back, **When** người dùng nhìn vào header, **Then** nút back nằm bên trái, tiêu đề căn giữa, cùng font size và weight trên mọi màn hình
2. **Given** màn hình tab root (HomeScreen, SoDoScreen...), **When** người dùng nhìn header, **Then** tiêu đề large title style theo Apple HIG hiển thị nhất quán
3. **Given** thiết bị Android, **When** người dùng nhấn nút back, **Then** hoạt động đúng với cả hardware back button của Android

---

### User Story 3 — Thông báo không chặn luồng thao tác (Priority: P2)

Sau khi lưu dự án thành công, người dùng thấy banner/toast xuất hiện rồi tự biến mất — không cần nhấn "OK" để tiếp tục.

**Why this priority**: Alert.alert() cho thông báo thành công buộc người dùng phải tương tác thêm 1 bước không cần thiết — vi phạm nguyên tắc "keep users in the flow" của Apple HIG.

**Independent Test**: Lưu một dự án từ HomeScreen. Thông báo thành công hiện lên và tự biến mất sau 2-3 giây mà không cần nhấn gì.

**Acceptance Scenarios**:

1. **Given** người dùng vừa lưu dự án thành công, **When** thao tác lưu hoàn tất, **Then** banner thành công hiện từ trên xuống, hiển thị 2-3 giây, rồi tự ẩn
2. **Given** có lỗi khi lưu, **When** thao tác thất bại, **Then** thông báo lỗi vẫn dùng Alert (lỗi cần người dùng xác nhận đã đọc)
3. **Given** banner đang hiện, **When** người dùng vuốt lên, **Then** banner biến mất ngay lập tức

---

### User Story 4 — SettingsScreen theo kiểu Grouped List (Priority: P2)

Người dùng mở tab Cài đặt và thấy giao diện nhóm section rõ ràng — mỗi nhóm có tiêu đề, các mục trong nhóm có viền bo tròn bao quanh, giống Settings native của iOS/Android.

**Why this priority**: Grouped list là pattern phổ biến nhất trong cả iOS lẫn Android cho màn hình cài đặt; người dùng đã quen với mental model này.

**Independent Test**: Mở tab Cài đặt. Nhìn thấy ít nhất 3 nhóm rõ ràng với header section và cell style nhất quán.

**Acceptance Scenarios**:

1. **Given** người dùng mở SettingsScreen, **When** màn hình load xong, **Then** các mục được nhóm thành ít nhất 3 section, mỗi section có label tiêu đề
2. **Given** mục cài đặt dẫn sang màn hình khác, **When** người dùng nhìn mục đó, **Then** có chevron (›) ở bên phải
3. **Given** màn hình Android, **When** người dùng xem SettingsScreen, **Then** grouped style hiển thị đúng với màu nền và divider phù hợp

---

### User Story 5 — Phản hồi xúc giác (Priority: P3)

Khi người dùng nhấn nút hành động chính, thiết bị rung nhẹ để xác nhận thao tác đã được nhận.

**Why this priority**: Haptic feedback tạo cảm giác "ứng dụng native chất lượng cao". P3 vì không ảnh hưởng chức năng nhưng nâng đáng kể perceived quality.

**Independent Test**: Nhấn nút "Lưu Lại" trên thiết bị vật lý (không phải simulator). Cảm nhận được rung nhẹ tức thì.

**Acceptance Scenarios**:

1. **Given** thiết bị hỗ trợ haptic, **When** người dùng nhấn CTA chính, **Then** thiết bị phản hồi haptic nhẹ (impact light)
2. **Given** thao tác thành công, **When** kết quả hiện ra, **Then** haptic notification success
3. **Given** thiết bị không hỗ trợ haptic (hoặc Android cũ), **When** người dùng nhấn nút, **Then** không có crash, hoạt động bình thường

---

### User Story 6 — Safe Area và layout không bị che khuất (Priority: P2)

Người dùng có thể thao tác với mọi nút và content mà không bị tab bar, notch, hoặc gesture bar che khuất.

**Why this priority**: 5 màn hình đang dùng `paddingBottom: 220` hardcode — sai trên nhiều kích thước máy, gây vùng trắng thừa trên máy nhỏ hoặc content bị che trên máy có notch lớn.

**Independent Test**: Cuộn xuống cuối HomeScreen trên iPhone SE, iPhone 15 Pro Max, và Android mid-range. Nút cuối luôn hiển thị đầy đủ và có thể bấm.

**Acceptance Scenarios**:

1. **Given** iPhone có Home Indicator, **When** người dùng cuộn xuống cuối danh sách, **Then** nút cuối không bị tab bar hoặc home indicator che
2. **Given** Android gesture navigation, **When** người dùng xem bất kỳ màn hình nào, **Then** content không bị gesture bar đáy che
3. **Given** MapScreen đang hiển thị, **When** người dùng nhìn các nút điều khiển bên phải, **Then** tất cả nút nằm trong safe area, không bị cắt

---

### Edge Cases

- Người dùng vừa cuộn danh sách vừa có banner thông báo xuất hiện → banner không đẩy content xuống (overlay, không chiếm layout)
- Màn hình nhỏ (320pt width, iPhone SE gen 1): grouped settings không bị tràn ngang
- Thiết bị Android không hỗ trợ haptic engine → không crash, degrade gracefully
- Người dùng xoay ngang màn hình → header và safe area vẫn hiển thị đúng
- Banner xuất hiện khi keyboard đang mở → banner hiện phía trên keyboard, không bị che

---

## Requirements

### Functional Requirements

- **FR-001**: Ứng dụng PHẢI có hệ thống design token tập trung (màu sắc, font size, spacing, border radius) được sử dụng nhất quán trên toàn bộ màn hình thay vì hard-code giá trị hex rải rác
- **FR-002**: Ứng dụng PHẢI có component ScreenHeader dùng chung, áp dụng cho tất cả màn hình có header điều hướng
- **FR-003**: Thông báo thành công (lưu dự án, copy tọa độ) PHẢI hiển thị dạng banner/toast tự ẩn, KHÔNG dùng Alert.alert() chặn
- **FR-004**: Thông báo lỗi và confirm dialogs vẫn ĐƯỢC PHÉP dùng Alert.alert()
- **FR-005**: SettingsScreen PHẢI tổ chức các mục cài đặt thành grouped sections với header label cho từng nhóm
- **FR-006**: Tất cả màn hình có scroll hoặc bottom content PHẢI tính toán bottom padding dựa trên safe area thực của thiết bị, không hard-code giá trị pixel
- **FR-007**: Các nút CTA chính (Lưu Lại, Xem Bản Đồ, Chuyển đổi sang WGS84) PHẢI kích hoạt haptic feedback khi nhấn trên thiết bị hỗ trợ
- **FR-008**: Mọi thay đổi UI PHẢI hiển thị đúng trên cả iOS (≥15) và Android (≥10), không có layout vỡ hoặc màu sắc lệch
- **FR-009**: Văn bản chính PHẢI đạt contrast ratio WCAG AA (4.5:1) trên nền của nó
- **FR-010**: HomeScreen PHẢI áp dụng CTA hierarchy rõ ràng: primary action nổi bật nhất, secondary actions nhỏ hơn — giảm số lượng nút cùng prominence từ 5 xuống còn tối đa 2

### Key Entities

- **Design Token**: Bộ giá trị thiết kế tập trung — màu (primary, background, surface, text-primary, text-secondary, success, danger, border), font scale, spacing (4px grid), border radius (sm/md/lg/full)
- **Toast/Banner**: Component thông báo overlay tự ẩn — type (success/error/info), message text, duration, swipe-to-dismiss
- **ScreenHeader**: Component header tái sử dụng — nhận title, optional onBack, optional rightAction; tự xử lý safe area top inset

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Số chuỗi màu hex literal (`'#xxxxxx'`) trong `StyleSheet.create()` trên toàn bộ `src/` giảm từ 30+ xuống 0
- **SC-002**: Số component header độc lập giảm từ 7+ xuống 1 component `ScreenHeader` tái sử dụng
- **SC-003**: Số lần `Alert.alert()` được gọi cho thông báo thành công giảm về 0
- **SC-004**: Các magic number `paddingBottom: 220` (và tương đương) bị loại bỏ hoàn toàn khỏi codebase
- **SC-005**: Người dùng mới hoàn thành luồng nhập tọa độ → xem bản đồ → lưu dự án trong lần thử đầu tiên mà không cần hướng dẫn thêm (đo qua usability test 5 người)
- **SC-006**: Không có báo cáo crash hoặc layout vỡ trên Android API 29+ trong 2 tuần sau phát hành

---

## Assumptions

- Ứng dụng chỉ hỗ trợ light mode; dark mode là out of scope cho feature này
- Design token giữ nguyên brand color hiện tại: `#007AFF` primary, `#34C759` success, `#FF3B30` danger — không thay đổi màu thương hiệu
- Haptic feedback chỉ áp dụng cho CTA chính, không áp dụng cho mọi tương tác (scroll, typing)
- Banner/toast hiển thị tối đa 1 cái cùng lúc; thông báo mới thay thế banner cũ đang hiển thị
- iOS và Android dùng chung một bộ design token; platform-specific chỉ ở chi tiết nhỏ (shadow vs. elevation)
- Grouped settings dùng màu sắc của app, không copy 1:1 system settings native của iOS
- Feature này chỉ thay đổi giao diện và tương tác, không thay đổi logic nghiệp vụ
