/*
  # Shop Tracker Pro - Database Schema

  1. New Tables
    - `shops`
      - `id` (uuid, primary key)
      - `name` (text) - Shop name
      - `location` (text) - Shop location
      - `manager_name` (text) - Manager name
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sales`
      - `id` (uuid, primary key)
      - `date` (date) - Sale date
      - `shop_id` (uuid, foreign key to shops)
      - `amount` (numeric) - Sale amount in MZN
      - `notes` (text) - Optional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `expenses`
      - `id` (uuid, primary key)
      - `date` (date) - Expense date
      - `category` (text) - Category (Rent, Fuel, Salaries, etc.)
      - `amount` (numeric) - Expense amount in MZN
      - `notes` (text) - Optional notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `store_values`
      - `id` (uuid, primary key)
      - `shop_id` (uuid, foreign key to shops)
      - `goods_value` (numeric) - Value of goods in MZN
      - `cash_value` (numeric) - Cash value in MZN
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users (mock auth for MVP)
    - Public access policies for demo purposes

  3. Important Notes
    - All monetary values stored as numeric for precision
    - Timestamps for audit trail
    - Foreign key constraints for data integrity
*/

-- Create shops table
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  manager_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store_values table
CREATE TABLE IF NOT EXISTS store_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  goods_value numeric NOT NULL DEFAULT 0,
  cash_value numeric NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(shop_id)
);

-- Enable Row Level Security
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_values ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (MVP demo purposes)
CREATE POLICY "Allow public read access to shops"
  ON shops FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to shops"
  ON shops FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to shops"
  ON shops FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from shops"
  ON shops FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to sales"
  ON sales FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sales"
  ON sales FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sales"
  ON sales FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from sales"
  ON sales FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to expenses"
  ON expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to expenses"
  ON expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to expenses"
  ON expenses FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from expenses"
  ON expenses FOR DELETE
  USING (true);

CREATE POLICY "Allow public read access to store_values"
  ON store_values FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to store_values"
  ON store_values FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to store_values"
  ON store_values FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from store_values"
  ON store_values FOR DELETE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_store_values_shop_id ON store_values(shop_id);