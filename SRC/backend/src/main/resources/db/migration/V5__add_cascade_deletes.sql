-- V5: Add ON DELETE CASCADE to foreign keys for Hard Delete support

-- 1. Restaurants -> Owner
ALTER TABLE restaurants DROP FOREIGN KEY fk_restaurants_owner;
ALTER TABLE restaurants ADD CONSTRAINT fk_restaurants_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE;

-- 2. Orders -> User
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user;
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. Delivery Assignments -> Shipper
ALTER TABLE delivery_assignments DROP FOREIGN KEY fk_delivery_assignments_shipper;
ALTER TABLE delivery_assignments ADD CONSTRAINT fk_delivery_assignments_shipper FOREIGN KEY (shipper_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Owner Requests -> User
ALTER TABLE owner_requests DROP FOREIGN KEY fk_owner_requests_user;
ALTER TABLE owner_requests ADD CONSTRAINT fk_owner_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
