# Self note

Current: Entities và Repositories tạm thời xong

```txt
src/main/java/com/example/server/
├── ServerApplication.java          # File main để khởi chạy Spring Boot
├── config/                         # Các file cấu hình ứng dụng
│   ├── SecurityConfig.java         # Cấu hình phân quyền, chặn API
│   └── WebConfig.java              # Cấu hình CORS cho Frontend (Vue.js) gọi API
├── controller/                     # Các REST API Endpoints (Tiếp nhận Request)
│   ├── AuthController.java         # API Login, Register (dùng JWT)
│   ├── OrderController.java        # API đặt đồ ăn
│   ├── RestaurantController.java   # API xem danh sách nhà hàng
│   └── UserController.java         # API quản lý User/Shipper/Admin
├── dto/                            # Data Transfer Objects (Dữ liệu giao tiếp với Client)
│   ├── request/                    # Dữ liệu Client gửi lên (VD: OrderRequest, LoginRequest)
│   └── response/                   # Dữ liệu Server trả về (VD: OrderResponse, JwtResponse)
|           # Note: Thư mục dto sẽ theo layout mới, dùng lệnh ls để kiểm tra
├── entity/                         # Các class map với bảng trong MySQL
│   ├── User.java                   # Đại diện chung cho Customer, Shipper, Admin
│   ├── Role.java                   # Quyền của User
│   ├── Restaurant.java
│   ├── MenuItem.java
│   └── Order.java
├── exception/                      # Quản lý lỗi chung cho toàn hệ thống
│   ├── ResourceNotFoundException.java 
│   └── GlobalExceptionHandler.java # Bắt mọi lỗi và format response lỗi chuẩn (VD: status 400, 404)
├── repository/                     # Thao tác với Database (Kế thừa JpaRepository)
│   ├── UserRepository.java
│   ├── OrderRepository.java
│   └── RestaurantRepository.java
├── security/                       # Chứa các logic liên quan đến xác thực JWT
│   ├── JwtTokenProvider.java       # Class tạo và xác thực Token
│   └── JwtAuthenticationFilter.java# Filter chặn các request để kiểm tra Token
└── service/                        # Nơi chứa Business Logic (Nghiệp vụ cốt lõi)
    ├── UserService.java            # Interface định nghĩa các hàm nghiệp vụ
    ├── OrderService.java
    └── impl/                       # Implement các hàm được định nghĩa ở interface
        ├── UserServiceImpl.java
        └── OrderServiceImpl.java
```

## DTO Blueprint

### Auth DTOs

1. LoginRequest: email:String, password:String
2. RegisterRequest: email:String, password:String, fullName:String, phone:String, avatarUrl:String
3. JwtResponse: accessToken:String, tokenType:String, expiresIn:Long, userId:Long, email:String, fullName:String, role:String, active:Boolean

### Common DTOs

1. ApiResponseOfT: success:Boolean, message:String, data:T, timestamp:LocalDateTime, errorCode:String
2. PageResponseOfT: items:List[T], page:int, size:int, totalElements:long, totalPages:int, last:boolean

### User DTOs

1. AddressRequest: label:String, addressLine:String, latitude:BigDecimal, longitude:BigDecimal, isDefault:Boolean
2. AddressResponse: id:Long, label:String, addressLine:String, latitude:BigDecimal, longitude:BigDecimal, isDefault:Boolean
3. UserProfileResponse: id:Long, email:String, fullName:String, phone:String, avatarUrl:String, role:String, active:Boolean, createdAt:LocalDateTime, addresses:List<AddressResponse>
4. UserRoleUpdateRequest: role:String
5. UserStatusUpdateRequest: active:Boolean

### Restaurant DTOs

