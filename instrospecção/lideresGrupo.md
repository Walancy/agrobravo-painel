# Tabela: lideresGrupo

```sql
-- Tabela: lideresGrupo
CREATE TABLE public.lideresGrupo (
  created_at timestamptz NOT NULL DEFAULT now(),
  lider_id uuid NOT NULL -- PRIMARY KEY | REFERENCES users(id) | id`.,
  grupo_id uuid NOT NULL -- PRIMARY KEY | REFERENCES grupos(id) | id`.
);

```