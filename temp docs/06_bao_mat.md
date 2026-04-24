# PHẦN 6 — BẢO MẬT VÀ XÁC THỰC

## 6.1. Tổng quan cơ chế bảo mật

Hệ thống sử dụng mô hình xác thực **Stateless JWT** kết hợp **Role-Based Access Control (RBAC)** thông qua Spring Security 6.4. Không sử dụng session phía server; mọi thông tin xác thực được mang theo trong JWT token ở mỗi request.

## 6.2. Luồng xác thực (Authentication Flow)

```
1. Client gửi POST /api/auth/login { email, password }
       ↓
2. AuthServiceImpl → AuthenticationManager.authenticate()
       ↓
3. CustomUserDetailsService.loadUserByUsername(email)
   → Tải User từ UserRepository
   → Tạo CustomUserDetails (id, email, password, fullName, authorities)
       ↓
4. AuthenticationManager xác thực password (BCrypt)
       ↓
5. JwtUtils.generateToken(email) → Sinh JWT token
   - Algorithm: HMAC-SHA (HS256+)
   - Payload: subject=email, issuedAt, expiration
   - Secret: cấu hình qua ${app.jwt.secret} (tối thiểu 256-bit)
   - Expiration: ${app.jwt.expiration-ms} (mặc định 86400000ms = 24h)
       ↓
6. Trả về JwtResponse { accessToken, tokenType="Bearer", email, fullName, role, userId }
```

## 6.3. Luồng ủy quyền (Authorization Flow)

```
1. Client gửi request với header: Authorization: Bearer <jwt_token>
       ↓
2. JwtAuthFilter.doFilterInternal() (OncePerRequestFilter)
   - parseJwt(): Trích xuất token từ header (bỏ prefix "Bearer ")
   - jwtUtils.validateToken(jwt): Xác thực chữ ký, hạn sử dụng
   - jwtUtils.getUsernameFromToken(jwt): Lấy email từ subject
       ↓
3. CustomUserDetailsService.loadUserByUsername(email)
   → CustomUserDetails.build(user)
   → Authority: "ROLE_" + user.getRole() (VD: ROLE_ADMIN)
       ↓
4. Tạo UsernamePasswordAuthenticationToken + set SecurityContext
       ↓
5. SecurityConfig kiểm tra quyền truy cập endpoint
   → permitAll() hoặc hasRole() matching
       ↓
6. Request tiếp tục tới Controller hoặc bị chặn (HTTP 403)
```

## 6.4. SecurityConfig — Chi tiết cấu hình

- **CSRF:** Disabled (vì sử dụng JWT stateless)
- **Session Management:** `SessionCreationPolicy.STATELESS`
- **CORS:** Cho phép mọi origin (`*`), mọi method, mọi header
- **Password Encoder:** `BCryptPasswordEncoder`
- **JwtAuthFilter:** Được thêm trước `UsernamePasswordAuthenticationFilter` trong filter chain

### Phân quyền endpoint

- **Public (permitAll):** `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**`, `/api/restaurant-categories`
- **ADMIN:** `/api/admin/**`
- **SHIPPER:** `/api/deliveries/**`
- **OWNER:** Các endpoint quản lý nhà hàng, menu
- **CUSTOMER:** Tạo đơn hàng, lịch sử đơn
- **Authenticated (bất kỳ role):** `/api/users/**`, tracking đơn hàng

## 6.5. CustomUserDetails

Triển khai interface `UserDetails` của Spring Security với các trường:

- **id** (Long) — ID người dùng
- **email** (String) — Dùng làm username
- **password** (String) — Mật khẩu đã mã hóa
- **fullName** (String)
- **authorities** (Collection) — Danh sách quyền, luôn chứa 1 phần tử: `SimpleGrantedAuthority("ROLE_" + role)`

Các method `isAccountNonExpired()`, `isAccountNonLocked()`, `isCredentialsNonExpired()`, `isEnabled()` đều trả về `true` (chưa triển khai logic khóa tài khoản).

## 6.6. JwtUtils — Tiện ích JWT

- **`generateToken(username)`** — Sinh token với `Jwts.builder()`, set subject, issuedAt, expiration, signWith
- **`getUsernameFromToken(token)`** — Parse token, lấy subject (email)
- **`validateToken(token)`** — Xác thực token, bắt và log các exception: MalformedJwtException, ExpiredJwtException, UnsupportedJwtException, IllegalArgumentException

## 6.7. Xử lý ngoại lệ tập trung (GlobalExceptionHandler)

Sử dụng `@ControllerAdvice` với 4 handler:

- **`MethodArgumentNotValidException`** → HTTP 400, mã `VALIDATION_ERROR`, data chứa map field → error message
- **`ResourceNotFoundException`** → HTTP 404, mã `RESOURCE_NOT_FOUND`
- **`AppException`** → HTTP status tùy thuộc exception (400, 401, 403, ...), mã lỗi tùy chỉnh
- **`Exception`** (catch-all) → HTTP 500, mã `INTERNAL_SERVER_ERROR`

Tất cả response lỗi tuân theo cấu trúc `ApiResponse<Object>` { success=false, message, timestamp, errorCode, data }.

## 6.8. Các mã lỗi nghiệp vụ (Error Codes)

- **AUTH_FAILED** — Email hoặc mật khẩu không đúng
- **EMAIL_EXISTS** — Email đã được sử dụng
- **INVALID_ROLE** — Người dùng không có vai trò phù hợp (VD: gán đơn cho non-shipper)
- **INVALID_TRANSITION** — Chuyển trạng thái đơn hàng không hợp lệ
- **INVALID_STATE** — Trạng thái assignment không đúng để thực hiện thao tác
- **INVALID_CATEGORY** — Category không thuộc restaurant
- **COD_NOT_COLLECTED** — Chưa thu tiền COD khi giao hàng
- **UNAUTHORIZED_UPDATE** — Shipper không có quyền cập nhật assignment này
- **UNAUTHORIZED_RESTAURANT_ACCESS** — Không phải chủ nhà hàng
- **UNAUTHORIZED_ADDRESS_ACCESS** — Địa chỉ không thuộc người dùng
- **UNAUTHORIZED_NOTIFICATION_ACCESS** — Thông báo không thuộc người dùng
