# ⚙️ PHẦN 4 — TẦNG LOGIC NGHIỆP VỤ (SERVICE LAYER)

---

## 4.1. Tổng quan tổ chức

Tầng nghiệp vụ tuân theo pattern **Interface + Implementation**, với 12 service interfaces và 12 implementations tương ứng:

```
service/
├── AdminService.java         → impl/AdminServiceImpl.java
├── AuthService.java          → impl/AuthServiceImpl.java
├── DeliveryService.java      → impl/DeliveryServiceImpl.java
├── MapService.java           → impl/MapServiceImpl.java
├── MenuService.java          → impl/MenuServiceImpl.java
├── NotificationService.java  → impl/NotificationServiceImpl.java
├── OrderService.java         → impl/OrderServiceImpl.java
├── OwnerRequestService.java  → impl/OwnerRequestServiceImpl.java
├── ReportService.java        → impl/ReportServiceImpl.java
├── RestaurantService.java    → impl/RestaurantServiceImpl.java
├── ShipperRequestService.java→ impl/ShipperRequestServiceImpl.java
└── UserService.java          → impl/UserServiceImpl.java
```

**Quy ước chung:**
- Mọi implementation: `@Service` + `@RequiredArgsConstructor`
- Phương thức ghi dữ liệu: `@Transactional`
- Dependencies: Constructor injection qua Lombok
- Logging: `@Slf4j`

---

## 4.2. Service Dependency Graph

```mermaid
graph TD
    subgraph "Core Services"
        AUTH["AuthService<br/>Login / Register"]
        ORDER["OrderService<br/>Order Lifecycle"]
        DELIVERY["DeliveryService<br/>Delivery Lifecycle"]
        USER["UserService<br/>Profile & Address"]
    end

    subgraph "Domain Services"
        REST["RestaurantService<br/>Search & CRUD"]
        MENU["MenuService<br/>Menu Management"]
        NOTIF["NotificationService<br/>System Alerts"]
        MAP["MapService<br/>External API Gateway"]
    end

    subgraph "Admin Services"
        ADMIN["AdminService<br/>System Administration"]
        REPORT["ReportService<br/>Analytics"]
    end

    subgraph "Workflow Services"
        OWNER_REQ["OwnerRequestService<br/>Owner Application"]
        SHIPPER_REQ["ShipperRequestService<br/>Shipper Application"]
    end

    subgraph "Infrastructure"
        EVT["OrderReadyEvent"]
        LISTENER["OrderEventListener"]
    end

    ORDER -->|"publishes"| EVT
    EVT -->|"AFTER_COMMIT"| LISTENER
    LISTENER -->|"creates assignment"| DELIVERY
    LISTENER -->|"error notification"| NOTIF

    ADMIN -->|"delegates role/status"| USER
    ADMIN -->|"sends notification"| NOTIF
    ORDER -->|"calculates fee"| MAP

    OWNER_REQ -->|"promotes role + creates restaurant"| REST
    SHIPPER_REQ -->|"promotes role + creates location"| USER

    style EVT fill:#ffd700,color:#000
    style LISTENER fill:#ff9800,color:#000
```

---

## 4.3. AuthService — Xác thực & Đăng ký

[AuthServiceImpl.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/service/impl/AuthServiceImpl.java)

### Login Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant AS as AuthServiceImpl
    participant AM as AuthenticationManager
    participant CUDS as CustomUserDetailsService
    participant JWT as JwtUtils
    participant SC as SecurityContextHolder

    C->>AS: login(LoginRequest)
    AS->>AM: authenticate(email, password)
    AM->>CUDS: loadUserByUsername(email)
    CUDS-->>AM: CustomUserDetails
    AM-->>AS: Authentication (verified)
    AS->>SC: setAuthentication(auth)
    AS->>JWT: generateToken(CustomUserDetails)
    JWT-->>AS: JWT String
    AS-->>C: JwtResponse(token, "Bearer", email, fullName, role, userId)
