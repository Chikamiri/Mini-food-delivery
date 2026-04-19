# Backend Development Note - Mini Food Delivery

## Project Context

A Spring Boot 3.5.13 backend for a multi-actor food delivery system (Customer, Owner, Shipper, Admin).

## Backend Architecture (Detailed)

```txt
src/main/java/com/example/server/
├── ServerApplication.java              # Main entry point
├── config/                             # [IN-PROGRESS] Application configuration
│   ├── SecurityConfig.java             # [DONE] Auth & RBAC
│   └── WebConfig.java                  # [TODO] CORS & MVC configuration
├── controller/                         # [TODO] REST Endpoints
├── dto/                                # [DONE] Data Transfer Objects
├── entity/                             # [DONE] JPA Entities
├── enums/                              # [DONE] State Definitions
├── exception/                          # [DONE] Error Handling & GlobalAdvice
├── mapper/                             # [DONE] MapStruct Object Mappers
├── repository/                         # [DONE] Data Access Layer (JPA)
├── security/                           # [DONE] JWT & Security Logic
└── service/                            # [DONE] Business Logic
    ├── UserService.java                # [DONE]
    ├── RestaurantService.java          # [DONE]
    ├── MenuService.java                # [DONE]
    ├── OrderService.java               # [DONE]
    ├── DeliveryService.java            # [DONE]
    ├── AdminService.java               # [DONE]
    ├── ReportService.java              # [DONE]
    ├── NotificationService.java        # [DONE]
    ├── AuthService.java                # [DONE]
    └── impl/                           # [DONE] Implementations
```

## Current Implementation Status

- **Dependencies**: Web, Data JPA, Security 6.4, Validation, MySQL, Lombok, MapStruct, JJWT, Testcontainers.
- **Security**: Full JWT Stateless Authentication & Role-Based Access Control (RBAC) implemented.
- **Auth**: `AuthServiceImpl` with BCrypt hashing and JWT token issuance is functional.
- **Testing**: 28 tests passing (Unit + Integration).
- **Database**: 12-table schema mapped; Role strings refactored to type-safe constants.

## Immediate Backend Roadmap

1. **Controllers [CRITICAL]**:
    - Build REST endpoints for all major modules: Auth, Admin, User, Restaurant, Menu, Order, Delivery.
    - Annotate with `@RestController` and utilize `@PreAuthorize` for fine-grained security.
2. **Order-Delivery Integration**: Automate `DeliveryAssignment` triggering within `OrderServiceImpl` when status is set to `READY`.
3. **Configuration**: Add `WebConfig.java` for global CORS/MVC settings.
4. **Validation**: Ensure all DTOs are strictly validated at the controller entry point.

## Design Constraints

- **READY**: Order status used when food is ready for delivery.
- **UNASSIGNED**: Default status for new delivery assignments.
- **COD**: Only Cash on Delivery is supported.
- **Terminal Status**: `DELIVERED` is the final success state.
