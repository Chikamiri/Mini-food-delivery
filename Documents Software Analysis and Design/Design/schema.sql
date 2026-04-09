-- ============================================================
-- Mini Food Delivery - Database Schema
-- Database: MySQL
-- Version: 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS mini_food_delivery
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mini_food_delivery;

-- ============================================================
-- 1. users
-- Tat ca nguoi dung: USER, SHIPPER, RESTAURANT_OWNER, ADMIN
-- ============================================================
CREATE TABLE users (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(100)    NOT NULL,
    phone       VARCHAR(15)     UNIQUE,
    avatar_url  VARCHAR(500),
    role        ENUM('USER', 'SHIPPER', 'RESTAURANT_OWNER', 'ADMIN') NOT NULL DEFAULT 'USER',
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. addresses
-- Dia chi giao hang cua user (1 user co nhieu dia chi)
-- ============================================================
CREATE TABLE addresses (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    label           VARCHAR(50),
    address_line    VARCHAR(500)    NOT NULL,
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. restaurant_categories
-- Loai nha hang: Do An Nhanh, Tra Sua, Com, Lau, ...
-- ============================================================
CREATE TABLE restaurant_categories (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    icon_url    VARCHAR(500)
) ENGINE=InnoDB;

-- ============================================================
-- 4. restaurants
-- Thong tin nha hang
-- ============================================================
CREATE TABLE restaurants (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    owner_id        BIGINT          NOT NULL,
    category_id     BIGINT,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    phone           VARCHAR(15),
    address         VARCHAR(500)    NOT NULL,
    latitude        DECIMAL(10, 8),
    longitude       DECIMAL(11, 8),
    image_url       VARCHAR(500),
    opening_time    TIME,
    closing_time    TIME,
    is_open         BOOLEAN         NOT NULL DEFAULT TRUE,
    is_approved     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_restaurants_owner    FOREIGN KEY (owner_id)    REFERENCES users(id),
    CONSTRAINT fk_restaurants_category FOREIGN KEY (category_id) REFERENCES restaurant_categories(id)
) ENGINE=InnoDB;

-- ============================================================
-- 5. categories (danh muc mon an trong tung nha hang)
-- Moi nha hang co danh muc rieng: Khai vi, Mon chinh, Trang mieng...
-- ============================================================
CREATE TABLE categories (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   BIGINT          NOT NULL,
    name            VARCHAR(100)    NOT NULL,
    sort_order      INT             NOT NULL DEFAULT 0,

    CONSTRAINT fk_categories_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. menu_items
-- Mon an trong menu nha hang
-- ============================================================
CREATE TABLE menu_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   BIGINT          NOT NULL,
    category_id     BIGINT,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    price           DECIMAL(12, 2)  NOT NULL,
    image_url       VARCHAR(500),
    is_available    BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_items_category   FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 7. orders
-- Don hang
-- ============================================================
CREATE TABLE orders (
    id                  BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT          NOT NULL,
    restaurant_id       BIGINT          NOT NULL,
    delivery_address    VARCHAR(500)    NOT NULL,
    delivery_lat        DECIMAL(10, 8),
    delivery_lng        DECIMAL(11, 8),
    subtotal            DECIMAL(12, 2)  NOT NULL,
    delivery_fee        DECIMAL(12, 2)  NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12, 2)  NOT NULL,
    payment_method      ENUM('COD')     NOT NULL DEFAULT 'COD',
    status              ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED')
                                        NOT NULL DEFAULT 'PENDING',
    note                TEXT,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user       FOREIGN KEY (user_id)       REFERENCES users(id),
    CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. order_items
-- Chi tiet tung mon trong don hang (luu snapshot gia + ten)
-- ============================================================
CREATE TABLE order_items (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT          NOT NULL,
    menu_item_id    BIGINT,
    item_name       VARCHAR(200)    NOT NULL,
    item_price      DECIMAL(12, 2)  NOT NULL,
    quantity        INT             NOT NULL,
    subtotal        DECIMAL(12, 2)  NOT NULL,
    note            VARCHAR(500),

    CONSTRAINT fk_order_items_order      FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu_item  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL,
    CONSTRAINT chk_order_items_quantity  CHECK (quantity > 0)
) ENGINE=InnoDB;

-- ============================================================
-- 9. order_status_history
-- Lich su trang thai don hang (de theo doi realtime)
-- ============================================================
CREATE TABLE order_status_history (
    id          BIGINT      AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT      NOT NULL,
    status      ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'DELIVERED', 'CANCELLED')
                            NOT NULL,
    changed_by  BIGINT,
    note        VARCHAR(500),
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_status_history_user  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 10. delivery_assignments
-- Phan cong shipper giao hang (1 order - 1 shipper)
-- ============================================================
CREATE TABLE delivery_assignments (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT      NOT NULL UNIQUE,
    shipper_id      BIGINT      NOT NULL,
    status          ENUM('ASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
    picked_up_at    TIMESTAMP   NULL,
    delivered_at    TIMESTAMP   NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_delivery_assignments_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
    CONSTRAINT fk_delivery_assignments_shipper FOREIGN KEY (shipper_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- ============================================================
-- 11. shipper_locations
-- Vi tri realtime cua shipper (1 record / shipper, cap nhat lien tuc)
-- ============================================================
CREATE TABLE shipper_locations (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    shipper_id  BIGINT          NOT NULL UNIQUE,
    latitude    DECIMAL(10, 8)  NOT NULL,
    longitude   DECIMAL(11, 8)  NOT NULL,
    is_online   BOOLEAN         NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_shipper_locations_shipper FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. notifications
-- Thong bao cho nguoi dung
-- ============================================================
CREATE TABLE notifications (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL,
    title       VARCHAR(200)    NOT NULL,
    message     TEXT            NOT NULL,
    type        ENUM('ORDER', 'PROMOTION', 'SYSTEM') NOT NULL,
    is_read     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEXES (toi uu truy van)
-- ============================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- Addresses
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Restaurants
CREATE INDEX idx_restaurants_owner    ON restaurants(owner_id);
CREATE INDEX idx_restaurants_category ON restaurants(category_id);
CREATE INDEX idx_restaurants_approved ON restaurants(is_approved);

-- Categories
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

-- Menu Items
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category   ON menu_items(category_id);
CREATE INDEX idx_menu_items_available  ON menu_items(is_available);

-- Orders
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_created    ON orders(created_at);

-- Order Items
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Order Status History
CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);

-- Delivery Assignments
CREATE INDEX idx_delivery_assignments_shipper ON delivery_assignments(shipper_id);
CREATE INDEX idx_delivery_assignments_status  ON delivery_assignments(status);

-- Notifications
CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_read   ON notifications(is_read);
CREATE INDEX idx_notifications_type   ON notifications(type);
