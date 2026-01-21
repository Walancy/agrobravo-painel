# Tabela: missoes

```sql
-- Tabela: missoes
CREATE TABLE public.missoes (
  created_at timestamptz NOT NULL DEFAULT now(),
  nome text,
  continente text,
  data_inicio text,
  data_fim text,
  observacoes text,
  logo text,
  criado_por uuid -- REFERENCES users(id) | id`.,
  editado_por uuid -- REFERENCES users(id) | id`.,
  deletado_por uuid -- REFERENCES users(id) | id`.,
  documentos_exigidos text[],
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  status text,
  paises text[],
  deleted_at timestamptz
);

```