# Tabela: grupos

```sql
-- Tabela: grupos
CREATE TABLE public.grupos (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  nome text,
  created_at timestamptz NOT NULL DEFAULT now(),
  data_fim text,
  data_inicio text,
  deleted_at timestamptz,
  destino text[],
  logo text,
  missao_id uuid -- REFERENCES missoes(id) | id`.,
  observacoes text,
  quem_criou uuid -- REFERENCES users(id) | id`.,
  quem_deletou uuid -- REFERENCES users(id) | id`.,
  quem_editou text[],
  status text,
  vagas integer
);

```