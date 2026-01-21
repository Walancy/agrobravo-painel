# Tabela: documentos

```sql
-- Tabela: documentos
CREATE TABLE public.documentos (
  tipo text,
  data_envio text,
  foto_doc text,
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  user_id uuid -- REFERENCES users(id) | id`.,
  status text NOT NULL DEFAULT PENDENTE,
  motivoRecusa text,
  missao_id uuid,
  deleted_at timestamptz,
  quem_enviou uuid,
  nome_documento text,
  quem_aprovou_ou_recusou uuid,
  numero_doc text,
  validade_doc timestamptz,
  paisVisto text
);

```