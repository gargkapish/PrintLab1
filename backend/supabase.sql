-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Linked to Supabase Auth ID
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  user_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Products Policies
CREATE POLICY "Allow public read access on products" ON products FOR SELECT TO public USING (true);

-- Orders Policies
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

-- Seed Initial Products Data
INSERT INTO products (name, price, category, description, icon) VALUES
('Standard Document', 2, 'Print', 'A4 size, High-quality 70 GSM paper.', 'fa-file-lines'),
('Glossy Poster', 45, 'Posters', 'Premium glossy finish for room decor.', 'fa-image'),
('Business Cards', 150, 'Stationery', 'Pack of 50. Professional matte finish.', 'fa-address-card'),
('Spiral Binding', 30, 'Services', 'Durable plastic spiral binding.', 'fa-book'),
('Thesis Hardcover', 450, 'Premium', 'Gold embossed title on premium navy blue.', 'fa-graduation-cap'),
('Passport Photos', 80, 'Photos', 'Set of 8 high-resolution photos.', 'fa-user-tie');

