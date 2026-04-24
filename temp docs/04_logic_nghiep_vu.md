# PHẦN 4 — TẦNG LOGIC NGHIỆP VỤ (SERVICE LAYER)

## 4.1. Tổng quan

Tầng nghiệp vụ được tổ chức theo mẫu **Interface-Implementation**, tách biệt khai báo hợp đồng (contract) và triển khai cụ thể. Mọi Service Implementation đều sử dụng **`@Service`**, **`@RequiredArgsConstructor`** (Lombok) và **`@Transactional`** cho các phương thức ghi dữ liệu.

## 4.2. Chi tiết từng Service

### 4.2.1. AuthService / AuthServiceImpl

**Chức năng:** Xử lý xác thực người dùng.

- **`login(LoginRequest)`** → `JwtResponse`
  - Xác thực email/password thông qua `AuthenticationManager`
  - Nạp `SecurityContextHolder` với authentication object
  - Sinh JWT token qua `JwtUtils.generateToken(email)`
  - Trả về `JwtResponse` chứa: accessToken, tokenType ("Bearer"), email, fullName, role, userId
  - Lỗi đăng nhập ném `AppException` với mã `AUTH_FAILED` (HTTP 401)

- **`register(RegisterRequest)`** → `JwtResponse`
  - Kiểm tra trùng email qua `existsByEmail()`, nếu tồn tại ném `AppException` mã `EMAIL_EXISTS` (HTTP 400)
  - Mã hóa mật khẩu bằng `BCryptPasswordEncoder`
  - Tạo User mới với role mặc định **ROLE_CUSTOMER**, `active=true`, `deleted=false`
  - Tự động sinh JWT và trả về `JwtResponse`

### 4.2.2. AdminService / AdminServiceImpl

**Chức năng:** Quản trị hệ thống, dành cho role ADMIN.

- **`approveRestaurant(restaurantId, RestaurantApprovalRequest)`**
  - Cập nhật `isApproved` của restaurant
  - Gửi thông báo (Notification) tới Owner với nội dung phê duyệt/từ chối, kèm ghi chú nếu có
  - Loại thông báo: `SYSTEM`

- **`updateUserRole(userId, UserRoleUpdateRequest)`** — Ủy quyền sang `UserService`
- **`updateUserStatus(userId, UserStatusUpdateRequest)`** — Ủy quyền sang `UserService`
- **`getAllUsers()`** → Danh sách `UserProfileResponse` qua `UserMapper`
- **`getPendingRestaurants()`** → Danh sách nhà hàng chưa duyệt (`isApproved=false AND isDeleted=false`)
- **`getSystemStats()`** → `AdminStatsResponse` gồm: totalUsers, totalRestaurants, pendingRestaurants, totalOrders, totalRevenue

### 4.2.3. OrderService / OrderServiceImpl

**Chức năng:** Quản lý vòng đời đơn hàng.

- **`createOrder(userId, CreateOrderRequest)`** → `OrderSummaryResponse`
  - Tải User và Restaurant từ CSDL
  - Tạo Order với status `PENDING`, phí giao hàng mặc định từ config `app.delivery.default-fee` (15.00)
  - Duyệt danh sách items, tải MenuItem tương ứng, tạo OrderItem với **snapshot** (itemName, itemPrice)
  - Tính subtotal = Σ(item.price × quantity), totalAmount = subtotal + deliveryFee
  - Cascade save Order + OrderItems
  - Ghi lịch sử trạng thái đầu tiên: PENDING, note "Order created"

- **`updateOrderStatus(orderId, userId, OrderStatusUpdateRequest)`**
  - Xác thực chuyển trạng thái hợp lệ qua `validateStateTransition()`
  - Quy tắc: PENDING→CONFIRMED→PREPARING→READY→SHIPPING→DELIVERED
  - Cho phép CANCELLED/REJECTED từ mọi trạng thái trước SHIPPING
  - Cấm CANCELLED/REJECTED khi đơn đang SHIPPING hoặc DELIVERED
  - Khi chuyển sang **READY**, publish `OrderReadyEvent` để trigger tạo DeliveryAssignment

