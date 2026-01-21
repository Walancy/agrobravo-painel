# Tabela: missoesCadastradas

```sql
-- Tabela: missoesCadastradas
CREATE TABLE public.missoesCadastradas (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  nome_viagem text,
  destino text,
  passagens integer,
  status text,
  data_inicio text,
  data_fim text,
  descricao text,
  pais text,
  continente text,
  imagem text,
  created_at timestamptz DEFAULT (now() AT TIME ZONE 'utc'::text),
  imagemSetada boolean,
  quemCriou uuid -- REFERENCES users(id) | id`.,
  quemEditou text[],
  deleted_at text,
  quem_deletou uuid -- REFERENCES users(id) | id`.
);

```