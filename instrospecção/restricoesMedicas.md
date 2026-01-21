# Tabela: restricoesMedicas

```sql
-- Tabela: restricoesMedicas
CREATE TABLE public.restricoesMedicas (
  alergia text[],
  outrasRestricoes text[],
  user_id uuid NOT NULL -- PRIMARY KEY | REFERENCES users(id) | id`.,
  medicamento text[],
  intolerancias text[]
);

```