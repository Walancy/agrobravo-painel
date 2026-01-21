# Tabela: batePapo

```sql
-- Tabela: batePapo
CREATE TABLE public.batePapo (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  grupo_id uuid -- REFERENCES grupos(id) | id`.,
  lider_id uuid -- REFERENCES users(id) | id`.,
  user_id uuid -- REFERENCES users(id) | id`.
);

```