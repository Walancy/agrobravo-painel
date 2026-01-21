# Tabela: gruposParticipantes

```sql
-- Tabela: gruposParticipantes
CREATE TABLE public.gruposParticipantes (
  grupo_id uuid NOT NULL -- REFERENCES grupos(id) | id`.,
  user_id uuid -- REFERENCES users(id) | id`.,
  voucher text,
  id uuid NOT NULL DEFAULT gen_random_uuid() -- PRIMARY KEY,
  email text,
  telefone text,
  foiNotificado boolean DEFAULT false,
  primeiraAcesso boolean DEFAULT true
);

```