- **`getOrderHistory(userId, page, size)`** → `PageResponse<OrderSummaryResponse>` — Phân trang lịch sử đơn hàng
- **`getOrderSummary(id)`** → Chi tiết đơn hàng
- **`getOrderTracking(orderId)`** → `OrderTrackingResponse` gồm timeline trạng thái và thông tin delivery assignment
- **`getRestaurantOrders(restaurantId, status)`** → Đơn hàng của nhà hàng theo trạng thái

### 4.2.4. DeliveryService / DeliveryServiceImpl

**Chức năng:** Quản lý vòng đời giao hàng.

- **`createUnassignedAssignment(orderId)`**
  - Được gọi tự động bởi `OrderEventListener` khi đơn READY
  - Kiểm tra idempotency: nếu assignment đã tồn tại, bỏ qua
  - Tạo DeliveryAssignment với status `UNASSIGNED`

- **`assignShipper(AssignShipperRequest)`** → `DeliveryAssignmentResponse`
  - Xác thực shipper có role `ROLE_SHIPPER`, nếu không ném `AppException` mã `INVALID_ROLE`
  - Cập nhật assignment sang `ASSIGNED`
  - Nếu đơn đang `READY`, tự động chuyển sang `SHIPPING` và ghi lịch sử

- **`markPickedUp(shipperId, orderId, MarkPickupRequest)`**
  - Kiểm tra quyền: chỉ shipper được gán mới có quyền (so sánh shipperId)
  - Kiểm tra trạng thái: assignment phải đang `ASSIGNED`
  - Cập nhật sang `PICKED_UP`, ghi nhận `pickedUpAt`

- **`markDelivered(shipperId, orderId, MarkDeliveredRequest)`**
  - Kiểm tra quyền và trạng thái (`PICKED_UP`)
  - Bắt buộc `codCollected = true`, nếu không ném `AppException` mã `COD_NOT_COLLECTED`
  - Cập nhật assignment sang `DELIVERED`, ghi nhận `deliveredAt`
  - Cập nhật Order: status → `DELIVERED`, `isPaid → true`
  - Ghi lịch sử trạng thái

- **`updateLocation(shipperId, ShipperLocationUpdateRequest)`**
  - Cập nhật hoặc tạo mới ShipperLocation (latitude, longitude, isOnline)
  - Sử dụng `orElseGet()` pattern: tìm location hiện có, nếu không có thì tạo mới

- **`getShipperLocation(shipperId)`** → `ShipperLocationResponse`

### 4.2.5. RestaurantService / RestaurantServiceImpl

**Chức năng:** Quản lý nhà hàng.

- **`searchRestaurants(RestaurantSearchRequest)`** → `PageResponse<RestaurantCardResponse>`
  - Tìm kiếm theo keyword (tên nhà hàng, LIKE) và categoryId
  - Chỉ trả về nhà hàng đã duyệt (`isApproved=true`) và chưa xóa (`isDeleted=false`)
  - Hỗ trợ sắp xếp tùy chỉnh (sortBy, sortDir) và phân trang

- **`createRestaurant(ownerId, RestaurantRequest)`** → `RestaurantDetailResponse`
  - Tạo nhà hàng mới với `isApproved=false`, `isDeleted=false`
  - Gán RestaurantCategory nếu có `categoryId`

- **`updateRestaurant(ownerId, id, RestaurantRequest)`** — Kiểm tra quyền sở hữu trước khi cập nhật
- **`deleteRestaurant(ownerId, id)`** — Soft delete, kiểm tra quyền sở hữu
- **`getMyRestaurants(ownerId)`** — Danh sách nhà hàng của Owner, lọc bỏ đã xóa
- **`getAllCategories()`** → Danh sách `RestaurantCategoryResponse`, sắp xếp theo tên

### 4.2.6. MenuService / MenuServiceImpl

**Chức năng:** Quản lý thực đơn nhà hàng.

