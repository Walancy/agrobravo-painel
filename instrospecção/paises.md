# Tabela: paises

```sql
-- Tabela: paises
CREATE TABLE public.paises (
  id integer NOT NULL -- PRIMARY KEY,
  pais text NOT NULL,
  continente text NOT NULL,
  ddi text NOT NULL,
  bandeira text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

```