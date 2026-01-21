-- Add site_url column to eventos table
ALTER TABLE eventos
ADD COLUMN IF NOT EXISTS site_url text;
