-- Mini Food Delivery Test Schema (Strict Alignment with JPA Entities)

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(100) NOT NULL,
    phone       VARCHAR(15) UNIQUE,
    avatar_url  VARCHAR(500),
    role        VARCHAR(50) NOT NULL DEFAULT 'USER',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS addresses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    label           VARCHAR(50),
    address_line    VARCHAR(500) NOT NULL,
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS restaurant_categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    icon_url    VARCHAR(500)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS restaurants (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id        BIGINT NOT NULL,
    category_id     BIGINT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    phone           VARCHAR(15),
    address         VARCHAR(500) NOT NULL,
    latitude        DECIMAL(10,8),
    longitude       DECIMAL(11,8),
    image_url       VARCHAR(500),
    opening_time    TIME,
    closing_time    TIME,
    is_open         BOOLEAN NOT NULL DEFAULT TRUE,
    is_approved     BOOLEAN NOT NULL DEFAULT FALSE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_restaurants_owner    FOREIGN KEY (owner_id)    REFERENCES users(id),
    CONSTRAINT fk_restaurants_category FOREIGN KEY (category_id) REFERENCES restaurant_categories(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_categories_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS menu_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id   BIGINT NOT NULL,
    category_id     BIGINT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(12,2) NOT NULL,
    image_url       VARCHAR(500),
    is_available    BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_menu_items_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_items_category   FOREIGN KEY (category_id)   REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    restaurant_id       BIGINT NOT NULL,
    delivery_address    VARCHAR(500) NOT NULL,
    delivery_lat        DECIMAL(10,8) NOT NULL,
    delivery_lng        DECIMAL(11,8) NOT NULL,
    subtotal            DECIMAL(12,2) NOT NULL,
    delivery_fee        DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL,
    payment_method      VARCHAR(50) NOT NULL DEFAULT 'COD',
    status              VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    is_paid             BOOLEAN NOT NULL DEFAULT FALSE,
    note                VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user       FOREIGN KEY (user_id)       REFERENCES users(id),
    CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL,
    menu_item_id    BIGINT,
    item_name       VARCHAR(200) NOT NULL,
    item_price      DECIMAL(12,2) NOT NULL,
    quantity        INT NOT NULL,
    subtotal        DECIMAL(12,2) NOT NULL,
    note            VARCHAR(500),
    CONSTRAINT fk_order_items_order     FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_status_history (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id    BIGINT NOT NULL,
    status      VARCHAR(50) NOT NULL,
    changed_by  BIGINT,
    note        VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_status_history_user  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS delivery_assignments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT NOT NULL UNIQUE,
    shipper_id      BIGINT NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'UNASSIGNED',
    picked_up_at    TIMESTAMP NULL,
    delivered_at    TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_delivery_assignments_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
    CONSTRAINT fk_delivery_assignments_shipper FOREIGN KEY (shipper_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS shipper_locations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    shipper_id  BIGINT NOT NULL UNIQUE,
    latitude    DECIMAL(10,8) NOT NULL,
    longitude   DECIMAL(11,8) NOT NULL,
    is_online   BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipper_locations_shipper FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(50) NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
