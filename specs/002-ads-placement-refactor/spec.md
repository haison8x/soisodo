# Feature Specification: Tái cấu trúc vị trí quảng cáo và Reward Ads Logic

**Feature Branch**: `002-ads-placement-refactor`  
**Created**: 2026-04-24  
**Status**: Draft  
**Input**: User description: "Tái cấu trúc vị trí quảng cáo, đặt ID quảng cáo vào constants theo platform, thêm reward ads tại Settings (miễn quảng cáo 72h) và tại màn hình Sổ đỏ (khi user có >10 sổ, tần suất 10 phút/lần). Premium users không bao giờ thấy quảng cáo."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem rewarded ad trong Settings để miễn quảng cáo 72h (Priority: P1)

Người dùng miễn phí vào màn hình Settings và thấy một tùy chọn mời họ xem một quảng cáo tặng thưởng để được miễn toàn bộ quảng cáo trong 72 giờ tiếp theo. Sau khi xem xong, hệ thống ghi nhận thời điểm và không hiển thị quảng cáo nào cho đến khi hết thời gian.

**Why this priority**: Đây là tính năng cốt lõi để cân bằng trải nghiệm người dùng — thay vì bị làm phiền bởi quảng cáo ngẫu nhiên, user chủ động chọn xem một lần để được yên tĩnh 72h. Tăng goodwill và giảm uninstall rate.

**Independent Test**: Vào Settings → chọn tùy chọn xem quảng cáo → xem quảng cáo tặng thưởng hoàn chỉnh → xác nhận không có quảng cáo nào xuất hiện trong 72h tiếp theo.

**Acceptance Scenarios**:

1. **Given** user là free tier và không đang trong period miễn quảng cáo, **When** user mở màn hình Settings, **Then** hệ thống hiển thị một option "Xem quảng cáo để miễn quảng cáo 72h" rõ ràng.
2. **Given** user nhấn option trên và xem quảng cáo tặng thưởng đến cuối, **When** quảng cáo kết thúc, **Then** hệ thống ghi nhận thời điểm và không hiển thị bất kỳ quảng cáo nào trong 72 giờ tiếp theo.
3. **Given** user đang trong period miễn quảng cáo 72h, **When** user mở Settings, **Then** option hiển thị thời gian còn lại (ví dụ: "Miễn quảng cáo: còn 48 giờ 30 phút").
4. **Given** user đóng quảng cáo tặng thưởng trước khi xem xong, **When** quảng cáo đóng, **Then** hệ thống KHÔNG ghi nhận period miễn quảng cáo và thông báo cần xem hết để nhận thưởng.

---

### User Story 2 - Rewarded ad trên màn hình Sổ đỏ khi user có nhiều sổ (Priority: P2)

Người dùng có hơn 10 sổ đỏ được coi là người dùng nặng. Khi họ mở màn hình danh sách Sổ đỏ, hệ thống có thể nhắc họ xem một quảng cáo tặng thưởng, nhưng chỉ tối đa một lần mỗi 10 phút để không làm phiền.

**Why this priority**: Nhắm mục tiêu đúng đối tượng — user có nhiều sổ dùng app thường xuyên hơn và có giá trị quảng cáo cao hơn. Giới hạn tần suất bảo vệ trải nghiệm.

**Independent Test**: Tạo account với 11+ sổ → mở màn hình Sổ đỏ → xác nhận prompt quảng cáo xuất hiện → mở lại sau < 10 phút → xác nhận KHÔNG xuất hiện lại.

**Acceptance Scenarios**:

