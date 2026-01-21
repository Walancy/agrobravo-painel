-- Migration: Add status column to eventos table
-- This migration adds the status column to track event cost status (free, quoted, quoting, confirmed)

-- Add status column to eventos table
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('free', 'quoted', 'quoting', 'confirmed'));

-- Add comment to explain the column
COMMENT ON COLUMN eventos.status IS 'Event cost status: free (gratuito), quoted (cotado), quoting (cotação pendente), confirmed (confirmado)';

-- Update existing records to have a default status if null
-- You can adjust this based on your business logic
UPDATE eventos 
SET status = 'confirmed' 
WHERE status IS NULL AND preco IS NOT NULL;

UPDATE eventos 
SET status = 'free' 
WHERE status IS NULL AND (preco IS NULL OR preco = '0' OR preco = '');
