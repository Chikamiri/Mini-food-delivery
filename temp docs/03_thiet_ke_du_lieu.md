# PHẦN 3 — THIẾT KẾ DỮ LIỆU

## 3.1. Tổng quan cơ sở dữ liệu

Hệ thống sử dụng **MySQL 8.0** với **12 bảng**, được quản lý phiên bản bằng Flyway Migration. Schema ban đầu được định nghĩa trong `V1__init_schema.sql`, bổ sung qua `V2` (thêm `is_deleted` cho `categories`) và `V3` (thêm audit columns và seed dữ liệu cho `restaurant_categories`).

## 3.2. Danh sách Entity và ánh xạ bảng

### 3.2.1. User (`users`)
- **id** (BIGINT, PK, AUTO_INCREMENT)
- **email** (VARCHAR 255, UNIQUE, NOT NULL) — Địa chỉ email đăng nhập
- **password** (VARCHAR 255, NOT NULL) — Mật khẩu đã mã hóa BCrypt
- **full_name** (VARCHAR 100, NOT NULL)
- **phone** (VARCHAR 15, UNIQUE)
- **avatar_url** (VARCHAR 500)
- **role** (VARCHAR 50, NOT NULL, DEFAULT 'USER') — Vai trò: CUSTOMER, OWNER, SHIPPER, ADMIN
- **is_active** (BOOLEAN, DEFAULT TRUE) — Trạng thái hoạt động
- **is_deleted** (BOOLEAN, DEFAULT FALSE) — Soft delete
- **created_at** (TIMESTAMP, NOT NULL)
- **updated_at** (TIMESTAMP, NOT NULL)
- **Quan hệ:** 1-N với Address, Restaurant (owner), Order (customer), DeliveryAssignment (shipper), OrderStatusHistory (changedBy)

### 3.2.2. Address (`addresses`)
- **id** (BIGINT, PK)
- **user_id** (BIGINT, FK → users, NOT NULL, ON DELETE CASCADE)
- **label** (VARCHAR 50) — Nhãn: "Nhà", "Công ty", ...
- **address_line** (VARCHAR 500, NOT NULL)
- **latitude** (DECIMAL 10,8)
- **longitude** (DECIMAL 11,8)
- **is_default** (BOOLEAN, DEFAULT FALSE) — Địa chỉ mặc định
- **Quan hệ:** N-1 với User

### 3.2.3. RestaurantCategory (`restaurant_categories`)
- **id** (BIGINT, PK)
- **name** (VARCHAR 100, UNIQUE, NOT NULL) — Tên danh mục: Rice, Fast Food, Sea Food, ...
- **icon_url** (VARCHAR 500)
- **created_at**, **updated_at** (TIMESTAMP)
- **Quan hệ:** 1-N với Restaurant
- **Dữ liệu seed:** 7 danh mục mặc định (Rice, Fast Food, Sea Food, Dry Dish, Soup Dish, Drink, Dessert)

### 3.2.4. Restaurant (`restaurants`)
- **id** (BIGINT, PK)
- **owner_id** (BIGINT, FK → users, NOT NULL)
- **category_id** (BIGINT, FK → restaurant_categories)
- **name** (VARCHAR 200, NOT NULL)
- **description** (TEXT)
- **phone** (VARCHAR 15)
- **address** (VARCHAR 500, NOT NULL)
- **latitude** (DECIMAL 10,8), **longitude** (DECIMAL 11,8)
- **image_url** (VARCHAR 500)
- **opening_time** (TIME), **closing_time** (TIME)
- **is_open** (BOOLEAN, DEFAULT TRUE)
- **is_approved** (BOOLEAN, DEFAULT FALSE) — Trạng thái phê duyệt bởi Admin
- **is_deleted** (BOOLEAN, DEFAULT FALSE) — Soft delete
- **created_at**, **updated_at** (TIMESTAMP)
- **Quan hệ:** N-1 với User (owner), N-1 với RestaurantCategory, 1-N với MenuItem, 1-N với Order

### 3.2.5. MenuCategory (`categories`)
- **id** (BIGINT, PK)
- **restaurant_id** (BIGINT, FK → restaurants, ON DELETE CASCADE)
- **name** (VARCHAR 100, NOT NULL) — Tên danh mục menu trong nhà hàng
- **sort_order** (INT, DEFAULT 0)
- **is_deleted** (BOOLEAN, DEFAULT FALSE) — Soft delete
- **Quan hệ:** N-1 với Restaurant, 1-N với MenuItem

### 3.2.6. MenuItem (`menu_items`)
- **id** (BIGINT, PK)
- **restaurant_id** (BIGINT, FK → restaurants, ON DELETE CASCADE)
- **category_id** (BIGINT, FK → categories, ON DELETE SET NULL)
- **name** (VARCHAR 200, NOT NULL)
- **description** (TEXT)
- **price** (DECIMAL 12,2, NOT NULL)
- **image_url** (VARCHAR 500)
- **is_available** (BOOLEAN, DEFAULT TRUE)
- **is_deleted** (BOOLEAN, DEFAULT FALSE) — Soft delete
- **created_at**, **updated_at** (TIMESTAMP)
- **Quan hệ:** N-1 với Restaurant, N-1 với MenuCategory, 1-N với OrderItem

