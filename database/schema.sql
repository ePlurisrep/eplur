-- Database Schema for eplur

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('gov', 'upload')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document text extraction table
CREATE TABLE document_text (
  document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT,
  token_count INTEGER,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_source ON documents(source);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_metadata ON documents USING GIN (metadata);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own documents
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Usage limits table
CREATE TABLE usage (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  graphs_generated INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_user_id ON usage(user_id);

ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Billing table to track Stripe subscription status and plan
CREATE TABLE billing (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  status TEXT,
  plan TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_billing_user_id ON billing(user_id);

ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing" ON billing
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own billing" ON billing
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own billing" ON billing
  FOR UPDATE USING (auth.uid() = user_id);

-- Saved graphs for reload and sharing
CREATE TABLE saved_graphs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  config JSONB NOT NULL,
  public BOOLEAN DEFAULT false,
  share_id UUID UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_graphs_user_id ON saved_graphs(user_id);

ALTER TABLE saved_graphs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved graphs" ON saved_graphs
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow public read by share_id
CREATE POLICY "Public read by share_id" ON saved_graphs
  FOR SELECT USING (public = true);

-- Profiles table: links Supabase auth users to app profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vault records: user-specific evidence (local-first sync target)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS vault_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  record_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,

  record_type TEXT,
  jurisdiction TEXT,
  agency TEXT,
  source TEXT,
  record_date TEXT,

  tags TEXT[] DEFAULT '{}',

  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for privacy
ALTER TABLE vault_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own records"
  ON vault_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert their own records"
  ON vault_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own records"
  ON vault_records
  FOR UPDATE
  USING (auth.uid() = user_id);