```

### Register Flow

```
1. existsByEmail(email) → true? throw EMAIL_EXISTS (400)
2. BCryptPasswordEncoder.encode(password)
3. new User(email, encodedPw, fullName, phone, "ROLE_CUSTOMER", active=true)
4. userRepository.save(user)
5. generateToken(user.email) → JwtResponse
```

> [!NOTE]
> Registration chỉ tạo `CUSTOMER`. Để trở thành `OWNER` hoặc `SHIPPER`, user phải submit request qua OwnerRequestService / ShipperRequestService.

---

## 4.4. OrderService — Vòng đời đơn hàng

[OrderServiceImpl.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/service/impl/OrderServiceImpl.java) — **295 dòng**, service phức tạp nhất.

### 4.4.1. Create Order — 2-Phase Design

```mermaid
flowchart TD
    A["createOrder(userId, request)"] --> B["Load User & Restaurant"]
    B --> C["Phase 1: calculateDeliveryFee()<br/>(OUTSIDE transaction)"]
    C --> D{"MapService.getRoute()<br/>thành công?"}
    D -->|Yes| E["fee = 5.00 + distance_km × 2.00"]
    D -->|No/Error| F["fee = default (15.00)"]
    E --> G["Phase 2: persistOrder()<br/>(@Transactional)"]
    F --> G
    G --> H["Create Order entity"]
    H --> I["Loop: request.items"]
    I --> J["Load MenuItem by ID"]
    J --> K["Create OrderItem<br/>(SNAPSHOT: name, price)"]
    K --> L["Calculate subtotal per item"]
    L -->|more items| I
    L -->|done| M["order.subtotal = Σ item.subtotal"]
    M --> N["order.totalAmount = subtotal + deliveryFee"]
    N --> O["orderRepository.save(order)<br/>(cascade saves all OrderItems)"]
    O --> P["addStatusHistory(PENDING, 'Order created')"]
    P --> Q["Return OrderSummaryResponse"]
```

> [!IMPORTANT]
> **Tại sao tách 2 phase?** `calculateDeliveryFee()` gọi external API (MapService) có thể chậm/fail. Nếu đặt trong `@Transactional`, connection pool sẽ bị hold lâu. Tách ra ngoài → external call fail không ảnh hưởng transaction.

### 4.4.2. Delivery Fee Calculation

```java
// Base formula: 5.00 VND + 2.00 VND per km
BigDecimal deliveryFee = BigDecimal.valueOf(5.00 + (distanceKm * 2.00))
        .setScale(2, RoundingMode.HALF_UP);
```

Fallback: `${app.delivery.default-fee:15.00}` khi API call thất bại.

### 4.4.3. Update Order Status — Permission Matrix

```
┌────────────────────────┬───────────────────────────────────────┐
│ Target Status          │ Ai có quyền?                         │
├────────────────────────┼───────────────────────────────────────┤
│ CONFIRMED              │ Restaurant Owner (of this order)      │
│ PREPARING              │ Restaurant Owner                     │
│ READY                  │ Restaurant Owner                     │
│ REJECTED               │ Restaurant Owner                     │
│ SHIPPING               │ Assigned Shipper                     │
│ DELIVERED              │ Assigned Shipper                     │
│ CANCELLED              │ Customer (who placed order)          │
│ * (any)                │ ADMIN (always allowed)               │
└────────────────────────┴───────────────────────────────────────┘
```

### 4.4.4. Order Ownership Validation

```mermaid
flowchart TD
    A["validateOrderOwnership(order, requesterId)"] --> B{"Requester<br/>is ADMIN?"}
    B -->|Yes| PASS["✅ Access granted"]
    B -->|No| C{"Requester<br/>= order.user?"}
    C -->|Yes| PASS
    C -->|No| D{"Requester<br/>= restaurant.owner?"}
    D -->|Yes| PASS
    D -->|No| E{"Requester<br/>= assignment.shipper?"}
    E -->|Yes| PASS
    E -->|No| FAIL["❌ AppException FORBIDDEN"]

    style PASS fill:#4caf50,color:#fff
    style FAIL fill:#c62828,color:#fff
```

---

## 4.5. DeliveryService — Vòng đời giao hàng

[DeliveryServiceImpl.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/service/impl/DeliveryServiceImpl.java) — **246 dòng**

### 4.5.1. Delivery Lifecycle

```mermaid
sequenceDiagram
    participant OE as OrderEventListener
    participant DS as DeliveryServiceImpl
    participant OR as OrderRepository
    participant DAR as DeliveryAssignmentRepo
    participant SLR as ShipperLocationRepo
    participant OSHM as OrderStatusHistoryRepo

    Note over OE,DS: Phase 1 — Auto-creation (Event-driven)
    OE->>DS: createUnassignedAssignment(orderId)
    DS->>DAR: findByOrderId(orderId)
    alt Already exists
        DS-->>OE: return (idempotent)
    else Not found
        DS->>DAR: save(new Assignment: UNASSIGNED, shipper=null)
    end

    Note over DS,DAR: Phase 2 — Shipper Assignment
    DS->>DS: assignShipper(orderId, shipperId)
    DS->>DS: validate shipper has ROLE_SHIPPER
    DS->>DAR: update status → ASSIGNED
    DS->>OR: order.status → SHIPPING (if was READY)
    DS->>OSHM: save history("Shipper assigned")

    Note over DS,DAR: Phase 3 — Pickup
    DS->>DS: markPickedUp(shipperId, orderId)
    DS->>DS: validate shipper == assignment.shipper
    DS->>DS: validate status == ASSIGNED
    DS->>DAR: status → PICKED_UP, pickedUpAt = now()

    Note over DS,DAR: Phase 4 — Delivery
    DS->>DS: markDelivered(shipperId, orderId)
    DS->>DS: validate status == PICKED_UP
    DS->>DS: validate codCollected == true
    DS->>DAR: status → DELIVERED, deliveredAt = now()
    DS->>OR: order.status → DELIVERED, isPaid → true
