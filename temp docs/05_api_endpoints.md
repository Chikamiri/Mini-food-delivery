# PHẦN 5 — RESTFUL API ENDPOINTS

## 5.1. Quy ước chung

- **Base URL:** `http://localhost:8080/api`
- **Content-Type:** `application/json`
- **Xác thực:** JWT Bearer Token trong header `Authorization: Bearer <token>`
- **Response chuẩn:** Mọi response được bọc trong `ApiResponse<T>` gồm: `success`, `message`, `timestamp`, `errorCode`, `data`
- **Phân trang:** Sử dụng `PageResponse<T>` gồm: `items`, `page`, `size`, `totalElements`, `totalPages`, `last`

## 5.2. Authentication API (`/api/auth`)

- **POST `/api/auth/login`** — Đăng nhập
  - Body: `LoginRequest` { email, password }
  - Response: `JwtResponse` { accessToken, tokenType, email, fullName, role, userId }
  - Quyền: **Public**

- **POST `/api/auth/register`** — Đăng ký tài khoản
  - Body: `RegisterRequest` { email, password, fullName, phone, avatarUrl }
  - Validation: email (@Email, @NotBlank), password (@NotBlank, @Size min=6), fullName (@NotBlank, @Size max=100), phone (@Pattern regexp 10-15 chữ số)
  - Response: `JwtResponse`
  - Quyền: **Public**

## 5.3. Admin API (`/api/admin`)

- **PUT `/api/admin/restaurants/{id}/approval`** — Phê duyệt/từ chối nhà hàng
  - Body: `RestaurantApprovalRequest` { approved, note }
  - Quyền: **ADMIN**

- **PUT `/api/admin/users/{id}/role`** — Thay đổi vai trò người dùng
  - Body: `UserRoleUpdateRequest` { role }
  - Quyền: **ADMIN**

- **PUT `/api/admin/users/{id}/status`** — Kích hoạt/vô hiệu hóa người dùng
  - Body: `UserStatusUpdateRequest` { active }
  - Quyền: **ADMIN**

- **GET `/api/admin/users`** — Lấy danh sách tất cả người dùng
  - Response: `List<UserProfileResponse>`
  - Quyền: **ADMIN**

- **GET `/api/admin/restaurants/pending`** — Lấy danh sách nhà hàng chờ duyệt
  - Response: `List<RestaurantCardResponse>`
  - Quyền: **ADMIN**

- **GET `/api/admin/stats`** — Thống kê tổng quan hệ thống
  - Response: `AdminStatsResponse` { totalUsers, totalRestaurants, pendingRestaurants, totalOrders, totalRevenue }
  - Quyền: **ADMIN**

## 5.4. Restaurant API (`/api/restaurants`)

- **GET `/api/restaurants`** — Tìm kiếm nhà hàng (public)
  - Params: keyword, categoryId, page, size, sortBy, sortDir
  - Response: `PageResponse<RestaurantCardResponse>`
  - Quyền: **Public**

- **GET `/api/restaurants/{id}`** — Chi tiết nhà hàng
  - Response: `RestaurantDetailResponse`
  - Quyền: **Public**

- **GET `/api/restaurants/my`** — Danh sách nhà hàng của Owner hiện tại
  - Response: `List<RestaurantCardResponse>`
  - Quyền: **OWNER**

- **POST `/api/restaurants`** — Tạo nhà hàng mới
  - Body: `RestaurantRequest` { name, description, phone, address, latitude, longitude, imageUrl, openingTime, closingTime, isOpen, categoryId }
  - Response: `RestaurantDetailResponse`
  - Quyền: **OWNER**

- **PUT `/api/restaurants/{id}`** — Cập nhật nhà hàng
  - Quyền: **OWNER** (chỉ owner của nhà hàng)

- **DELETE `/api/restaurants/{id}`** — Xóa nhà hàng (soft delete)
  - Quyền: **OWNER** (chỉ owner của nhà hàng)

## 5.5. Restaurant Category API (`/api/restaurant-categories`)

- **GET `/api/restaurant-categories`** — Lấy tất cả danh mục nhà hàng
  - Response: `List<RestaurantCategoryResponse>` { id, name, iconUrl }
  - Quyền: **Public**

## 5.6. Menu API (`/api/restaurants/{restaurantId}/menu`)

- **GET `/api/restaurants/{restaurantId}/menu/categories`** — Lấy danh mục menu
  - Response: `List<MenuCategoryResponse>`
  - Quyền: **Public**

- **POST `/api/restaurants/{restaurantId}/menu/categories`** — Thêm danh mục menu
  - Body: `MenuCategoryRequest` { name }
  - Quyền: **OWNER**

- **PUT `/api/menu/categories/{categoryId}`** — Cập nhật danh mục
  - Quyền: **OWNER**

- **DELETE `/api/menu/categories/{categoryId}`** — Xóa danh mục (soft delete)
  - Quyền: **OWNER**