1. **Given** user có từ 10 sổ trở xuống, **When** user mở màn hình Sổ đỏ, **Then** hệ thống KHÔNG hiển thị bất kỳ prompt quảng cáo tặng thưởng nào.
2. **Given** user có hơn 10 sổ và chưa thấy prompt trong 10 phút qua, **When** user mở màn hình Sổ đỏ, **Then** hệ thống hiển thị prompt mời xem quảng cáo tặng thưởng.
3. **Given** user vừa xem/từ chối prompt cách đây dưới 10 phút, **When** user mở lại màn hình Sổ đỏ, **Then** hệ thống KHÔNG hiển thị lại prompt.
4. **Given** user đang trong period miễn quảng cáo 72h, **When** user mở màn hình Sổ đỏ dù có bao nhiêu sổ, **Then** hệ thống KHÔNG hiển thị prompt quảng cáo.
5. **Given** user là premium, **When** user mở màn hình Sổ đỏ, **Then** hệ thống KHÔNG hiển thị quảng cáo.

---

### User Story 3 - Premium users không thấy quảng cáo ở bất kỳ đâu (Priority: P1)

Người dùng đã mua premium hoàn toàn không nhìn thấy bất kỳ loại quảng cáo nào ở bất kỳ đâu trong ứng dụng, bao gồm cả banner, interstitial, app open, và rewarded prompt.

**Why this priority**: Đây là cam kết cơ bản với người dùng trả phí — vi phạm điều này sẽ gây mất niềm tin nghiêm trọng.

**Independent Test**: Đăng nhập với account premium → điều hướng qua tất cả màn hình → xác nhận zero quảng cáo xuất hiện.

**Acceptance Scenarios**:

1. **Given** user có trạng thái premium active, **When** user điều hướng qua bất kỳ màn hình nào, **Then** không có quảng cáo nào được tải hoặc hiển thị.
2. **Given** user premium mở Settings, **When** màn hình load, **Then** option "Xem quảng cáo để miễn quảng cáo" KHÔNG hiển thị.
3. **Given** user premium mở màn hình Sổ đỏ dù có bao nhiêu sổ, **When** màn hình load, **Then** không có prompt quảng cáo nào xuất hiện.

---

### User Story 4 - Ad IDs được quản lý tập trung theo platform (Priority: P2)

Tất cả ID quảng cáo được định nghĩa trong một file constants duy nhất, tự động chọn đúng ID theo platform (Android/iOS). Việc thay đổi ID chỉ cần sửa một chỗ duy nhất.

**Why this priority**: Đảm bảo đúng đơn vị quảng cáo được dùng cho từng platform, tránh doanh thu bị mất hoặc vi phạm chính sách AdMob do nhầm ID.

**Independent Test**: Đọc constants file và xác nhận tất cả 6 loại quảng cáo × 2 platform đều được định nghĩa đầy đủ; chạy app trên cả hai platform để xác nhận đúng ID được dùng.

**Acceptance Scenarios**:

1. **Given** app chạy trên Android, **When** bất kỳ component nào cần load quảng cáo, **Then** hệ thống sử dụng đúng Android ad unit ID tương ứng.
2. **Given** app chạy trên iOS, **When** bất kỳ component nào cần load quảng cáo, **Then** hệ thống sử dụng đúng iOS ad unit ID tương ứng.
3. **Given** developer cần thay đổi một ad unit ID, **When** họ cập nhật constants file, **Then** tất cả nơi sử dụng ID đó đều được cập nhật mà không cần sửa thêm chỗ nào khác.

---

### Edge Cases

