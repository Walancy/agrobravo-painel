# Tabela: vw_documentos_com_nome_aprovador

```sql
-- Tabela: vw_documentos_com_nome_aprovador
CREATE TABLE public.vw_documentos_com_nome_aprovador (
  tipo text,
  data_envio text,
  foto_doc text,
  id uuid -- PRIMARY KEY,
  user_id uuid -- REFERENCES users(id) | id`.,
  status text,
  motivoRecusa text,
  missao_id uuid,
  deleted_at timestamptz,
  quem_enviou uuid,
  nome_documento text,
  quem_aprovou_ou_recusou uuid,
  numero_doc text,
  validade_doc timestamptz,
  nome_aprovou_ou_recusou text
);

```