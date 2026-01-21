# Tabela: curtidas

```sql
-- Tabela: curtidas
CREATE TABLE public.curtidas (
  id integer NOT NULL -- PRIMARY KEY,
  user_id uuid -- REFERENCES users(id) | id`.,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  post_id uuid -- REFERENCES posts(id) | id`.
);

```