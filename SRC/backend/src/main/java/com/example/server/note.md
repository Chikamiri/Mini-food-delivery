# Backend Development Note - Mini Food Delivery

## Project Context

A Spring Boot 3.5.13 backend for a multi-actor food delivery system (Customer, Owner, Shipper, Admin).

## Backend Architecture (Detailed)

```txt
src/main/java/com/example/server/
├── ServerApplication.java              # Main entry point (loads .env variables)
├── config/                             # Application configuration
│   ├── SecurityConfig.java             # [HARDENED] Auth, RBAC, Restrictive CORS & Password Encoding
│   └── WebSocketConfig.java            # [SECURED] STOMP with JWT Interceptor
├── controller/                         # [DONE] REST Endpoints (Admin, Auth, Delivery, Menu, Order, Restaurant, User, RestaurantCategory, OwnerRequest, ShipperRequest)
├── dto/                                # [DONE] Data Transfer Objects (Request/Response)
├── entity/                             # [DONE] JPA Entities (13 core entities with @Version for concurrency)
├── enums/                              # [DONE] State Definitions (Role, OrderStatus, etc.)
├── event/                              # [DONE] Application Events (OrderReadyEvent)
├── exception/                          # [DONE] Error Handling & GlobalAdvice (handles Lock Failures)
├── listener/                           # [DONE] Event Listeners (OrderEventListener - Transactional Integrity)
├── mapper/                             # [DONE] MapStruct Object Mappers
├── repository/                         # [OPTIMIZED] Data Access Layer (Spring Data JPA with @EntityGraph)
├── security/                           # [STATELESS] JWT with Claims, CustomUserDetails & Auth Logic
└── service/                            # [DONE] Business Logic Interfaces
    └── impl/                           # [DONE] Service Implementations (Admin, Auth, Delivery, Menu, Notification, Order, Report, Restaurant, User)
```

## Current Implementation Status

- **Dependencies**: Web, Actuator, Data JPA, Security 6.4, Validation, Flyway (MySQL), Lombok, MapStruct 1.6.3, JJWT 0.13.0, Testcontainers, Dotenv-java 3.1.0, Spring Security Test.
- **Security (Hardened)**:
  - **Stateless JWT**: Tokens now contain `id`, `role`, and `fullName` claims. `JwtAuthFilter` reconstructs the context without DB queries.
  - **IDOR Protection**: Controller/Service layers enforce ownership (e.g., Users only see their own orders; Shippers only see assigned deliveries).
  - **Restrictive CORS**: Wildcard `*` replaced with a whitelist (`http://localhost:5173`).
  - **WebSocket Security**: JWT validation enforced in STOMP `CONNECT` frame. Ownership check for location updates.
- **Performance (Optimized)**:
  - **N+1 Fixed**: Critical associations (`Order->Restaurant`, `Restaurant->Category`) eagerly fetched via `@EntityGraph`.
  - **Transactional Hygiene**: External API calls (`MapService`) moved outside database transactions to prevent connection pool exhaustion.
- **Reliability**:
  - **Concurrency Control**: Optimistic Locking (`@Version`) implemented for `Order` and `DeliveryAssignment` to prevent race conditions during shipper assignment.
  - **Transactional Integrity**: `OrderEventListener` uses `AFTER_COMMIT` to ensure delivery logic only fires for successfully saved orders.
- **Environment**: Dynamic configuration supported via `.env` files in root or `SRC/backend/`.
- **Database**: 13-table schema managed via Flyway (V1-V5). Enforced auditing ensuring `updated_at` is never null.
- **Testing**: Modernized suite using `@MockitoBean`. Verified RBAC, hard-delete logic, and concurrency failures.
- **API Highlights**:
  - `MapService` integrated (Nominatim geocoding, OSRM routing).
  - Multi-actor promotion workflows (Owner/Shipper requests) with Admin approval.
  - `POST /api/dev/db/reset` available in Dev profile.

## Backend Roadmap - Phase 2 (Updated)

1. **Promotion Workflows [DONE]**:
    - [DONE] User request to become Owner/Shipper.
    - [DONE] Admin review/approval system.
    - [DONE] Automatic role update and entity creation.
2. **Security & Performance Remediation [DONE]**:
    - [DONE] WebSocket security & location spoofing prevention.
    - [DONE] IDOR protection across all resource-heavy endpoints.
    - [DONE] N+1 query optimization using Entity Graphs.
    - [DONE] True stateless JWT (claims-based authentication).
    - [DONE] Optimistic locking for high-concurrency operations.
3. Reporting Enhancement [DONE]:
    - [DONE] Admin stats, revenue reports, and CSV exports.
4. Real-time Updates [IN PROGRESS]:
    - [DONE] Secured WebSocket infrastructure.
    - [TODO] Integrate SSE for simple notifications to Customers.
5. Advanced Security [TODO]:
    - Implement Token Refresh mechanism.
    - Account lockout after multiple failed login attempts.
6. DevOps & Infrastructure [TODO]:
    - Multi-stage Dockerfile for optimized builds.
    - GitHub Actions for CI/CD pipeline.
    - API Documentation (Swagger/OpenAPI).

## Design Constraints

- **READY**: Order status triggers `DeliveryAssignment` creation (Transactional Event).
- **UNASSIGNED**: Default status for assignments; protected by Optimistic Locking.
- **COD**: Only Cash on Delivery is supported.
- **Terminal Status**: `DELIVERED` for orders; `COMPLETED` for deliveries.
- **Soft Delete**: Implemented for `Restaurant`, `MenuCategory`, and `MenuItem`.
- **Hard Delete**: Available for `User` and `Address`.
