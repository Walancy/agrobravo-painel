# Tabela: conexoes

```sql
-- Tabela: conexoes
CREATE TABLE public.conexoes (
  seguidor_id uuid NOT NULL -- PRIMARY KEY | REFERENCES users(id) | id`.,
  seguido_id uuid NOT NULL -- PRIMARY KEY | REFERENCES users(id) | id`.,
  aprovou boolean NOT NULL DEFAULT false,
  data_rejeicao timestamptz
);

```