-- Migration: Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);