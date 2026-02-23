-- =============================================
-- PRONTÍSSIMA — Database Schema v1
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============= PROFILES ============= --
-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'TRIAL' CHECK (plan IN ('TRIAL', 'BASIC', 'PREMIUM')),
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  credits_plan INT NOT NULL DEFAULT 3,
  credits_packs INT NOT NULL DEFAULT 0,
  wardrobe_limit INT NOT NULL DEFAULT 10,
  body_info JSONB,
  looks_created INT NOT NULL DEFAULT 0,
  had_trial_before BOOLEAN NOT NULL DEFAULT FALSE,
  dev_mode BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============= WARDROBE PIECES ============= --
CREATE TABLE IF NOT EXISTS wardrobe_pieces (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('SUPERIOR', 'INFERIOR', 'VESTIDO')),
  categoria TEXT,
  cor TEXT,
  color_slug TEXT,
  color_rgb JSONB,
  image_url TEXT, -- Supabase Storage public URL
  manual_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============= LOOKS ============= --
CREATE TABLE IF NOT EXISTS looks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  occasion TEXT NOT NULL,
  look_a JSONB NOT NULL,
  look_b JSONB,
  pieces JSONB, -- snapshot of piece IDs used
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============= PAYMENTS ============= --
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'bennu',
  external_id TEXT, -- Bennu transaction ID
  product_id TEXT,
  amount_cents INT,
  credits_granted INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============= INDEXES ============= --
CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON wardrobe_pieces(user_id);
CREATE INDEX IF NOT EXISTS idx_looks_user ON looks(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_external ON payments(external_id);

-- ============= ROW LEVEL SECURITY ============= --
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE looks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own wardrobe"
  ON wardrobe_pieces FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe"
  ON wardrobe_pieces FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe"
  ON wardrobe_pieces FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own looks"
  ON looks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own looks"
  ON looks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own looks"
  ON looks FOR DELETE USING (auth.uid() = user_id);

-- Payments: users can view their own, service role can insert
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT USING (auth.uid() = user_id);

-- ============= TRIGGER: auto-create profile on signup ============= --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============= STORAGE BUCKET ============= --
-- Run in Supabase dashboard: Create a bucket called "wardrobe" with public access
