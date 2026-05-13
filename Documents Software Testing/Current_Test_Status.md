# Current Test Status - Mini Food Delivery Backend

## Overview

- **Test Framework**: JUnit 5, Mockito, Spring Boot Test
- **Infrastructure**: Testcontainers (MySQL 8.0)
- **Coverage Tool**: JaCoCo
- **Total Tests**: 65
- **Pass Rate**: 100% (65/65)

## Coverage Analysis (Summary)

Based on the JaCoCo report (2026-05-13):

### High Coverage (> 70% Instructions)
- `Security`: `SecurityConfig`, `JwtAuthFilter`, `CustomUserDetailsService`
- `Services`: `AuthServiceImpl`, `NotificationServiceImpl`
- `Config`: `WebConfig`, `MapClientConfig`, `WebSocketConfig`, `OpenApiConfig`

### Medium Coverage (40% - 70% Instructions)
- `Services`: `OrderServiceImpl`, `DeliveryServiceImpl`, `AdminServiceImpl`, `ReportServiceImpl`
- `Security`: `JwtUtils`

### Low/Zero Coverage (< 40% Instructions)
- `Services`: `RestaurantServiceImpl` (0%), `MenuServiceImpl` (0%), `OwnerRequestServiceImpl` (0%), `ShipperRequestServiceImpl` (0%), `UserServiceImpl` (6%), `MapServiceImpl` (4%)
- `Controllers`: Most controllers have very low coverage (e.g., `RestaurantController` 0%, `UserController` 0%, `AuthController` 0%).
- `Mappers`: MapStruct generated implementations have very low coverage because they are mostly tested indirectly.

## Backend Existing Test Suites

### Unit Tests (`src/test/java/com/example/server/service/impl/`)
- `AdminServiceImplTest`
- `AuthServiceImplTest`
- `DeliveryServiceImplTest`
- `NotificationServiceImplTest`
- `OrderServiceImplTest`
- `ReportServiceImplTest`
- `UserServiceImplTest`

### Integration Tests (`src/test/java/com/example/server/repository/`)
- `EntityMappingIntegrationTest`: Verifies JPA mappings and basic CRUD.
- `OrderRepositoryIntegrationTest`: Verifies complex queries like Haversine distance.
- `RestaurantRepositoryIntegrationTest`: Verifies search and approval queries.
- `UserRepositoryIntegrationTest`: Verifies role and email lookups.

### Security Tests (`src/test/java/com/example/server/security/`)
- `JwtUtilsTest`
- `JwtAuthFilterTest`
- `CustomUserDetailsServiceTest`

### Controller Tests (`src/test/java/com/example/server/controller/`)
- `AdminControllerTest`
- `OrderControllerTest`
- `DeliveryControllerTest`
- `ShipperRequestControllerTest`

## Frontend Existing Test Suites (`SRC/frontend/src/__tests__/`)

### Unit/Component Tests (Vitest)
- `auth.spec.js`: Authentication logic and state management.
- `cart.spec.js`: Cart operations and calculations.
- `CartView.spec.js`: Component rendering for the cart.
- `formatters.spec.js`: Date, currency, and address formatting.
- `pricingUtils.spec.js`: Delivery fee and total calculation logic.
- `validators.spec.js`: Form validation rules.

### E2E/Integration Tests (Cypress)
- `auth.cy.js`: Login/Registration flows.
- `browse.cy.js`: Restaurant browsing and filtering.
- `cart.cy.js`: Adding items and cart persistence.
- `home.cy.js`: Landing page interactions.

## Gaps Identified

1. **Service Layer Gaps**: Critical business logic in `RestaurantService`, `MenuService`, and Promotion Request services (Owner/Shipper) is completely untested.
2. **Controller Layer Gaps**: Public endpoints (Auth, Search) and User Profile endpoints lack coverage.
3. **Edge Case Handling**: Current tests focus on "happy paths". More negative testing (invalid inputs, unauthorized access, concurrency conflicts) is needed.
4. **WebSocket Testing**: `LocationWebSocketController` has very low coverage (4%).