### 3.2.7. Order (`orders`)
- **id** (BIGINT, PK)
- **user_id** (BIGINT, FK → users, NOT NULL) — Khách hàng đặt đơn
- **restaurant_id** (BIGINT, FK → restaurants, NOT NULL)
- **delivery_address** (VARCHAR 500, NOT NULL)
- **delivery_lat** (DECIMAL 10,8, NOT NULL), **delivery_lng** (DECIMAL 11,8, NOT NULL)
- **subtotal** (DECIMAL 12,2, NOT NULL) — Tổng tiền món ăn
- **delivery_fee** (DECIMAL 12,2, DEFAULT 0) — Phí giao hàng (mặc định 15.00)
- **total_amount** (DECIMAL 12,2, NOT NULL) — subtotal + delivery_fee
- **payment_method** (VARCHAR 50, DEFAULT 'COD')
- **status** (VARCHAR 50, DEFAULT 'PENDING') — Trạng thái đơn hàng
- **is_paid** (BOOLEAN, DEFAULT FALSE) — Trạng thái thanh toán, được set TRUE khi giao hàng thành công
- **note** (VARCHAR 500)
- **created_at**, **updated_at** (TIMESTAMP)
- **Quan hệ:** N-1 với User, N-1 với Restaurant, 1-N với OrderItem, 1-1 với DeliveryAssignment, 1-N với OrderStatusHistory

### 3.2.8. OrderItem (`order_items`)
- **id** (BIGINT, PK)
- **order_id** (BIGINT, FK → orders, ON DELETE CASCADE)
- **menu_item_id** (BIGINT, FK → menu_items, ON DELETE SET NULL) — Liên kết tới món gốc
- **item_name** (VARCHAR 200, NOT NULL) — **Snapshot** tên món tại thời điểm đặt
- **item_price** (DECIMAL 12,2, NOT NULL) — **Snapshot** giá tại thời điểm đặt
- **quantity** (INT, NOT NULL)
- **subtotal** (DECIMAL 12,2, NOT NULL) — item_price × quantity
- **note** (VARCHAR 500) — Ghi chú riêng cho món
- **Quan hệ:** N-1 với Order, N-1 với MenuItem

### 3.2.9. OrderStatusHistory (`order_status_history`)
- **id** (BIGINT, PK)
- **order_id** (BIGINT, FK → orders, ON DELETE CASCADE)
- **status** (VARCHAR 50, NOT NULL) — Trạng thái tại thời điểm ghi nhận
- **changed_by** (BIGINT, FK → users, ON DELETE SET NULL) — Người thay đổi
- **note** (VARCHAR 500)
- **created_at** (TIMESTAMP)
- **Quan hệ:** N-1 với Order, N-1 với User

### 3.2.10. DeliveryAssignment (`delivery_assignments`)
- **id** (BIGINT, PK)
- **order_id** (BIGINT, FK → orders, UNIQUE, NOT NULL) — 1 đơn chỉ có 1 phân công giao
- **shipper_id** (BIGINT, FK → users, NOT NULL)
- **status** (VARCHAR 50, DEFAULT 'UNASSIGNED')
- **picked_up_at** (TIMESTAMP, nullable) — Thời điểm shipper lấy hàng
- **delivered_at** (TIMESTAMP, nullable) — Thời điểm giao hàng xong
- **created_at** (TIMESTAMP)
- **Quan hệ:** 1-1 với Order, N-1 với User (shipper)

### 3.2.11. ShipperLocation (`shipper_locations`)
- **id** (BIGINT, PK)
- **shipper_id** (BIGINT, FK → users, UNIQUE, ON DELETE CASCADE) — 1 shipper chỉ có 1 bản ghi vị trí
- **latitude** (DECIMAL 10,8, NOT NULL)
- **longitude** (DECIMAL 11,8, NOT NULL)
- **is_online** (BOOLEAN, DEFAULT FALSE) — Trạng thái trực tuyến
- **updated_at** (TIMESTAMP) — Cập nhật mỗi khi shipper gửi vị trí mới
- **Quan hệ:** 1-1 với User (shipper)

### 3.2.12. Notification (`notifications`)
- **id** (BIGINT, PK)
- **user_id** (BIGINT, FK → users, ON DELETE CASCADE)
- **title** (VARCHAR 200, NOT NULL)
- **message** (TEXT, NOT NULL)
- **type** (VARCHAR 50, NOT NULL) — Loại thông báo: SYSTEM, ORDER, SYSTEM_ERROR, ...
- **is_read** (BOOLEAN, DEFAULT FALSE)
- **created_at** (TIMESTAMP)
- **Quan hệ:** N-1 với User

## 3.3. Các Enum định nghĩa trạng thái

### OrderStatus
- **PENDING** → **CONFIRMED** → **PREPARING** → **READY** → **SHIPPING** → **DELIVERED**
- Cho phép chuyển sang **REJECTED** hoặc **CANCELLED** từ bất kỳ trạng thái nào trước SHIPPING

### DeliveryAssignmentStatus
- **UNASSIGNED** → **ASSIGNED** → **PICKED_UP** → **DELIVERED**

### Role
- **CUSTOMER**, **SHIPPER**, **OWNER**, **ADMIN**

### PaymentMethod
- **COD** (Cash on Delivery)

## 3.4. Đặc điểm thiết kế nổi bật

- **Soft Delete:** Áp dụng cho User (`is_deleted`), Restaurant (`is_deleted`), MenuCategory (`is_deleted`), MenuItem (`is_deleted`). Bản ghi không bị xóa vật lý khỏi CSDL mà chỉ đánh dấu
- **Snapshot Pattern:** OrderItem lưu giữ bản sao `item_name` và `item_price` tại thời điểm đặt hàng, đảm bảo dữ liệu lịch sử không bị ảnh hưởng khi menu thay đổi
- **JPA Auditing thủ công:** Sử dụng `@PrePersist` và `@PreUpdate` để tự động gán `created_at` và `updated_at`, đảm bảo `updated_at` không bao giờ null khi tạo mới
- **Tìm kiếm theo vị trí:** OrderRepository sử dụng công thức Haversine trong Native Query để tìm đơn hàng gần vị trí shipper theo bán kính (km)
