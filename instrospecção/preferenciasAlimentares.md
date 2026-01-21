# Tabela: preferenciasAlimentares

```sql
-- Tabela: preferenciasAlimentares
CREATE TABLE public.preferenciasAlimentares (
  user_id uuid NOT NULL -- PRIMARY KEY | REFERENCES users(id) | id`.,
  preferencia text[],
  outros text[]
);

```