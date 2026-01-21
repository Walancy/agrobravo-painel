# Tabela: missoesParticipantes

```sql
-- Tabela: missoesParticipantes
CREATE TABLE public.missoesParticipantes (
  missoes_id uuid NOT NULL -- REFERENCES missoesCadastradas(id) | id`.,
  user_id uuid -- REFERENCES users(id) | id`.,
  voucher text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  email text,
  telefone text,
  foiNotificado boolean DEFAULT false
);

```