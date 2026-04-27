-- V6: Allow delivery_assignments.shipper_id to be NULL for unassigned deliveries
ALTER TABLE delivery_assignments MODIFY COLUMN shipper_id BIGINT NULL;
