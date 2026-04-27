# Backend Development Note - Mini Food Delivery

## Project Context

A Spring Boot 3.5.13 backend for a multi-actor food delivery system (Customer, Owner, Shipper, Admin).

## Backend Architecture (Detailed)

```txt
src/main/java/com/example/server/
├── ServerApplication.java              # Main entry point (loads .env variables)
├── config/                             # Application configuration
│   └── SecurityConfig.java             # [DONE] Auth, RBAC, CORS & Password Encoding
├── controller/                         # [DONE] REST Endpoints (Admin, Auth, Delivery, Menu, Order, Restaurant, User, RestaurantCategory, OwnerRequest)
├── dto/                                # [DONE] Data Transfer Objects (Request/Response)
├── entity/                             # [DONE] JPA Entities (13 core entities with JPA auditing)
├── enums/                              # [DONE] State Definitions (Role, OrderStatus, etc.)
├── event/                              # [DONE] Application Events (OrderReadyEvent)
├── exception/                          # [DONE] Error Handling & GlobalAdvice
├── listener/                           # [DONE] Event Listeners (OrderEventListener)
├── mapper/                             # [DONE] MapStruct Object Mappers
├── repository/                         # [DONE] Data Access Layer (Spring Data JPA)
├── security/                           # [DONE] JWT, CustomUserDetails & Auth Logic
└── service/                            # [DONE] Business Logic Interfaces
    └── impl/                           # [DONE] Service Implementations (Admin, Auth, Delivery, Menu, Notification, Order, Report, Restaurant, User)
```

## Current Implementation Status

- **Dependencies**: Web, Actuator, Data JPA, Security 6.4, Validation, Flyway (MySQL), Lombok, MapStruct 1.6.3, JJWT 0.13.0, Testcontainers, Dotenv-java 3.1.0, Spring Security Test.
- **Security**: Full JWT Stateless Authentication & Role-Based Access Control (RBAC). **JWT Secret minimum size (256-bit) enforced.**
- **Environment**: Dynamic configuration supported via `.env` files in root or `SRC/backend/`.
- **Auth**: `AuthServiceImpl` functional. Fixed `updated_at` null constraint during registration.
- **Database**: 13-table schema managed via Flyway.
  - `V2`: Fixed missing `is_deleted` in `categories`.
  - `V3`: Seeded initial `RestaurantCategory` data (Rice, Fast Food, etc.).
  - `V4`: Added `owner_requests` table.
  - `V5`: Enforced `ON DELETE CASCADE` on all user-related foreign keys for hard-delete reliability.
- **Auditing**: Manual JPA auditing via `@PrePersist` and `@PreUpdate` fixed to ensure `updated_at` is never null on creation.
- **Testing**:
  - Added `AdminControllerTest` (verifies RBAC safety and self-deletion blocks).
  - Added `UserServiceImplTest` (verifies hard-delete logic).
  - Modernized test suite using `@MockitoBean` (Spring Boot 3.4+ standard).
- **API**:
  - Added `GET /api/restaurant-categories` to support frontend browsing.
  - Added missing Admin endpoints: `GET /api/admin/stats`, `GET /api/admin/users`, `GET /api/admin/restaurants/pending`.
  - Added `OwnerRequest` endpoints for User promotion workflow.
  - Added `POST /api/dev/db/reset` for rapid database re-initialization (Dev profile only).
  - Added `MapService` using OpenStreetMap (Nominatim for geocoding, OSRM for routing).

## Backend Roadmap - Phase 2

1. **Owner Promotion [DONE]**:
    - [DONE] User request to become Owner.
    - [DONE] Admin review and approval system.
    - [DONE] Automatic role update and restaurant creation.
2. **Shipper Promotion [DONE]**:
    - [DONE] User request to become Shipper (Phone & License Plate).
    - [DONE] Admin review and approval system.
    - [DONE] Automatic role update and default location creation.
3. Reporting Enhancement [DONE]:
    - [DONE] Basic Admin Report Summary.
    - [DONE] Export reports to CSV.
    - [DONE] Restaurant-specific revenue reports.
3. Real-time Updates [TODO]:
    - Integrate WebSocket or Server-Sent Events (SSE) for order status updates to Customers.
    - Shipper location tracking (continuous updates).
4. Advanced Security [TODO]:
    - Implement Token Refresh mechanism.
    - Account lockout after multiple failed login attempts.
5. DevOps & Infrastructure [TODO]:
    - Multi-stage Dockerfile for optimized builds.
    - GitHub Actions for CI/CD pipeline.
    - API Documentation (Swagger/OpenAPI).

## Design Constraints

- **READY**: Order status used when food is ready for delivery; triggers `DeliveryAssignment` creation.
- **UNASSIGNED**: Default status for new delivery assignments before a shipper accepts.
- **COD**: Only Cash on Delivery is supported (PaymentMethod enum).
- **Terminal Status**: `DELIVERED` for orders; `COMPLETED` for deliveries.
- **Soft Delete**: Implemented for `Restaurant`, `MenuCategory`, and `MenuItem`.
- **Hard Delete**: Available for `User` (Admin or Self-deletion) and `Address`.