- **`getMenuCategories(restaurantId)`** — Lấy danh mục menu, lọc bỏ `isDeleted=true`, sắp xếp theo `sortOrder`
- **`addMenuCategory(ownerId, restaurantId, request)`** — Xác thực quyền sở hữu, tạo danh mục mới
- **`updateMenuCategory / deleteMenuCategory`** — CRUD danh mục, soft delete
- **`addMenuItem(ownerId, restaurantId, categoryId, request)`** — Xác thực category thuộc đúng restaurant
- **`updateMenuItem(ownerId, itemId, request)`** — Cho phép đổi category, xác thực cross-restaurant
- **`deleteMenuItem`** — Soft delete
- **`getMenuItem(id)`** — Trả 404 nếu `isDeleted=true`

Phương thức `validateRestaurantOwnership()` được tái sử dụng nội bộ để đảm bảo chỉ Owner mới có quyền quản lý menu.

### 4.2.7. UserService / UserServiceImpl

**Chức năng:** Quản lý hồ sơ người dùng và địa chỉ.

- **`getUserProfile / updateUserProfile`** — Cập nhật fullName, phone, avatarUrl
- **`updateUserRole / updateUserStatus`** — Dành cho Admin
- **`getUserAddresses / addAddress / updateAddress / deleteAddress`** — CRUD địa chỉ
- **`setDefaultAddress(userId, addressId)`** — Reset địa chỉ mặc định cũ trước khi set mới
  - Logic `resetDefaultAddress()`: tìm address có `isDefault=true`, nếu có → set `false`

### 4.2.8. NotificationService / NotificationServiceImpl

**Chức năng:** Quản lý thông báo nội bộ.

- **`getUserNotifications(userId)`** — Danh sách thông báo, sắp xếp giảm dần theo `createdAt`
- **`markAsRead(userId, request)`** — Đánh dấu đã đọc 1 thông báo, kiểm tra quyền sở hữu
- **`markAllAsRead(userId, request)`** — Đánh dấu tất cả, hỗ trợ lọc theo `type`
- **`createNotification(userId, title, message, type)`** — Tạo thông báo mới, dùng nội bộ bởi AdminService và OrderEventListener

### 4.2.9. ReportService / ReportServiceImpl

**Chức năng:** Báo cáo thống kê cho Admin.

- **`getAdminReport(startDate, endDate)`** → `AdminReportSummaryResponse`
  - Tổng doanh thu (đơn DELIVERED trong khoảng thời gian)
  - Số đơn đã giao thành công
  - Số user đang hoạt động
  - Số nhà hàng đã duyệt
  - Xử lý null-safe cho totalRevenue (trả BigDecimal.ZERO nếu null)

## 4.3. Event-Driven Architecture

```
OrderService.updateOrderStatus()
    │ status = READY
    ▼
ApplicationEventPublisher.publishEvent(OrderReadyEvent)
    │
    ▼
OrderEventListener.handleOrderReadyEvent()
    │
    ├─→ DeliveryService.createUnassignedAssignment()
    │       (Tạo DeliveryAssignment UNASSIGNED)
    │
    └─→ [Exception] → NotificationService.createNotification()
            (Thông báo lỗi tới Admin, type SYSTEM_ERROR)
```

## 4.4. MapStruct Mappers

6 Mapper interfaces sử dụng MapStruct để chuyển đổi tự động giữa Entity và DTO:

- **AddressMapper** — Address ↔ AddressRequest/AddressResponse
- **DeliveryMapper** — DeliveryAssignment → DeliveryAssignmentResponse, ShipperLocation → ShipperLocationResponse
- **MenuMapper** — MenuItem ↔ MenuItemRequest/MenuItemResponse, MenuCategory → MenuCategoryResponse
- **NotificationMapper** — Notification → NotificationResponse
- **OrderMapper** — Order → OrderSummaryResponse/OrderTrackingResponse, OrderItem → OrderItemResponse
- **RestaurantMapper** — Restaurant ↔ RestaurantRequest/RestaurantCardResponse/RestaurantDetailResponse
- **UserMapper** — User → UserProfileResponse
