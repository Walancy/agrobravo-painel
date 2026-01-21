-- Migration: Add fields for return events and transfer details
-- This migration adds columns to support return event linking and check-out transfer scheduling

-- Add evento_referencia_id to link return events to their origin event
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS evento_referencia_id UUID REFERENCES eventos(id) ON DELETE SET NULL;

-- Add transfer_data and transfer_hora to store specific transfer schedule (e.g. for check-out)
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS transfer_data DATE;

ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS transfer_hora TEXT;

-- Add comments
COMMENT ON COLUMN eventos.evento_referencia_id IS 'Reference to the original event ID for return events';
COMMENT ON COLUMN eventos.transfer_data IS 'Specific date for the transfer (e.g. check-out transfer)';
COMMENT ON COLUMN eventos.transfer_hora IS 'Specific time for the transfer (e.g. check-out transfer)';
