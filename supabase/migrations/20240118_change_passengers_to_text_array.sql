-- Change passageiros column from integer[] to text[] to support UUIDs
ALTER TABLE eventos
ALTER COLUMN passageiros TYPE text[] USING passageiros::text[];
