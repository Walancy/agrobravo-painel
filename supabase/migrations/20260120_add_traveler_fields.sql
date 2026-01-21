-- Add traveler profile fields to users table
-- This migration adds fields for storing detailed traveler information

-- Add personal information fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS nacionalidade VARCHAR(100),
ADD COLUMN IF NOT EXISTS passaporte VARCHAR(50),
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS ssn VARCHAR(50),
ADD COLUMN IF NOT EXISTS empresa VARCHAR(255),
ADD COLUMN IF NOT EXISTS restricoes_alimentares TEXT[],
ADD COLUMN IF NOT EXISTS restricoes_medicas TEXT[],
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.data_nascimento IS 'Traveler birth date';
COMMENT ON COLUMN users.nacionalidade IS 'Traveler nationality/country';
COMMENT ON COLUMN users.passaporte IS 'Passport number';
COMMENT ON COLUMN users.cpf IS 'Brazilian CPF (for Brazilian travelers)';
COMMENT ON COLUMN users.ssn IS 'Social Security Number or ID (for foreign travelers)';
COMMENT ON COLUMN users.empresa IS 'Company name';
COMMENT ON COLUMN users.restricoes_alimentares IS 'Dietary restrictions array';
COMMENT ON COLUMN users.restricoes_medicas IS 'Medical restrictions array';
COMMENT ON COLUMN users.observacoes IS 'Additional observations/notes';
