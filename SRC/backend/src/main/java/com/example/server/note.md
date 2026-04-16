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
│   ├── AuthController.java             # Login/Register
│   ├── UserController.java             # Profile/Address management
│   ├── RestaurantController.java       # Search/Menu/Categories
│   ├── OrderController.java            # Placement/Tracking
│   ├── DeliveryController.java         # Shipper actions
│   ├── AdminController.java            # Approvals/User management
│   └── ReportController.java           # System/Revenue statistics
├── dto/                                # [DONE] Data Transfer Objects
│   ├── auth/
│   │   ├── JwtResponse.java
│   │   ├── LoginRequest.java
│   │   └── RegisterRequest.java
│   ├── common/
│   │   ├── ApiResponse.java
│   │   └── PageResponse.java
│   ├── delivery/
│   │   ├── AssignShipperRequest.java
│   │   ├── DeliveryAssignmentResponse.java
│   │   ├── MarkDeliveredRequest.java
│   │   ├── MarkPickupRequest.java
│   │   ├── ShipperLocationResponse.java
│   │   └── ShipperLocationUpdateRequest.java
│   ├── notification/
│   │   ├── MarkAllNotificationsReadRequest.java
│   │   ├── MarkNotificationReadRequest.java
│   │   └── NotificationResponse.java
│   ├── order/
│   │   ├── CreateOrderItemRequest.java
│   │   ├── CreateOrderRequest.java
│   │   ├── OrderItemResponse.java
│   │   ├── OrderStatusHistoryResponse.java
│   │   ├── OrderStatusUpdateRequest.java
│   │   ├── OrderSummaryResponse.java
│   │   └── OrderTrackingResponse.java
│   ├── report/
│   │   ├── AdminReportSummaryResponse.java
│   │   └── AdminReportZeroStateResponse.java
│   ├── restaurant/
│   │   ├── MenuCategoryResponse.java
│   │   ├── MenuItemRequest.java
│   │   ├── MenuItemResponse.java
│   │   ├── RestaurantApprovalRequest.java
│   │   ├── RestaurantCardResponse.java
│   │   ├── RestaurantDetailResponse.java
│   │   └── RestaurantSearchRequest.java
│   └── user/
│       ├── AddressRequest.java
│       ├── AddressResponse.java
│       ├── UserProfileResponse.java
│       ├── UserRoleUpdateRequest.java
│       └── UserStatusUpdateRequest.java
├── entity/                             # [DONE] JPA Entities
│   ├── User.java                       # General user (Customer/Owner/Admin/Shipper)
│   ├── Address.java                    # Customer addresses
│   ├── Restaurant.java                 # Business details
│   ├── RestaurantCategory.java         # Global tags (e.g., Pizza, Milk tea)
│   ├── MenuCategory.java               # Restaurant-specific menu groups
│   ├── MenuItem.java                   # Food/Drink items
│   ├── Order.java                      # Order header
│   ├── OrderItem.java                  # Snapshot of items ordered
│   ├── OrderStatusHistory.java         # Status audit trail
│   ├── DeliveryAssignment.java         # Shipper-Order linking
│   ├── ShipperLocation.java            # Real-time coordinates
│   └── Notification.java               # User alerts
├── enums/                              # [DONE] State Definitions
│   ├── Role.java                       # CUSTOMER, OWNER, SHIPPER, ADMIN
│   ├── OrderStatus.java                # PENDING, CONFIRMED, PREPARING, READY, etc.
│   ├── PaymentMethod.java              # COD (Default)
├── DeliveryAssignmentStatus.java   # UNASSIGNED, ASSIGNED, PICKED_UP, DELIVERED
├── exception/                          # [DONE] Error Handling
│   ├── AppException.java               # Generic business exception
│   ├── ResourceNotFoundException.java  # Entity missing
│   └── GlobalExceptionHandler.java     # @ControllerAdvice mapping to ApiResponse
├── mapper/                             # [DONE] MapStruct Object Mappers
│   ├── UserMapper.java
│   ├── AddressMapper.java
│   ├── RestaurantMapper.java
│   ├── MenuMapper.java
├── OrderMapper.java
├── DeliveryMapper.java
└── NotificationMapper.java
├── repository/                         # [DONE] Data Access Layer (JPA)
│   ├── UserRepository.java
│   ├── AddressRepository.java
│   ├── RestaurantRepository.java
│   ├── RestaurantCategoryRepository.java
│   ├── MenuCategoryRepository.java
│   ├── MenuItemRepository.java
│   ├── OrderRepository.java
│   ├── OrderItemRepository.java
│   ├── OrderStatusHistoryRepository.java
│   ├── DeliveryAssignmentRepository.java
│   ├── ShipperLocationRepository.java
│   └── NotificationRepository.java
├── security/                           # [TODO] JWT & Security Logic
│   ├── JwtTokenProvider.java           # Token generation/validation
│   ├── JwtAuthenticationFilter.java    # Request interception
│   ├── UserDetailsServiceImpl.java     # Bridge between Spring Security & User repo
│   └── UserPrincipal.java              # Authenticated user representation
└── service/                            # [IN-PROGRESS] Business Logic
    ├── UserService.java
    ├── RestaurantService.java
    ├── MenuService.java
    ├── OrderService.java
    ├── DeliveryService.java
    ├── AdminService.java
    ├── ReportService.java
    ├── NotificationService.java
    ├── AuthService.java                # [TODO] Logic for login/register
    └── impl/                           # Implementations
        ├── UserServiceImpl.java
        ├── RestaurantServiceImpl.java
        ├── MenuServiceImpl.java
        ├── OrderServiceImpl.java
        ├── DeliveryServiceImpl.java
        ├── AdminServiceImpl.java
        ├── ReportServiceImpl.java
        └── NotificationServiceImpl.java
```

## Current Implementation Status

- **Dependencies**: Spring Boot Web, Data JPA, Security, Validation, MySQL, Lombok, MapStruct, JJWT.
- **Database**: 12-table schema mapped; `application.yaml` connects to `mini_food_db`.
- **Logic**: User, Menu, Restaurant, and Order services are implemented with core CRUD and flow logic.

## Immediate Backend Roadmap

1. **Security Implementation**: Create `security/` package logic and `config/SecurityConfig.java`.
2. **Auth Service**: Implement password encoding (BCrypt) and JWT issue/verify.
3. **Controllers**: Build and test REST endpoints for all major services.
4. **Order-Delivery Link**: Trigger `DeliveryAssignment` automatically when an order is updated to `READY`.

## Design Constraints

- **READY**: Replaces `READY_FOR_PICKUP` for brevity.
- **COD**: Only Cash on Delivery is supported.
- **Terminal Status**: `DELIVERED` is the final success state for all tracking.
