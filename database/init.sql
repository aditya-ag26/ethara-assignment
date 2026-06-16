-- Database initialization script
-- Tables are created automatically by SQLAlchemy on backend startup
-- This script only sets up the database if it doesn't exist

-- Ensure UTF-8 encoding
SET client_encoding = 'UTF8';

-- Create extension for UUID if needed in future
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
