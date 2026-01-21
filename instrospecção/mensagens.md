# Tabela: mensagens

```sql
-- Tabela: mensagens
CREATE TABLE public.mensagens (
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  batepapo_id uuid NOT NULL -- REFERENCES batePapo(id) | id`.,
  user_id uuid NOT NULL -- REFERENCES users(id) | id`.,
  mensagem text,
  imagem text,
  primeiraMensagem boolean
);

```