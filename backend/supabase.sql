-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price INT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

-- Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  items JSONB NOT NULL,
  total INT NOT NULL,
  customer_name TEXT,
  customer_mobile TEXT,
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products Policies
-- Allow public read access to products
CREATE POLICY "Allow public read access on products"
ON products FOR SELECT
TO public
USING (true);

-- Orders Policies
-- Allow anyone to insert an order
CREATE POLICY "Allow public insert on orders"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to read orders (since we don't have auth, anyone can fetch their order status using order ID)
CREATE POLICY "Allow public read on orders"
ON orders FOR SELECT
TO public
USING (true);

-- Seed Initial Products Data
INSERT INTO products (name, price, category, description, icon) VALUES
('Standard Document', 2, 'Document', 'A4 size, High-quality 70 GSM paper.', 'fa-file-lines'),
('Glossy Poster', 45, 'Posters', 'Premium glossy finish for room decor.', 'fa-image'),
('Business Cards', 150, 'Stationery', 'Pack of 50. Professional matte finish.', 'fa-address-card'),
('Spiral Binding', 30, 'Services', 'Durable plastic spiral binding.', 'fa-book'),
('Thesis Hardcover', 450, 'Premium', 'Gold embossed title on premium navy blue.', 'fa-graduation-cap'),
('Passport Photos', 80, 'Photos', 'Set of 8 high-resolution photos.', 'fa-user-tie');
