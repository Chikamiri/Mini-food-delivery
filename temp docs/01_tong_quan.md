# PHẦN 1 — TỔNG QUAN DỰ ÁN

## 1.1. Giới thiệu

**Mini Food Delivery** là một hệ thống đặt và giao thức ăn trực tuyến, được xây dựng theo mô hình **Client-Server** với kiến trúc phân tầng (Layered Architecture). Hệ thống phục vụ 4 nhóm tác nhân (actor) chính, mỗi nhóm có bộ chức năng riêng biệt.

## 1.2. Các tác nhân (Actors) của hệ thống

- **CUSTOMER** — Người dùng cuối, thực hiện đặt món ăn từ các nhà hàng, theo dõi đơn hàng và quản lý hồ sơ cá nhân.
- **OWNER** — Chủ nhà hàng, đăng ký nhà hàng, quản lý thực đơn (menu), tiếp nhận và cập nhật trạng thái đơn hàng.
- **SHIPPER** — Người giao hàng, nhận đơn giao, cập nhật vị trí theo thời gian thực và xác nhận hoàn tất giao hàng.
- **ADMIN** — Quản trị viên hệ thống, phê duyệt nhà hàng, quản lý người dùng và xem báo cáo thống kê.

## 1.3. Công nghệ sử dụng

### Backend
- **Framework:** Spring Boot 3.5.13
- **Ngôn ngữ:** Java 17
- **ORM:** Spring Data JPA với Hibernate
- **Cơ sở dữ liệu:** MySQL 8.0
- **Quản lý schema:** Flyway Migration
- **Xác thực:** JWT (JSON Web Token) với thư viện JJWT 0.13.0
- **Bảo mật:** Spring Security 6.4
- **Ánh xạ đối tượng:** MapStruct 1.6.3
- **Tiện ích mã nguồn:** Lombok
- **Tài liệu API:** SpringDoc OpenAPI (Swagger) 2.8.5
- **Giám sát:** Spring Boot Actuator
- **Quản lý cấu hình:** Dotenv-java 3.1.0
- **Build tool:** Apache Maven

### Frontend
- **Framework:** Vue.js 3.5 với Vite
- **Quản lý trạng thái:** Pinia
- **Điều hướng:** Vue Router
- **Kiểm thử E2E:** Cypress
- **Kiểm thử đơn vị:** Vitest

### Kiểm thử tích hợp (Backend)
- **Container hóa:** Testcontainers với MySQL
- **Coverage:** JaCoCo Maven Plugin

## 1.4. Cấu trúc thư mục dự án

### Backend (`SRC/backend/`)
- **`config/`** — Cấu hình ứng dụng: SecurityConfig, OpenApiConfig
- **`controller/`** — Các REST Controller tiếp nhận HTTP request
- **`dto/`** — Data Transfer Objects cho request và response
- **`entity/`** — 12 JPA Entity ánh xạ tới các bảng trong CSDL
- **`enums/`** — Các kiểu liệt kê: Role, OrderStatus, DeliveryAssignmentStatus, PaymentMethod
- **`event/`** — Application Event (OrderReadyEvent)
- **`exception/`** — Xử lý ngoại lệ tập trung
- **`listener/`** — Event Listener (OrderEventListener)
- **`mapper/`** — MapStruct Mapper interfaces
- **`repository/`** — Spring Data JPA Repository interfaces
- **`security/`** — JWT utilities, CustomUserDetails, JwtAuthFilter
- **`service/`** — Service interfaces
- **`service/impl/`** — Service implementations chứa logic nghiệp vụ

### Frontend (`SRC/frontend/`)
- **`src/assets/`** — Tài nguyên tĩnh: icons SVG, CSS stylesheets
- **`src/views/`** — Các màn hình Vue component
- **`src/stores/`** — Pinia stores quản lý state
- **`cypress/`** — E2E test suites

## 1.5. Phương thức thanh toán

Hiện tại hệ thống chỉ hỗ trợ duy nhất phương thức **COD (Cash on Delivery)** — Thanh toán khi nhận hàng, được định nghĩa trong enum `PaymentMethod`.
