-- Create website_orders table for Site Builder
CREATE TABLE IF NOT EXISTS website_orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  website_description TEXT NOT NULL,
  custom_domain VARCHAR(255),
  budget VARCHAR(100),
  timeline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_website_orders_email ON website_orders(email);
CREATE INDEX IF NOT EXISTS idx_website_orders_status ON website_orders(status);
CREATE INDEX IF NOT EXISTS idx_website_orders_created_at ON website_orders(created_at DESC);
