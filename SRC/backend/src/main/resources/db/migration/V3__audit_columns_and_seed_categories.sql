-- V3: Add audit columns and seed initial restaurant categories
ALTER TABLE restaurant_categories ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE restaurant_categories ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

INSERT INTO restaurant_categories (name, icon_url) VALUES 
('Rice', 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png'),
('Fast Food', 'https://cdn-icons-png.flaticon.com/512/737/737967.png'),
('Sea Food', 'https://cdn-icons-png.flaticon.com/512/2927/2927347.png'),
('Dry Dish', 'https://cdn-icons-png.flaticon.com/512/2515/2515234.png'),
('Soup Dish', 'https://cdn-icons-png.flaticon.com/512/2833/2833441.png'),
('Drink', 'https://cdn-icons-png.flaticon.com/512/3121/3121784.png'),
('Dessert', 'https://cdn-icons-png.flaticon.com/512/2576/2576762.png');
