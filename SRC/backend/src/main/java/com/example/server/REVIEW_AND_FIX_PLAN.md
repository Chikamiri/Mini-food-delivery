# Backend Code Review Findings & Fix Plan

This document details critical issues identified during the backend code review and provides a structured plan for remediation.

## 1. Security Vulnerabilities

### 1.1. WebSocket Location Spoofing
- **Detailed Reason:** The `LocationWebSocketController` lacks authentication and authorization at the message level. Any client connected to the WebSocket can send a payload to the location update destination. Since the logic doesn't verify if the sender's authenticated ID matches the `shipperId` provided in the DTO, a malicious user can broadcast fake coordinates for any shipper in the system.
- **Plan to Fix:**
    - Update `WebSocketConfig` to implement a `ChannelInterceptor` that validates the JWT in the `CONNECT` frame headers.
    - Secure the message mapping in `LocationWebSocketController` by injecting the `Principal` or using `@AuthenticationPrincipal`.
    - Validate that the authenticated user ID matches the `shipperId` being updated.

### 1.2. Missing Ownership Checks (IDOR)
- **Detailed Reason:** Several sensitive REST endpoints (Order details, User profile updates, Restaurant management) rely solely on path variables (e.g., `/{id}`) without verifying if the authenticated user owns that resource. This allows an Insecure Direct Object Reference (IDOR) attack where a user can access or modify other users' data by enumerating IDs.
- **Plan to Fix:**
    - Annotate Controller methods with `@PreAuthorize` using SpEL expressions (e.g., `@PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")`).
    - Modify Service layer methods to accept the authenticated `userId` and include it in the `WHERE` clause of JPA queries (e.g., `orderRepository.findByIdAndUserId(id, userId)`).

### 1.3. Overly Permissive CORS Policy
- **Detailed Reason:** `SecurityConfig.java` currently allows all origins (`*`), methods, and headers. This is acceptable for early development but poses a security risk in production, making the application vulnerable to certain CSRF-related exploits and unauthorized cross-origin data access.
- **Plan to Fix:**
    - Restrict `allowedOrigins` to a specific whitelist (e.g., the production frontend URL).
    - Explicitly define `allowedMethods` (GET, POST, PUT, PATCH, DELETE) and `allowedHeaders`.

---

## 2. Technical Debt & Performance

### 2.1. N+1 Query Problems
- **Detailed Reason:** JPA entities use lazy loading for collections (e.g., `Order` -> `OrderItems`). When returning a list of orders, the `OrderMapper` triggers a separate SQL query for each order to fetch its items. For 50 orders, this results in 51 database queries.
- **Plan to Fix:**
    - Use `@EntityGraph` on Repository methods to specify which associations should be eagerly fetched via JOINs.
    - Alternatively, use `JOIN FETCH` in JPQL queries for complex reports.

### 2.2. Inefficient JWT Validation (Statelessness Violation)
- **Detailed Reason:** The current JWT only contains the `subject` (email). This forces the `JwtAuthFilter` to query the database on *every single request* to retrieve the user's ID and Roles, defeating the primary performance benefit of stateless JWTs.
- **Plan to Fix:**
    - Modify `JwtUtils.generateToken()` to include `id` and `role` as custom claims in the JWT payload.
    - Update `JwtAuthFilter` to reconstruct the `UserDetails` object directly from the token claims without querying the `UserRepository`.

### 2.3. External API Calls within Transactions
- **Detailed Reason:** `OrderService` calls `MapService` (which hits external APIs like Nominatim/OSRM) inside methods marked with `@Transactional`. Database connections are held open while waiting for network responses, which can lead to connection pool exhaustion during peak loads or external API outages.
- **Plan to Fix:**
    - Refactor Service logic to perform geocoding/routing calls *before* opening a transaction.
    - Ensure that only database-specific operations are wrapped in `@Transactional`.

---

## 3. Reliability & Concurrency

### 3.1. Shipper Assignment Race Condition
- **Detailed Reason:** If two shippers attempt to accept the same `UNASSIGNED` order at the same time, a race condition occurs. Both threads may see the order as `UNASSIGNED` and proceed to update it, potentially leading to inconsistent state or multiple shippers being "assigned" to the same delivery.
- **Plan to Fix:**
    - Implement Optimistic Locking by adding a `@Version` field to the `DeliveryAssignment` and `Order` entities.
    - Catch `OptimisticLockingFailureException` and return a user-friendly "Order already taken" error.

### 3.2. Transactional Event Integrity
- **Detailed Reason:** `OrderEventListener` currently processes `OrderReadyEvent` immediately. If the transaction that created the order fails and rolls back *after* the event is fired, a `DeliveryAssignment` might be created for a non-existent or cancelled order.
- **Plan to Fix:**
    - Change `@EventListener` to `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` to ensure events are only processed if the originating transaction successfully commits.
