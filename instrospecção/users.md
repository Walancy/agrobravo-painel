# Tabela: users

```sql
-- Tabela: users
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT auth.uid() -- PRIMARY KEY | REFERENCES user_profile_view(id) | id`.,
  created_at timestamptz NOT NULL DEFAULT (now() AT TIME ZONE 'utc'::text),
  nome text NOT NULL,
  cpf text,
  telefone text,
  cep text,
  estado text,
  cidade text,
  rua text,
  numero text,
  bairro text,
  complemento text,
  foto text DEFAULT https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/agro-bravo-mobile-v48y0z/assets/ywnwx3mh067q/bdf4d3fe1f9a17136319df951fe9b3e0.jpg,
  dataNascimento text,
  permissoes text[],
  primeiroAcesso boolean NOT NULL DEFAULT true,
  docPendentes integer,
  email text,
  deleted_at timestamptz,
  nivel_ingles text,
  tipoUser text[],
  quemCriou uuid -- REFERENCES users(id) | id`.,
  cargo text,
  empresa text,
  fcm_token text,
  nacionalidade text,
  n_passaporte text,
  capa_perfil text
);

```