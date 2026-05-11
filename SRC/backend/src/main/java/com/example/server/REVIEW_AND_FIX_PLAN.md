# Backend Code Review Findings & Fix Plan

This document details critical issues identified during the backend code review and provides a structured plan for remediation.

## Phase 1: Security Vulnerabilities (High Priority)

### 1.1. WebSocket Location Spoofing [DONE]

- **Detailed Reason:** The `LocationWebSocketController` lacked authentication and authorization at the message level. Any client connected to the WebSocket could send a payload to the location update destination. Since the logic didn't verify if the sender's authenticated ID matched the `shipperId` provided in the DTO, a malicious user could broadcast fake coordinates for any shipper in the system.
- **Status:**
  - Implemented `ChannelInterceptor` in `WebSocketConfig.java` to validate JWT in `CONNECT` frame.
  - Updated `LocationWebSocketController.java` to enforce ownership check using `@AuthenticationPrincipal` (via `Principal` injection).

### 1.2. Missing Ownership Checks (IDOR) [DONE]

- **Detailed Reason:** Several sensitive REST endpoints (Order details, User profile updates, Restaurant management) relied solely on path variables (e.g., `/{id}`) without verifying if the authenticated user owned that resource. This allowed an Insecure Direct Object Reference (IDOR) attack where a user could access or modify other users' data by enumerating IDs.
- **Status:**
  - Updated `OrderController.java` and `OrderServiceImpl.java` to enforce ownership for order summaries and tracking (restricted to Customer, Restaurant Owner, Shipper, or Admin).
  - Updated `DeliveryController.java` and `DeliveryServiceImpl.java` to enforce ownership for shipper locations and delivery assignments.
  - Verified that `RestaurantServiceImpl.java` and `MenuServiceImpl.java` already had robust ownership checks for management operations.
  - Verified `AdminController.java` is correctly restricted to the `ADMIN` role.

### 1.3. Overly Permissive CORS Policy [DONE]

- **Detailed Reason:** `SecurityConfig.java` originally allowed all origins (`*`), methods, and headers. This posed a security risk in production, making the application vulnerable to certain CSRF-related exploits and unauthorized cross-origin data access.
- **Status:**
  - Restricted `allowedOrigins` to a specific whitelist (standard Vite dev ports `http://localhost:5173`).
  - Explicitly defined `allowedMethods`, `allowedHeaders`, and `exposedHeaders`.
  - Enabled `allowCredentials` and set `maxAge` for preflight caching.

---

## Phase 2: Technical Debt & Performance (Medium Priority)

### 2.1. N+1 Query Problems [DONE]

- **Detailed Reason:** JPA entities used lazy loading for collections and associations. When returning lists, the mappers triggered separate SQL queries for each entity to fetch its related data (e.g., Order -> Restaurant, Restaurant -> Category).
- **Status:**
  - Implemented `@EntityGraph` in `OrderRepository.java` to fetch `restaurant` for list views and all related entities for detailed views.
  - Implemented `@EntityGraph` in `RestaurantRepository.java` to eagerly fetch `category` and `owner`.
  - Implemented `@EntityGraph` in `MenuItemRepository.java` to fetch `category`.

### 2.2. Inefficient JWT Validation (Statelessness Violation) [TODO]

- **Detailed Reason:** The current JWT only contains the `subject` (email). This forces the `JwtAuthFilter` to query the database on *every single request* to retrieve the user's ID and Roles, defeating the primary performance benefit of stateless JWTs.
- **Plan to Fix:**
  - Modify `JwtUtils.generateToken()` to include `id` and `role` as custom claims in the JWT payload.
  - Update `JwtAuthFilter` to reconstruct the `UserDetails` object directly from the token claims without querying the `UserRepository`.

### 2.3. External API Calls within Transactions [TODO]

- **Detailed Reason:** `OrderService` calls `MapService` (which hits external APIs like Nominatim/OSRM) inside methods marked with `@Transactional`. Database connections are held open while waiting for network responses, which can lead to connection pool exhaustion during peak loads or external API outages.
- **Plan to Fix:**
  - Refactor Service logic to perform geocoding/routing calls *before* opening a transaction.
  - Ensure that only database-specific operations are wrapped in `@Transactional`.

---

## Phase 3: Reliability & Concurrency (Long-term)

### 3.1. Shipper Assignment Race Condition [TODO]

- **Detailed Reason:** If two shippers attempt to accept the same `UNASSIGNED` order at the same time, a race condition occurs. Both threads may see the order as `UNASSIGNED` and proceed to update it, potentially leading to inconsistent state or multiple shippers being "assigned" to the same delivery.
- **Plan to Fix:**
  - Implement Optimistic Locking by adding a `@Version` field to the `DeliveryAssignment` and `Order` entities.
  - Catch `OptimisticLockingFailureException` and return a user-friendly "Order already taken" error.

### 3.2. Transactional Event Integrity [DONE]

- **Detailed Reason:** `OrderEventListener` originally processed events immediately. If the transaction that created the order failed, a delivery assignment might still be created.
- **Status:** Verified that `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` is already implemented in `OrderEventListener.java`.
