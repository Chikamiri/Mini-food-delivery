# PHẦN 8 — KIỂM THỬ VÀ TRIỂN KHAI

## 8.1. Chiến lược kiểm thử

Hệ thống áp dụng chiến lược kiểm thử **đa tầng** với 3 mức:

- **Unit Test** — Kiểm thử logic nghiệp vụ trong Service layer (Mockito + JUnit 5)
- **Integration Test** — Kiểm thử tương tác với CSDL thực (Testcontainers + MySQL)
- **E2E Test** — Kiểm thử giao diện người dùng (Cypress)

## 8.2. Unit Test (Backend)

Sử dụng **JUnit 5** + **Mockito** (`@ExtendWith(MockitoExtension.class)`).

### 8.2.1. AdminServiceImplTest
- `approveRestaurant_Success()` — Xác nhận restaurant được approve, notification được gửi tới owner
- `approveRestaurant_Rejection_Success()` — Xác nhận từ chối, notification chứa "rejected"
- `approveRestaurant_NotFound_ShouldThrowException()` — Ném `ResourceNotFoundException` khi ID không tồn tại

### 8.2.2. AuthServiceImplTest
- `register_Success()` — Xác nhận tạo user, mã hóa password, sinh JWT
- `login_Success()` — Xác nhận xác thực thành công, trả về JWT và thông tin user

### 8.2.3. DeliveryServiceImplTest
- `assignShipper_Success()` — Gán shipper, chuyển order sang SHIPPING
- `assignShipper_NotAShipper_ShouldThrowException()` — Ném lỗi INVALID_ROLE khi user không phải shipper
- `markPickedUp_Success()` — Cập nhật status PICKED_UP, ghi nhận pickedUpAt
- `markPickedUp_Unauthorized_ShouldThrowException()` — Ném FORBIDDEN khi shipper khác cố cập nhật
- `markDelivered_Success()` — Cập nhật DELIVERED, set isPaid=true
- `updateLocation_NewLocation_ShouldCreate()` — Tạo mới ShipperLocation
- `updateLocation_ExistingLocation_ShouldUpdate()` — Cập nhật location hiện có

### 8.2.4. NotificationServiceImplTest
- `getUserNotifications_ShouldReturnMappedResponses()` — Trả về danh sách đúng format
- `markAsRead_Success()` — Đánh dấu đã đọc
- `markAsRead_NotFound_ShouldThrowException()` — Ném ResourceNotFoundException
- `markAsRead_Unauthorized_ShouldThrowException()` — Ném FORBIDDEN khi user không sở hữu notification
- `markAllAsRead_WithoutType_ShouldCallGlobalReset()` — Gọi markAllAsRead()
- `markAllAsRead_WithType_ShouldCallFilteredReset()` — Gọi markAllByTypeAsRead()
- `createNotification_Success() / _UserNotFound_ShouldThrowException()`

### 8.2.5. ReportServiceImplTest
- `getAdminReport_ShouldAggregateDataCorrectly()` — Xác nhận tổng hợp dữ liệu đúng
- `getAdminReport_NullRevenue_ShouldReturnZero()` — Xử lý null-safe, trả BigDecimal.ZERO

## 8.3. Integration Test (Backend)

### 8.3.1. BaseIntegrationTest
- Class cơ sở cho mọi integration test
- Sử dụng **Testcontainers** với `MySQLContainer` (mysql:8.0)
- Annotation: `@SpringBootTest`, `@ActiveProfiles("test")`, `@Transactional`
- Kiểm tra Docker availability trước khi khởi tạo container
- `@ServiceConnection` tự động cấu hình datasource

### 8.3.2. EntityMappingIntegrationTest
- `shouldCascadeSaveAddresses()` — Kiểm tra cascade persist User → Address
- `shouldThrowExceptionWhenDuplicateEmail()` — Kiểm tra ràng buộc UNIQUE trên email

### 8.3.3. OrderRepositoryIntegrationTest
- `shouldFindOrdersNearLocation()` — Kiểm tra truy vấn tìm đơn hàng theo vị trí (Haversine formula)
  - Tạo 3 đơn: 1 gần + READY, 1 xa + READY, 1 gần + PENDING
  - Xác nhận chỉ trả về 1 đơn gần với status READY

### 8.3.4. JwtUtilsTest
- `shouldGenerateAndValidateToken()` — Sinh token, validate, extract username
- `shouldFailForInvalidToken()` — Token giả trả về false

## 8.4. E2E Test (Frontend)

- **Framework:** Cypress
- **Test cơ bản:** Kiểm tra app root URL chứa "You did it!" (boilerplate Vue)
- **Cấu hình:** `cypress/jsconfig.json` với types: ["cypress"]

## 8.5. Coverage

- **Tool:** JaCoCo Maven Plugin
- **Cấu hình:** `prepare-agent` (trước test) + `report` (sau test)
- **Báo cáo:** Sinh trong `target/site/jacoco/`

## 8.6. Triển khai (Deployment)

### 8.6.1. Cấu hình môi trường

Biến môi trường cần thiết (tham khảo `.env.template`):

- **DB_URL** — JDBC URL kết nối MySQL (VD: `jdbc:mysql://localhost:3306/mini_food_db?createDatabaseIfNotExist=true`)
- **DB_USERNAME** — Username MySQL
- **DB_PASSWORD** — Password MySQL
- **JWT_SECRET** — Secret key cho JWT (tối thiểu 32 ký tự)
- **SPRING_PROFILES_ACTIVE** — Profile Spring Boot (dev/prod)

### 8.6.2. Quy trình khởi động Backend

1. Đảm bảo MySQL đang chạy và database tồn tại (hoặc bật `createDatabaseIfNotExist=true`)
2. Cấu hình file `.env` tại root hoặc `SRC/backend/`
3. Chạy `./mvnw spring-boot:run` (hoặc `mvnw.cmd` trên Windows)
4. Flyway tự động chạy migration (V1 → V2 → V3)
5. Ứng dụng khởi động tại `http://localhost:8080`
6. Swagger UI tại `http://localhost:8080/swagger-ui.html`
7. Console hiển thị thông tin kết nối DB và số user đã đăng ký

### 8.6.3. Quy trình khởi động Frontend

1. Cài đặt dependencies: `npm install`
2. Chạy dev server: `npm run dev`
3. Truy cập tại URL hiển thị trên console (mặc định `http://localhost:5173`)

### 8.6.4. Smoke Mode

Hệ thống hỗ trợ chế độ **Smoke Mode** để kiểm tra cấu hình mà không cần CSDL:

- Đặt biến môi trường `APP_SMOKE_MODE=true` hoặc system property `app.smokeMode=true`
- Tự động loại trừ DataSource, JPA, và JpaRepositories auto-configuration
- Console hiển thị "[SMOKE MODE] Running without DB/JPA auto-configuration"

## 8.7. Lộ trình phát triển (Roadmap)

### Phase 2 — Kế hoạch tiếp theo

- **Reporting Enhancement:** Xuất báo cáo CSV/Excel, thống kê doanh thu theo nhà hàng
- **Real-time Updates:** Tích hợp WebSocket hoặc SSE cho cập nhật trạng thái đơn hàng và vị trí shipper
- **Advanced Security:** Token refresh mechanism, khóa tài khoản sau nhiều lần đăng nhập thất bại
- **DevOps:** Multi-stage Dockerfile, GitHub Actions CI/CD pipeline

---

> **Ghi chú kỹ thuật:** Tên database trong `application-dev.yaml` là `mini_food_db` với option `createDatabaseIfNotExist=true`, cần đảm bảo nhất quán trong mọi môi trường.
