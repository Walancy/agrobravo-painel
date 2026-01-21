# Tabela: documentosMissao

```sql
-- Tabela: documentosMissao
CREATE TABLE public.documentosMissao (
  created_at timestamptz NOT NULL DEFAULT now(),
  doc_id uuid NOT NULL -- PRIMARY KEY | REFERENCES documentos(id) | id`.,
  missao_id uuid NOT NULL -- PRIMARY KEY | REFERENCES missoes(id) | id`.,
  status text NOT NULL DEFAULT PENDENTE,
  motivo_recusa text,
  quem_aprovou_ou_recusou uuid -- REFERENCES users(id) | id`.
);

```