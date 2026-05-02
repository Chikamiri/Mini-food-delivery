-- Ảnh đại diện nhà hàng (data URL hoặc URL dài) — trước đây VARCHAR(500) quá ngắn
ALTER TABLE restaurants MODIFY COLUMN image_url LONGTEXT;
