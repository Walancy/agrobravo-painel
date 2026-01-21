# Tabela: chamada_emergencia

```sql
-- Tabela: chamada_emergencia
CREATE TABLE public.chamada_emergencia (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  pais_id integer NOT NULL -- REFERENCES paises(id) | id`.,
  bombeiro text,
  ambulancia text,
  policia text,
  observacoes text,
  ativo boolean DEFAULT true
);

```