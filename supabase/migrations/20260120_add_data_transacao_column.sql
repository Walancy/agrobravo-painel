-- Migration: Add data_transacao column to transacoes_financeiras
-- Created: 2026-01-20
-- Description: Adds a specific transaction date column to financial transactions table

-- Add data_transacao column to transacoes_financeiras table
ALTER TABLE transacoes_financeiras 
ADD COLUMN IF NOT EXISTS data_transacao TIMESTAMP WITH TIME ZONE;

-- Set default value to created_at for existing records
UPDATE transacoes_financeiras 
SET data_transacao = created_at 
WHERE data_transacao IS NULL;

-- Add comment to the column for documentation
COMMENT ON COLUMN transacoes_financeiras.data_transacao IS 'Data específica da transação financeira';

-- Optional: Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_transacoes_financeiras_data_transacao 
ON transacoes_financeiras(data_transacao DESC);
