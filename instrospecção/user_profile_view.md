# Tabela: user_profile_view

```sql
-- Tabela: user_profile_view
CREATE TABLE public.user_profile_view (
  id uuid -- PRIMARY KEY,
  email text,
  auth_created_at timestamptz,
  email_confirmed_at timestamptz,
  nome text,
  cpf text,
  telefone text,
  cep text,
  estado text,
  cidade text,
  rua text,
  numero text,
  bairro text,
  complemento text,
  foto text,
  dataNascimento text,
  tipoUser text[],
  permissoes text[],
  primeiroAcesso boolean,
  docPendentes integer,
  user_created_at timestamptz,
  deleted_at timestamptz,
  nivel_ingles text,
  quemCriou uuid -- REFERENCES users(id) | id`.,
  criador_nome text
);

```