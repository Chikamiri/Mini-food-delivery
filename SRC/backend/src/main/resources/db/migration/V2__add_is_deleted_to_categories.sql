-- V2: Add is_deleted column to categories table
ALTER TABLE categories ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
