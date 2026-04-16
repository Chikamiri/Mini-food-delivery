# Backend Testing Plan

## Objective

Testing foundation for the backend services using JUnit 5, Mockito, and Testcontainers. This ensures high code coverage and verifies that complex native queries work correctly against a real MySQL instance, fulfilling the "Software Quality Assurance" project standards.

## Target Modules

- **Services**: `NotificationServiceImpl`, `ReportServiceImpl`, `DeliveryServiceImpl`, `AdminServiceImpl`.
- **Repositories**: `OrderRepository`, `UserRepository`, `RestaurantRepository`.

## Implementation Steps

### Step 1: Notification Module Unit Tests (Mockito)

- **File**: `SRC/backend/src/test/java/com/example/server/service/impl/NotificationServiceImplTest.java`
- **Scenarios**:
  - `getUserNotifications()`: Verify list retrieval and DTO mapping.
  - `markAsRead()`:
    - Success: Status updated to `isRead = true`.
    - Error: Notification not found (404).
    - Error: Unauthorized access (403).
  - `markAllAsRead()`: Verify repository calls for both global and type-filtered resets.
  - `createNotification()`: Verify entity creation and persistence.

### Step 2: Delivery Module Unit Tests (Mockito)

- **File**: `SRC/backend/src/test/java/com/example/server/service/impl/DeliveryServiceImplTest.java`
- **Scenarios**:
  - `assignShipper()`:
    - Success: `DeliveryAssignment` created, Order status set to `SHIPPING`.
    - Error: Target user is not a `SHIPPER` role (400).
  - `markPickedUp()` / `markDelivered()`:
    - Success: Assignment status and timestamps updated.
    - Error: Unauthorized update attempt by wrong shipper (403).
  - `updateLocation()`: Verify upsert logic (creates if missing, updates if exists).

### Step 3: Admin & Report Module Unit Tests (Mockito)

- **Files**: `AdminServiceImplTest.java`, `ReportServiceImplTest.java`
- **Admin Scenarios**:
  - Verify `approveRestaurant` updates state and triggers a notification.
- **Report Scenarios**:
  - Verify `LocalDate` to `LocalDateTime` conversion and math aggregation (handling nulls).

### Step 4: Integration Testing (Testcontainers + MySQL)

- **Objective**: Verify database integrity and complex SQL logic that cannot be tested with Mockito.
- **Setup**:
  - Use `org.testcontainers:mysql` to spin up a real MySQL instance during the test phase.
  - Define a `BaseIntegrationTest` to manage the container lifecycle.
- **Key Tests**:
  - **`OrderRepositoryIntegrationTest`**: Verify the `findAvailableOrdersNearLocation` native query (Distance math verification).
  - **`Repository Constraint Tests`**: Ensure `UNIQUE` constraints (email, phone) and `FOREIGN KEY` behaviors are enforced as expected.
  - **Data Mapping**: Verify that complex `@OneToMany` relationships (e.g., `User` -> `Addresses`) persist and retrieve correctly.

## Verification & Metrics

1. Execution: `mvn test`
2. Coverage: Review JaCoCo reports in `target/site/jacoco/index.html`. Aim for >80% coverage on core business logic.
3. Reliability: Ensure zero "false positives" by testing against the actual MySQL engine.
