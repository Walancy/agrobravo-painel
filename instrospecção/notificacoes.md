# Tabela: notificacoes

```sql
-- Tabela: notificacoes
CREATE TABLE public.notificacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  mensagem text,
  lido boolean NOT NULL DEFAULT false,
  user_id uuid -- REFERENCES users(id) | id`.,
  assunto text NOT NULL,
  missao_id uuid -- REFERENCES missoes(id) | id`.,
  mensagemIngles text,
  deleted_at timestamptz,
  post_id uuid -- REFERENCES posts(id) | id`.,
  solicitacao_user_id uuid,
  solicitacaoRespondida boolean DEFAULT false,
  doc_id uuid -- REFERENCES documentos(id) | id`.,
  titulo text,
  icone text,
  tituloIngles text
);

```