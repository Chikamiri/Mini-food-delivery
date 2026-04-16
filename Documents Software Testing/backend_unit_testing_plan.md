# Backend Unit Testing Plan

## Objective

Unit testing foundation for the backend services using JUnit 5 and Mockito, ensuring high code coverage and reliability as required by the "Software Quality Assurance" project standards.

## Target Services

- `NotificationServiceImpl`
- `ReportServiceImpl`
- `DeliveryServiceImpl`
- `AdminServiceImpl`

## Implementation Steps

### Step 1: Notification Module Tests

- **File**: `SRC/backend/src/test/java/com/example/server/service/impl/NotificationServiceImplTest.java`
- **Scenarios**:
  - `getUserNotifications()`: Verify list retrieval and DTO mapping.
  - `markAsRead()`:
    - Success: Status updated to `isRead = true`.
    - Error: Notification not found (404).
    - Error: Unauthorized access (403).
  - `markAllAsRead()`: Verify repository calls for both global and type-filtered resets.
  - `createNotification()`: Verify entity creation and persistence.

### Step 2: Delivery Module Tests

- **File**: `SRC/backend/src/test/java/com/example/server/service/impl/DeliveryServiceImplTest.java`
- **Scenarios**:
  - `assignShipper()`:
    - Success: `DeliveryAssignment` created, Order status set to `SHIPPING`.
    - Error: Target user is not a `SHIPPER` role (400).
  - `markPickedUp()` / `markDelivered()`:
    - Success: Assignment status and timestamps updated.
    - Error: Unauthorized update attempt by wrong shipper (403).
  - `updateLocation()`: Verify upsert logic (creates if missing, updates if exists).

### Step 3: Admin & Report Module Tests

- **Files**: `AdminServiceImplTest.java`, `ReportServiceImplTest.java`
- **Admin Scenarios**:
  - Verify `approveRestaurant` updates state and triggers a notification to the owner.
  - Verify role/status updates are delegated correctly.
- **Report Scenarios**:
  - Verify `LocalDate` to `LocalDateTime` conversion (start/end of day).
  - Verify math aggregation (handling nulls from repository).

## Verification & Metrics

1. Execution: `mvn test`
2. Coverage: Review JaCoCo reports in `target/site/jacoco/index.html`. Aim for >80% coverage on core business logic.
