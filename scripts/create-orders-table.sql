-- Create orders table for storing form submissions
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    service_type VARCHAR(50) NOT NULL, -- 'epk' or 'website'
    band_name VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    budget VARCHAR(50),
    timeline VARCHAR(50),
    website_url VARCHAR(255),
    social_media TEXT, -- JSON string of social media links
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' -- pending, in_progress, completed, cancelled
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);

-- Create index on service_type for filtering
CREATE INDEX IF NOT EXISTS idx_orders_service_type ON orders(service_type);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