```

### 4.5.2. COD Enforcement

```java
if (Boolean.FALSE.equals(request.getCodCollected())) {
    throw new AppException(HttpStatus.BAD_REQUEST, 
        "COD must be collected to mark as delivered", "COD_NOT_COLLECTED");
}
```

> Shipper **phải** xác nhận thu tiền COD trước khi đánh dấu giao hàng thành công. Đây là business rule bắt buộc.

### 4.5.3. Location Access Control

```
Ai có thể xem vị trí shipper?
├── ADMIN → luôn được
├── Shipper → xem vị trí chính mình
├── Customer → chỉ khi có đơn đang được giao bởi shipper đó
│              (assignment status = ASSIGNED hoặc PICKED_UP)
└── Khác → ❌ FORBIDDEN
```

---

## 4.6. Event-Driven Architecture

### 4.6.1. OrderReadyEvent

[OrderReadyEvent.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/event/OrderReadyEvent.java)

```java
public class OrderReadyEvent extends ApplicationEvent {
    private final Long orderId;
    
    public OrderReadyEvent(Object source, Long orderId) {
        super(source);
        this.orderId = orderId;
    }
}
```

### 4.6.2. OrderEventListener

[OrderEventListener.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/listener/OrderEventListener.java)

```mermaid
flowchart TD
    A["OrderService.updateOrderStatus()"] -->|"status = READY"| B["eventPublisher.publishEvent<br/>(OrderReadyEvent)"]
    B --> C["Transaction COMMITS"]
    C --> D["@TransactionalEventListener<br/>phase = AFTER_COMMIT"]
    D --> E["@Transactional<br/>propagation = REQUIRES_NEW"]
    E --> F["deliveryService.createUnassignedAssignment()"]
    F --> G{"Success?"}
    G -->|Yes| H["✅ Assignment created<br/>log.info()"]
    G -->|No| I["notificationService.createNotification()<br/>userId=1 (Admin), type=SYSTEM_ERROR"]
    I --> J{"Notification<br/>sent?"}
    J -->|No| K["❌ log.error()<br/>(last resort logging)"]
```

**Key design choices:**

| Annotation | Tại sao? |
|:-----------|:---------|
| `@TransactionalEventListener(AFTER_COMMIT)` | Chỉ tạo assignment sau khi order status READY đã persist thành công |
| `@Transactional(REQUIRES_NEW)` | Transaction riêng biệt — nếu tạo assignment fail, không rollback order update |
| Error notification to userId=1 | Convention: Admin user ID #1 nhận system error alerts |

---

## 4.7. OwnerRequestService — Workflow nâng cấp Role

[OwnerRequestServiceImpl.java](file:///c:/Users/bachp/Downloads/Mini-Food-Delivery/SRC/backend/src/main/java/com/example/server/service/impl/OwnerRequestServiceImpl.java)

```mermaid
flowchart LR
    subgraph "Customer submits"
        A["submitRequest()"] --> B{"Pending request<br/>exists?"}
        B -->|Yes| C["❌ PENDING_REQUEST_EXISTS"]
        B -->|No| D["Save OwnerRequest<br/>status = PENDING"]
    end

    subgraph "Admin processes"
        E["processRequest()"] --> F{"Request status<br/>= PENDING?"}
        F -->|No| G["❌ REQUEST_ALREADY_PROCESSED"]
        F -->|Yes| H{"Approved?"}
        H -->|No| I["status = REJECTED<br/>+ admin_note"]
        H -->|Yes| J["promoteToOwner()"]
    end

    subgraph "promoteToOwner() — Atomic"
        J --> K["user.role → ROLE_OWNER"]
        K --> L["Create Restaurant entity<br/>from request data"]
        L --> M["Restaurant defaults:<br/>opening: 08:00<br/>closing: 22:00<br/>isApproved: true<br/>isOpen: true"]
    end

    style C fill:#c62828,color:#fff
    style G fill:#c62828,color:#fff