- **POST `/api/restaurants/{restaurantId}/menu/categories/{categoryId}/items`** — Thêm món ăn
  - Body: `MenuItemRequest` { name, description, price, imageUrl, isAvailable, categoryId }
  - Response: `MenuItemResponse`
  - Quyền: **OWNER**

- **PUT `/api/menu/items/{itemId}`** — Cập nhật món ăn
  - Quyền: **OWNER**

- **DELETE `/api/menu/items/{itemId}`** — Xóa món ăn (soft delete)
  - Quyền: **OWNER**

- **GET `/api/menu/items/{itemId}`** — Chi tiết món ăn
  - Quyền: **Public**

## 5.7. Order API (`/api/orders`)

- **POST `/api/orders`** — Tạo đơn hàng
  - Body: `CreateOrderRequest` { restaurantId, deliveryAddress, deliveryLat, deliveryLng, paymentMethod, note, items: [{ menuItemId, quantity, note }] }
  - Response: `OrderSummaryResponse`
  - Quyền: **CUSTOMER**

- **GET `/api/orders/{id}`** — Chi tiết đơn hàng
  - Response: `OrderSummaryResponse`
  - Quyền: **Authenticated**

- **GET `/api/orders/history`** — Lịch sử đơn hàng (phân trang)
  - Params: page, size
  - Response: `PageResponse<OrderSummaryResponse>`
  - Quyền: **CUSTOMER**

- **PUT `/api/orders/{id}/status`** — Cập nhật trạng thái đơn
  - Body: `OrderStatusUpdateRequest` { status, note }
  - Quyền: **OWNER, ADMIN**

- **GET `/api/orders/{id}/tracking`** — Theo dõi đơn hàng
  - Response: `OrderTrackingResponse` { orderId, status, timeline, assignment }
  - Quyền: **Authenticated**

- **GET `/api/orders/restaurant/{restaurantId}`** — Đơn hàng của nhà hàng
  - Params: status
  - Quyền: **OWNER**

## 5.8. Delivery API (`/api/deliveries`)

- **POST `/api/deliveries/assign`** — Gán shipper cho đơn hàng
  - Body: `AssignShipperRequest` { orderId, shipperId }
  - Response: `DeliveryAssignmentResponse`
  - Quyền: **ADMIN, SHIPPER**

- **PUT `/api/deliveries/orders/{orderId}/pickup`** — Xác nhận lấy hàng
  - Body: `MarkPickupRequest`
  - Quyền: **SHIPPER** (chỉ shipper được gán)

- **PUT `/api/deliveries/orders/{orderId}/deliver`** — Xác nhận giao hàng
  - Body: `MarkDeliveredRequest` { codCollected }
  - Quyền: **SHIPPER** (chỉ shipper được gán)

- **PUT `/api/deliveries/location`** — Cập nhật vị trí shipper
  - Body: `ShipperLocationUpdateRequest` { latitude, longitude, isOnline }
  - Quyền: **SHIPPER**

- **GET `/api/deliveries/location/{shipperId}`** — Lấy vị trí shipper
  - Response: `ShipperLocationResponse`
  - Quyền: **Authenticated**

## 5.9. User API (`/api/users`)

- **GET `/api/users/profile`** — Lấy hồ sơ người dùng hiện tại
  - Response: `UserProfileResponse`
  - Quyền: **Authenticated**

- **PUT `/api/users/profile`** — Cập nhật hồ sơ
  - Body: `UserProfileUpdateRequest` { fullName, phone, avatarUrl }
  - Quyền: **Authenticated**

- **GET `/api/users/addresses`** — Danh sách địa chỉ
  - Response: `List<AddressResponse>`
  - Quyền: **Authenticated**

- **POST `/api/users/addresses`** — Thêm địa chỉ
  - Body: `AddressRequest` { label, addressLine, latitude, longitude, isDefault }
  - Quyền: **Authenticated**

- **PUT `/api/users/addresses/{id}`** — Cập nhật địa chỉ
  - Quyền: **Authenticated**

- **DELETE `/api/users/addresses/{id}`** — Xóa địa chỉ
  - Quyền: **Authenticated**

- **PUT `/api/users/addresses/{id}/default`** — Đặt làm địa chỉ mặc định
  - Quyền: **Authenticated**

- **GET `/api/users/notifications`** — Danh sách thông báo
  - Response: `List<NotificationResponse>`
  - Quyền: **Authenticated**

- **PUT `/api/users/notifications/read`** — Đánh dấu đã đọc 1 thông báo
  - Body: `MarkNotificationReadRequest` { notificationId }
  - Quyền: **Authenticated**

- **PUT `/api/users/notifications/read-all`** — Đánh dấu tất cả đã đọc
  - Body: `MarkAllNotificationsReadRequest` { type }
  - Quyền: **Authenticated**

## 5.10. Report API (`/api/admin/reports`)

- **GET `/api/admin/reports/summary`** — Báo cáo tổng hợp
  - Params: startDate, endDate
  - Response: `AdminReportSummaryResponse` { startDate, endDate, totalRevenue, deliveredOrderCount, activeUserCount, approvedRestaurantCount }
  - Quyền: **ADMIN**
