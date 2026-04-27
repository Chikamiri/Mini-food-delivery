CREATE TABLE shipper_requests (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    phone_number    VARCHAR(15) NOT NULL,
    license_plate   VARCHAR(20) NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_note      VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_shipper_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_shipper_requests_user ON shipper_requests(user_id);
CREATE INDEX idx_shipper_requests_status ON shipper_requests(status);