```

> [!TIP]
> `promoteToOwner()` là **atomic** (`@Transactional`): nếu tạo restaurant fail → role change cũng rollback. Restaurant được tạo tự động từ thông tin trong request, với giờ hoạt động mặc định 8:00–22:00.

---

## 4.8. RestaurantService — Tìm kiếm & Quản lý

### Search Logic

```java
// Repository: dynamic query với optional filters
@Query("SELECT r FROM Restaurant r WHERE " +
       "(:categoryId IS NULL OR r.category.id = :categoryId) AND " +
       "(:keywords IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keywords, '%'))) AND " +
       "r.isApproved = true AND r.isDeleted = false")
Page<Restaurant> searchRestaurants(keywords, categoryId, pageable);
```

**Filters:**
- `keywords` — case-insensitive LIKE trên `name`
- `categoryId` — exact match (nullable = bỏ qua filter)
- **Hard filters:** Chỉ trả về `isApproved=true AND isDeleted=false`
- **Sorting:** Custom `sortBy` + `sortDir` → `Sort.by(Direction, property)`
- **Pagination:** `PageRequest.of(page, size, sort)`

### Ownership Validation

Mọi thao tác write (update, delete) đều kiểm tra:

```java
if (!restaurant.getOwner().getId().equals(ownerId)) {
    throw new AppException(FORBIDDEN, "...", "UNAUTHORIZED_RESTAURANT_ACCESS");
}
```

---

## 4.9. MenuService — CRUD thực đơn

### Validation Chain

```
addMenuItem(ownerId, restaurantId, categoryId, request)
│
├── 1. Load restaurant by restaurantId
├── 2. validateRestaurantOwnership(restaurant, ownerId)
├── 3. Load category by categoryId
├── 4. Verify category.restaurant.id == restaurantId
│      (prevent cross-restaurant item injection)
├── 5. Create MenuItem entity
└── 6. Save and return MenuItemResponse
```

### Soft Delete

```java
deleteMenuItem(ownerId, itemId) {
    item.setIsDeleted(true);  // NOT physical delete
    menuItemRepository.save(item);
}

getMenuItem(id) {
    if (item.getIsDeleted()) throw ResourceNotFoundException;
}
```

---

## 4.10. NotificationService — Thông báo nội bộ

**Sử dụng bởi:**
- `AdminService.approveRestaurant()` → Thông báo owner về kết quả phê duyệt (type: `SYSTEM`)
- `OrderEventListener` → Thông báo admin khi tạo delivery assignment thất bại (type: `SYSTEM_ERROR`)

**Bulk operations:**
```java
// Mark all by type
@Modifying @Query("UPDATE Notification n SET n.isRead = true 
                    WHERE n.user.id = :userId AND n.type = :type")
void markAllByTypeAsRead(userId, type);

// Mark all (global)
@Modifying @Query("UPDATE Notification n SET n.isRead = true 
                    WHERE n.user.id = :userId")
void markAllAsRead(userId);
```

---

## 4.11. ReportService — Analytics

```java
getAdminReport(startDate, endDate) {
    return AdminReportSummaryResponse.builder()
        .startDate(startDate)
        .endDate(endDate)
        .totalRevenue(orderRepo.sumTotalRevenue(start, end) ?? BigDecimal.ZERO)
        .deliveredOrderCount(orderRepo.countDeliveredOrders(start, end))
        .activeUserCount(userRepo.findByRoleAndActiveTrue(...).size())
        .approvedRestaurantCount(restaurantRepo.countByIsApprovedTrue())
        .build();
}
```

Null-safe handling: `sumTotalRevenue()` có thể trả về `null` nếu không có đơn nào → fallback `BigDecimal.ZERO`.

---

## 4.12. MapService — External API Gateway

```java
@Service
public class MapServiceImpl implements MapService {
    private final RestClient restClient;  // Injected from MapClientConfig

    public List<SearchResult> searchAddress(String query) {
        // GET external geocoding API
    }

    public RoutingResponse getRoute(lat1, lng1, lat2, lng2) {
        // GET external routing API
        // Returns: distance (meters), duration (seconds), geometry
    }
}
```

> [!NOTE]
> `MapService` là **gateway pattern** — tách biệt hoàn toàn logic external API khỏi business logic. Nếu cần đổi provider (Google Maps → Mapbox), chỉ cần thay implementation.