- Điều gì xảy ra khi quảng cáo tặng thưởng không tải được (no network, ad not filled)?
- Điều gì xảy ra khi period miễn quảng cáo 72h hết hạn trong khi user đang dùng app?
- User uninstall và cài lại app — period miễn quảng cáo 72h sẽ không còn (lưu local).
- User có đúng 10 sổ (boundary): KHÔNG hiển thị quảng cáo (chỉ > 10 mới show).
- User premium hết hạn premium trong khi đang dùng app — ads xuất hiện ở lần load màn hình tiếp theo.
- Platform web: AdMob không khả dụng, các component quảng cáo không crash mà render null.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI định nghĩa tất cả ad unit IDs trong một file constants duy nhất, phân tách theo platform Android và iOS, cho đủ 6 loại: Banner, App Open, Rewarded, Native Advanced, Rewarded Interstitial, Interstitial.
- **FR-002**: Hệ thống PHẢI tự động chọn ad unit ID đúng với platform hiện tại khi render quảng cáo.
- **FR-003**: Màn hình Settings PHẢI hiển thị tùy chọn mời user xem rewarded ad để nhận miễn quảng cáo 72h, chỉ khi user là free tier VÀ không đang trong period miễn quảng cáo.
- **FR-004**: Sau khi user xem xong rewarded ad hoàn toàn (không bỏ ngang), hệ thống PHẢI lưu trữ timestamp bắt đầu period miễn quảng cáo 72h.
- **FR-005**: Trong suốt period miễn quảng cáo 72h, hệ thống PHẢI chặn tất cả loại quảng cáo ở mọi màn hình.
- **FR-006**: Màn hình Settings PHẢI hiển thị thời gian còn lại của period miễn quảng cáo khi period đang active.
- **FR-007**: Màn hình Sổ đỏ PHẢI hiển thị prompt rewarded ad khi và chỉ khi: user là free tier VÀ không trong period miễn quảng cáo VÀ có hơn 10 sổ đỏ VÀ đã qua ít nhất 10 phút kể từ lần prompt cuối.
- **FR-008**: Hệ thống PHẢI lưu trữ timestamp lần cuối prompt rewarded ad xuất hiện trên màn hình Sổ đỏ để kiểm soát tần suất 10 phút.
- **FR-009**: Hệ thống PHẢI kiểm tra trạng thái premium trước khi tải hoặc hiển thị bất kỳ quảng cáo nào; nếu premium active thì không tải và không hiển thị.
- **FR-010**: Trên platform web, hệ thống PHẢI xử lý gracefully khi AdMob không khả dụng — không crash, không hiển thị lỗi với user.

### Key Entities

- **AdConfig**: Tập hợp tất cả ad unit IDs, phân theo platform và loại quảng cáo. Là nguồn sự thật duy nhất cho ad IDs.
- **AdFreeStatus**: Trạng thái miễn quảng cáo của user — loại (premium / rewarded-earned), thời điểm bắt đầu, thời điểm hết hạn.
- **RewardedAdPromptRecord**: Timestamp lần cuối prompt rewarded ad được hiển thị trên màn hình Sổ đỏ, dùng để kiểm soát tần suất.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% user premium không thấy quảng cáo ở bất kỳ đâu trong app — zero ad impressions cho premium accounts.
- **SC-002**: User free tier xem đủ rewarded ad trong Settings nhận đúng 72h không quảng cáo, không sai lệch quá 1 phút.
- **SC-003**: Màn hình Sổ đỏ chỉ prompt rewarded ad với tần suất tối đa 1 lần / 10 phút — không bao giờ vượt quá giới hạn này.
- **SC-004**: User có ≤ 10 sổ không bao giờ thấy rewarded ad prompt trên màn hình Sổ đỏ — 0% false positive.
- **SC-005**: Toàn bộ ad unit IDs được quản lý ở một nơi duy nhất — không có ID nào hardcode ở nơi khác trong codebase.
- **SC-006**: Khi rewarded ad không tải được, app không crash và user thấy thông báo thân thiện về việc không có quảng cáo khả dụng.

---

## Assumptions

- Period miễn quảng cáo 72h được lưu trên thiết bị (local storage); khi user uninstall và cài lại thì period sẽ mất — behavior này được chấp nhận cho v1.
- "Hơn 10 sổ" nghĩa là > 10 (strict greater than), không bao gồm đúng 10.
- Prompt rewarded ad trên màn hình Sổ đỏ là một dialog/bottom sheet hỏi user có muốn xem không — không tự động phát quảng cáo.
- Trạng thái premium được xác định từ hệ thống IAP/Firebase hiện có của app.
- Platform web không hỗ trợ AdMob — tất cả component quảng cáo render null trên web.
- Timer 10 phút cho màn hình Sổ đỏ được tính từ lần cuối prompt xuất hiện, bất kể user có xem quảng cáo hay không.
- Rewarded và Rewarded Interstitial là hai loại riêng biệt; mỗi loại dùng đúng ID của mình theo platform.
