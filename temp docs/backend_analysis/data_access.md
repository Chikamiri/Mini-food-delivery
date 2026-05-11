# Data Access Layer Analysis

This document details the JPA Repositories and data access patterns used in the Mini Food Delivery backend.

## 1. AddressRepository
- **Entities:** `Address`
- **Custom Methods:**
    - `findByUserId`: Retrieves all addresses for a specific user.
    - `findByUserIdAndIsDefaultTrue`: Finds the user's default delivery address.

## 2. DeliveryAssignmentRepository
- **Entities:** `DeliveryAssignment`
- **Custom Methods:**
    - `findByOrderId`: Links a delivery to its order.
    - `findByShipperIdAndStatusIn`: Find active assignments for a shipper.
    - `findAllByShipperIsNullAndStatus`: Finds pool of available orders for shippers.

## 3. MenuCategoryRepository
- **Entities:** `MenuCategory`
- **Custom Methods:**
    - `findByRestaurantIdOrderBySortOrderAsc`: Retrieves organized menu structure.

## 4. MenuItemRepository
- **Entities:** `MenuItem`
- **Custom Queries:**
    - `findBrowseItems`: Custom JPQL joining `MenuItem` and `MenuCategory` to filter by restaurant and availability.

## 5. NotificationRepository
- **Entities:** `Notification`
- **Custom Queries:**
    - `markAllAsRead`: Bulk `@Modifying` update for user notifications.
    - `markAllByTypeAsRead`: Filtered bulk update.

## 6. OrderRepository
- **Entities:** `Order`
- **Custom Queries:**
    - `findDeliveredOrdersForReport`: Date-range filtering for delivered orders.
    - `findAvailableOrdersNearLocation`: **Native Query** using the Haversine formula to find orders within a radius of a shipper's location.
    - `sumTotalRevenue`: Aggregates total amount for delivered orders in a date range.
    - `findRestaurantRevenue`: Complex group-by query returning `Object[]` for restaurant-specific statistics.

## 7. OrderStatusHistoryRepository
- **Entities:** `OrderStatusHistory`
- **Custom Methods:**
    - `findByOrderIdOrderByCreatedAtDesc`: Retrieves the full audit trail of an order's status changes.

## 8. OwnerRequestRepository
- **Entities:** `OwnerRequest`
- **Custom Methods:**
    - `findByStatus`: Used by admins to find `PENDING` requests.

## 9. RestaurantRepository
- **Entities:** `Restaurant`
- **Custom Queries:**
    - `searchRestaurants`: Complex search logic with optional keyword matching (case-insensitive) and category filtering, combined with pagination.
    - `findByIsApprovedFalseAndIsDeletedFalse`: Identifies new restaurants for review.

## 10. ShipperLocationRepository
- **Entities:** `ShipperLocation`
- **Custom Queries:**
    - `updateOnlineStatus`: `@Modifying` update to toggle shipper availability.

## 11. UserRepository
- **Entities:** `User`
- **Custom Methods:**
    - `findByEmail`: Used for authentication.
    - `existsByEmail`: Used during registration.
    - `findByRoleAndActiveTrue`: Finds active users by role.

## 12. OrderItemRepository
- **Entities:** `OrderItem`
- **Purpose:** Simple CRUD for items linked to orders.

## 13. RestaurantCategoryRepository
- **Entities:** `RestaurantCategory`
- **Purpose:** Manages the global list of restaurant types.
