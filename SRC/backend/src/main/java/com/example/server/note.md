# Backend Development Note - Mini Food Delivery

## Project Context

A Spring Boot 3.5.13 backend for a multi-actor food delivery system (Customer, Owner, Shipper, Admin).

## Backend Architecture (Detailed)

```txt
src/main/java/com/example/server/
├── ServerApplication.java              # Main entry point
├── config/                             # Application configuration
│   └── SecurityConfig.java             # [DONE] Auth, RBAC, CORS & Password Encoding
├── controller/                         # [DONE] REST Endpoints (Admin, Auth, Delivery, Menu, Order, Restaurant, User)
├── dto/                                # [DONE] Data Transfer Objects (Request/Response)
├── entity/                             # [DONE] JPA Entities (12 core entities)
├── enums/                              # [DONE] State Definitions (Role, OrderStatus, etc.)
├── event/                              # [DONE] Application Events (OrderReadyEvent)
├── exception/                          # [DONE] Error Handling & GlobalAdvice
├── listener/                           # [DONE] Event Listeners (OrderEventListener)
├── mapper/                             # [DONE] MapStruct Object Mappers
├── repository/                         # [DONE] Data Access Layer (Spring Data JPA)
├── security/                           # [DONE] JWT, CustomUserDetails & Auth Logic
└── service/                            # [DONE] Business Logic Interfaces
    └── impl/                           # [DONE] Service Implementations
```

## Current Implementation Status

- **Dependencies**: Web, Actuator, Data JPA, Security 6.4, Validation, Flyway (MySQL), Lombok, MapStruct 1.6.3, JJWT 0.13.0, Testcontainers.
- **Security**: Full JWT Stateless Authentication & Role-Based Access Control (RBAC) implemented. CORS configured in `SecurityConfig`.
- **Auth**: `AuthServiceImpl` with BCrypt hashing and JWT token issuance is functional.
- **Testing**: Integrated JaCoCo for coverage; 30+ tests (Unit + Integration) covering core logic.
- **Database**: 12-table schema managed via Flyway (`V1__init_schema.sql`). `MenuCategory.is_deleted` mapped in entity.
- **Messaging**: Event-driven decoupled logic for order-to-delivery handoff via `OrderReadyEvent`.

## Backend Roadmap - Phase 2

1. **Reporting Enhancement [IN-PROGRESS]**:
    - [DONE] Basic Admin Report Summary.
    - [TODO] Export reports to CSV/Excel.
    - [TODO] Restaurant-specific revenue reports.
2. **Real-time Updates [TODO]**:
    - Integrate WebSocket or Server-Sent Events (SSE) for order status updates to Customers.
    - Shipper location tracking (continuous updates).
3. **Advanced Security [TODO]**:
    - Implement Token Refresh mechanism.
    - Account lockout after multiple failed login attempts.
4. **DevOps & Infrastructure [TODO]**:
    - Multi-stage Dockerfile for optimized builds.
    - GitHub Actions for CI/CD pipeline.
    - API Documentation (Swagger/OpenAPI).

## Design Constraints

- **READY**: Order status used when food is ready for delivery; triggers `DeliveryAssignment` creation.
- **UNASSIGNED**: Default status for new delivery assignments before a shipper accepts.
- **COD**: Only Cash on Delivery is supported (PaymentMethod enum).
- **Terminal Status**: `DELIVERED` for orders; `COMPLETED` for deliveries.
- **Soft Delete**: Implemented for `User`, `Restaurant`, `MenuCategory`, and `MenuItem`.
