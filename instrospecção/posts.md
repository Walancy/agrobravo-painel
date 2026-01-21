# Tabela: posts

```sql
-- Tabela: posts
CREATE TABLE public.posts (
  user_id uuid -- REFERENCES users(id) | id`.,
  missao_id uuid -- REFERENCES missoes(id) | id`.,
  imagens text[] NOT NULL,
  legenda text,
  n_curtidas integer,
  n_comentarios integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz,
  deleted_at timestamptz,
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  privado boolean DEFAULT false
);

```