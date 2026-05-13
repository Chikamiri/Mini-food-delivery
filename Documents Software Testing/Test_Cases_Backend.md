# Detailed Test Cases - Backend

## 1. Authentication Service (`AuthService`)

| ID | Case | Expected Result |
|:---|:---|:---|
| AUTH-001 | Successful Login | Returns JWT, user info, role CUSTOMER |
| AUTH-002 | Login with Invalid Credentials | Returns 401 UNAUTHORIZED |
| AUTH-003 | Registration with Existing Email | Returns 400 BAD_REQUEST (EMAIL_EXISTS) |
| AUTH-004 | Registration with Weak Password | Returns 400 BAD_REQUEST (Validation Error) |

## 2. Restaurant & Menu Management

| ID | Case | Expected Result |
|:---|:---|:---|
| RM-001 | Create Restaurant (Owner) | Restaurant created, status PENDING |
| RM-002 | Update Restaurant (Not Owner) | Returns 403 FORBIDDEN |
| RM-003 | Soft Delete Restaurant | `is_deleted` set to true, not found in public search |
| RM-004 | Add Menu Item to Category | Item added, price/image validated |
| RM-005 | Add Item to Another Restaurant's Category | Returns 400 BAD_REQUEST (INVALID_CATEGORY) |
| RM-006 | Search Restaurant by Category | Returns only restaurants in that category |

## 3. Order Management

| ID | Case | Expected Result |
|:---|:---|:---|
| ORD-001 | Create Order (Successful) | Fee calculated, OrderItems snapshotted, Status PENDING |
| ORD-002 | Map API Failure during Order | Order created using default delivery fee fallback |
| ORD-003 | Transition PENDING -> CONFIRMED | Valid (Owner only) |
| ORD-004 | Transition SHIPPING -> CANCELLED | Returns 400 BAD_REQUEST (INVALID_TRANSITION) |
| ORD-005 | View Order Details (Unauthorized) | Returns 403 FORBIDDEN |
| ORD-006 | Concurrent Update (Optimistic Lock) | Second update fails with 409 CONCURRENCY_FAILURE |

## 4. Delivery & Tracking

| ID | Case | Expected Result |
|:---|:---|:---|
| DEL-001 | Auto-create Assignment on READY | Event triggered, UNASSIGNED assignment created |
| DEL-002 | Shipper Self-Assigns Order | Assignment status -> ASSIGNED, Order -> SHIPPING |
| DEL-003 | Mark Delivered without COD | Returns 400 BAD_REQUEST (COD_NOT_COLLECTED) |
| DEL-004 | Update Location (WebSocket) | Location persisted, broadcast to /topic/order/{id} |
| DEL-005 | Access Location (No active order) | Returns 403 FORBIDDEN |

## 5. Admin & Workflows

| ID | Case | Expected Result |
|:---|:---|:---|
| ADM-001 | Approve Owner Request | User role -> OWNER, Restaurant created automatically |
| ADM-002 | Reject Owner Request | Request status -> REJECTED, Notification sent to user |
| ADM-003 | Generate System-wide Revenue Report | Returns aggregated data by restaurant |
| ADM-004 | Export Report to CSV | Returns valid CSV file stream |
| ADM-005 | Change User Role (Admin) | User role updated in database |

## 6. Real-time Notifications

| ID | Case | Expected Result |
|:---|:---|:---|
| NOT-001 | Order Status Change Notification | Notification entity created for Customer |
| NOT-002 | Mark Notification as Read | `is_read` flag set to true |
| NOT-003 | Mark All Notifications Read | All user's notifications updated |
