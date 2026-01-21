# Tabela: gruposAtividades

```sql
-- Tabela: gruposAtividades
CREATE TABLE public.gruposAtividades (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  grupo_id uuid -- REFERENCES grupos(id) | id`.,
  servico_id integer -- REFERENCES servicos(id) | id`.,
  hora_inicio2 timestamptz,
  hora_fim2 timestamptz,
  nome text,
  tipo text,
  descricao text,
  imagem text,
  hora_inicio text,
  hora_fim text,
  prefixo text,
  prefixoIngles text
);

```