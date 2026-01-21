# Tabela: comentarios

```sql
-- Tabela: comentarios
CREATE TABLE public.comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid -- REFERENCES users(id) | id`.,
  comentario text,
  id_comentario uuid,
  post_id uuid -- REFERENCES posts(id) | id`.,
  deleted_at timestamptz
);

```