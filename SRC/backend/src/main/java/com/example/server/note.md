# Backend Development Note - Mini Food Delivery

## Project Context

A Spring Boot 3.5.13 backend for a multi-actor food delivery system (Customer, Owner, Shipper, Admin).

## Backend Architecture (Detailed)

```txt
src/main/java/com/example/server/
├── ServerApplication.java              # Main entry point
├── config/                             # [TODO] Application configuration
│   ├── SecurityConfig.java             # Auth & Role-based access control
│   └── WebConfig.java                  # CORS & MVC configuration
├── controller/                         # [TODO] REST Endpoints
├── dto/                                # [DONE] Data Transfer Objects
├── entity/                             # [DONE] JPA Entities
├── enums/                              # [DONE] State Definitions
├── exception/                          # [DONE] Error Handling & GlobalAdvice
├── mapper/                             # [DONE] MapStruct Object Mappers
├── repository/                         # [DONE] Data Access Layer (JPA)
├── security/                           # [TODO] JWT & Security Logic
└── service/                            # [IN-PROGRESS] Business Logic
    ├── UserService.java                # [DONE]
    ├── RestaurantService.java          # [DONE]
    ├── MenuService.java                # [DONE]
    ├── OrderService.java               # [DONE]
    ├── DeliveryService.java            # [DONE]
    ├── AdminService.java               # [DONE]
    ├── ReportService.java              # [DONE]
    ├── NotificationService.java        # [DONE]
    ├── AuthService.java                # [TODO]
    └── impl/                           # Implementations
```

## Current Implementation Status

- **Dependencies**: Spring Boot Web, Data JPA, Security, Validation, MySQL, Lombok, MapStruct, JJWT, Testcontainers.
- **Services**: All core business services implemented (AuthService remains [TODO]).
- **Testing**: Full coverage with JUnit 5 + Mockito (Unit) and Testcontainers + MySQL (Integration).
- **Exceptions**: `AppException` refactored with `HttpStatus` (400, 403, 404) and `@NonNull` status.
- **Database**: 12-table schema mapped; `UNASSIGNED` set as default for delivery.

## Immediate Backend Roadmap

1. **Security Layer [CRITICAL]**:
    - Create `security/` package for JWT Filter and Authentication Provider.
    - Implement `config/SecurityConfig.java` for RBAC (Role-Based Access Control) and CORS.
2. **Auth Service**: Implement `AuthServiceImpl` with BCrypt password encoding and JWT token issuance.
3. **Controllers [High Priority]**: Build REST endpoints for all major services (Admin, User, Restaurant, Order, Delivery).
4. **Order-Delivery Integration**: Automate `DeliveryAssignment` triggering within `OrderServiceImpl` when status is set to `READY`.
5. **Global Configuration**: Add `WebConfig.java` for MVC/CORS patterns.

## Design Constraints

- **READY**: Order status used when food is ready for delivery.
- **UNASSIGNED**: Default status for new delivery assignments.
- **COD**: Only Cash on Delivery is supported.
- **Terminal Status**: `DELIVERED` is the final success state.