1. RestaurantSearchRequest: keyword:String, categoryId:Long, isOpen:Boolean, page:int, size:int, sortBy:String, sortDir:String
2. RestaurantCardResponse: id:Long, name:String, address:String, imageUrl:String, isOpen:Boolean, isApproved:Boolean, categoryName:String
3. RestaurantDetailResponse: id:Long, ownerId:Long, categoryId:Long, categoryName:String, name:String, description:String, phone:String, address:String, latitude:BigDecimal, longitude:BigDecimal, imageUrl:String, openingTime:LocalTime, closingTime:LocalTime, isOpen:Boolean, isApproved:Boolean, menuItems:List<MenuItemResponse>
4. MenuItemResponse: id:Long, restaurantId:Long, categoryId:Long, categoryName:String, name:String, description:String, price:BigDecimal, imageUrl:String, isAvailable:Boolean
5. MenuItemRequest: categoryId:Long, name:String, description:String, price:BigDecimal, imageUrl:String, isAvailable:Boolean
6. MenuCategoryResponse: id:Long, restaurantId:Long, name:String, sortOrder:Integer
7. RestaurantApprovalRequest: approved:Boolean, note:String

### Order DTOs

1. CreateOrderRequest: restaurantId:Long, addressId:Long, deliveryAddress:String, deliveryLat:BigDecimal, deliveryLng:BigDecimal, paymentMethod:String, note:String, items:List<CreateOrderItemRequest>
2. CreateOrderItemRequest: menuItemId:Long, quantity:Integer, note:String
3. OrderSummaryResponse: id:Long, userId:Long, restaurantId:Long, restaurantName:String, deliveryAddress:String, subtotal:BigDecimal, deliveryFee:BigDecimal, totalAmount:BigDecimal, paymentMethod:String, status:String, note:String, createdAt:LocalDateTime
4. OrderItemResponse: id:Long, menuItemId:Long, itemName:String, itemPrice:BigDecimal, quantity:Integer, subtotal:BigDecimal, note:String
5. OrderTrackingResponse: orderId:Long, status:String, updatedAt:LocalDateTime, timeline:List<OrderStatusHistoryResponse>, assignment:DeliveryAssignmentResponse
6. OrderStatusUpdateRequest: status:String, note:String
7. OrderStatusHistoryResponse: id:Long, orderId:Long, status:String, changedByUserId:Long, changedByName:String, note:String, createdAt:LocalDateTime

### Delivery DTOs

1. AssignShipperRequest: orderId:Long, shipperId:Long
2. DeliveryAssignmentResponse: id:Long, orderId:Long, shipperId:Long, shipperName:String, status:String, pickedUpAt:LocalDateTime, deliveredAt:LocalDateTime, createdAt:LocalDateTime
3. MarkPickupRequest: note:String
4. MarkDeliveredRequest: note:String
5. ShipperLocationUpdateRequest: latitude:BigDecimal, longitude:BigDecimal, isOnline:Boolean
6. ShipperLocationResponse: id:Long, shipperId:Long, latitude:BigDecimal, longitude:BigDecimal, isOnline:Boolean, updatedAt:LocalDateTime

### Report DTOs

1. AdminReportSummaryResponse: startDate:LocalDate, endDate:LocalDate, totalRevenue:BigDecimal, deliveredOrderCount:Long, activeUserCount:Long, approvedRestaurantCount:Long
2. AdminReportZeroStateResponse: startDate:LocalDate, endDate:LocalDate, totalRevenue:BigDecimal, deliveredOrderCount:Long, activeUserCount:Long, approvedRestaurantCount:Long, hasData:Boolean

### Notification DTOs

1. NotificationResponse: id:Long, userId:Long, title:String, message:String, type:String, isRead:Boolean, createdAt:LocalDateTime
2. MarkNotificationReadRequest: notificationId:Long
3. MarkAllNotificationsReadRequest: type:String

### Enum Blueprint

1. Role: CUSTOMER, SHIPPER, OWNER, ADMIN
2. OrderStatus: PENDING, CONFIRMED, PREPARING, READY_FOR_PICKUP, SHIPPING, DELIVERED, REJECTED, CANCELLED
3. DeliveryAssignmentStatus: NONASSIGNED, ASSIGNED, PICKED_UP, DELIVERED
4. PaymentMethod: COD, ONLINE

### Status Mapping Note

1. API and DB should use DELIVERED as terminal success status.
2. UI text "COMPLETED" is display alias for DELIVERED only.
3. Reporting query should aggregate DELIVERED orders.

### Validation Blueprint

1. Email fields: valid email format
2. Password: min length and complexity rule
3. Quantity: min 1
4. Price and money: positive
5. Latitude and longitude: range validation
6. Required ids: not null for all relation keys
