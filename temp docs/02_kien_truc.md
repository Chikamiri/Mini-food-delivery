# PHẦN 2 — KIẾN TRÚC HỆ THỐNG

## 2.1. Mô hình kiến trúc tổng quan

Hệ thống áp dụng kiến trúc **Phân tầng (Layered Architecture)** kết hợp mô hình **Client-Server**, tách biệt hoàn toàn giữa Frontend (Vue.js) và Backend (Spring Boot). Giao tiếp giữa hai tầng thông qua **RESTful API** trên giao thức HTTP/HTTPS.

```
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT (Vue.js 3.5 + Vite)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐   ┌────────────┐  │
│  │  Views   │  │  Stores  │  │           │   │  Services  │  │
│  │ (Pinia)  │  │ (State)  │  │ Vue Router│   │ (API calls)│  │
│  └──────────┘  └──────────┘  └───────────┘   └────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP/REST (JSON)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 SERVER (Spring Boot 3.5.13)                  │
│                                                              │
│  ┌─── Presentation Layer ──────────────────────────────────┐ │
│  │  Controllers (REST Endpoints)                           │ │
│  │  GlobalExceptionHandler                                 │ │
│  │  DTOs (Request / Response)                              │ │
│  └─────────────────────────┬───────────────────────────────┘ │
│                            ▼                                 │
│  ┌─── Business Logic Layer ────────────────────────────────┐ │
│  │  Service Interfaces + Implementations                   │ │
│  │  Event System (OrderReadyEvent + Listener)              │ │
│  │  MapStruct Mappers (DTO ↔ Entity conversion)            │ │
│  └─────────────────────────┬───────────────────────────────┘ │
│                            ▼                                 │
│  ┌─── Security Layer ─────────────────────────────────────┐  │
│  │  JwtAuthFilter → JwtUtils → CustomUserDetailsService   │  │
│  │  SecurityConfig (RBAC + CORS + Stateless Session)      │  │
│  └─────────────────────────┬──────────────────────────────┘  │
│                            ▼                                 │
│  ┌─── Data Access Layer ──────────────────────────────────┐  │
│  │  JPA Repositories (Spring Data JPA)                    │  │
│  │  JPA Entities (12 entities)                            │  │
│  │  Flyway Migrations                                     │  │
│  └─────────────────────────┬──────────────────────────────┘  │
└────────────────────────────┼─────────────────────────────────┘
                             ▼
                    ┌──────────────┐
                    │  MySQL 8.0   │
                    │  (12 tables) │
                    └──────────────┘
```

## 2.2. Chi tiết các tầng

### 2.2.1. Presentation Layer (Tầng trình diễn)

Chịu trách nhiệm tiếp nhận HTTP request từ client, xác thực dữ liệu đầu vào thông qua Jakarta Validation (`@Valid`, `@NotBlank`, `@Pattern`, ...) và trả về HTTP response dưới dạng JSON.

- **7 Controller chính:** AdminController, AuthController, DeliveryController, MenuController, OrderController, RestaurantController, UserController
- **1 Controller bổ sung:** RestaurantCategoryController
- **GlobalExceptionHandler:** Sử dụng `@ControllerAdvice` để xử lý ngoại lệ tập trung, đảm bảo mọi lỗi trả về cùng cấu trúc `ApiResponse`

### 2.2.2. Business Logic Layer (Tầng nghiệp vụ)

Chứa toàn bộ logic xử lý nghiệp vụ, được tổ chức theo pattern **Interface + Implementation**:

- **9 Service interfaces:** AdminService, AuthService, DeliveryService, MenuService, NotificationService, OrderService, ReportService, RestaurantService, UserService
- **9 Service implementations:** tương ứng trong package `service.impl`
- **Event-Driven:** Sử dụng Spring Application Event (`OrderReadyEvent`) để tách rời nghiệp vụ đặt hàng và giao hàng. Khi đơn chuyển sang trạng thái `READY`, event được publish và `OrderEventListener` tự động tạo `DeliveryAssignment` với trạng thái `UNASSIGNED`

### 2.2.3. Security Layer (Tầng bảo mật)

- **JwtAuthFilter:** Bộ lọc mở rộng `OncePerRequestFilter`, trích xuất JWT từ header `Authorization: Bearer <token>`, xác thực và nạp `SecurityContext`
- **JwtUtils:** Quản lý sinh, giải mã và xác thực JWT token sử dụng thuật toán HMAC-SHA với secret key tối thiểu 256-bit
- **CustomUserDetailsService:** Triển khai `UserDetailsService`, tải thông tin người dùng từ `UserRepository` theo email
- **SecurityConfig:** Cấu hình stateless session, CORS mở (`*`), phân quyền dựa trên Role

### 2.2.4. Data Access Layer (Tầng truy cập dữ liệu)

- **12 JPA Repository** interfaces kế thừa `JpaRepository`, cung cấp các phương thức truy vấn tùy chỉnh bằng `@Query` (JPQL và Native SQL)
- **12 JPA Entity** ánh xạ 1-1 với 12 bảng trong cơ sở dữ liệu
- **Flyway Migration:** 3 file migration (`V1`, `V2`, `V3`) quản lý phiên bản schema

## 2.3. Luồng xử lý Request tiêu biểu

```
Client HTTP Request
    ↓
JwtAuthFilter (trích xuất + xác thực JWT)
    ↓
SecurityConfig (kiểm tra quyền truy cập theo Role)
    ↓
Controller (nhận request, validate DTO)
    ↓
Service (xử lý logic nghiệp vụ)
    ↓
MapStruct Mapper (chuyển đổi Entity ↔ DTO)
    ↓
Repository (truy vấn / cập nhật CSDL)
    ↓
Controller (trả về ApiResponse<T>)
    ↓
Client HTTP Response (JSON)
```

## 2.4. Cấu hình môi trường

Hệ thống hỗ trợ **3 profile** Spring Boot:

- **`dev`** (mặc định) — Sử dụng `application-dev.yaml`, kết nối MySQL local, `ddl-auto: update`, `show-sql: true`
- **`prod`** — Sử dụng `application-prod.yaml`, mọi thông tin nhạy cảm qua biến môi trường, `ddl-auto: validate`, `show-sql: false`
- **`test`** — Sử dụng `application-test.yaml`, kết nối MySQL qua Testcontainers (Docker), `ddl-auto: validate`

Ngoài ra, ứng dụng hỗ trợ chế độ **Smoke Mode** (`APP_SMOKE_MODE=true`) cho phép khởi động mà không cần kết nối CSDL, hữu ích cho việc kiểm tra cấu hình.
