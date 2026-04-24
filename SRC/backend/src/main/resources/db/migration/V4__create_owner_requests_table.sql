CREATE TABLE owner_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    restaurant_name VARCHAR(200) NOT NULL,
    restaurant_address VARCHAR(500) NOT NULL,
    restaurant_phone VARCHAR(15) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
);
