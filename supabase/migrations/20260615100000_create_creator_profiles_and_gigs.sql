CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_handle TEXT,
  bio TEXT,
  content_categories TEXT[] DEFAULT '{}',
  gig_charge INTEGER CHECK (gig_charge IS NULL OR gig_charge >= 100),
  portfolio_url TEXT,
  profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_creator_profile" ON creator_profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "insert_own_creator_profile" ON creator_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_creator_profile" ON creator_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "select_creator_profiles_public" ON creator_profiles FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  charge INTEGER NOT NULL CHECK (charge >= 100),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_gigs" ON gigs FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "insert_own_gigs" ON gigs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "update_own_gigs" ON gigs FOR UPDATE
  TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "delete_own_gigs" ON gigs FOR DELETE
  TO authenticated USING (auth.uid() = creator_id);
