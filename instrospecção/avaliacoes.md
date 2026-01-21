# Tabela: avaliacoes

```sql
-- Tabela: avaliacoes
CREATE TABLE public.avaliacoes (
  user_id uuid NOT NULL -- REFERENCES users(id) | id`.,
  nota integer,
  id integer NOT NULL -- PRIMARY KEY,
  atividade_id uuid -- REFERENCES gruposAtividades(id) | id`.
);

```