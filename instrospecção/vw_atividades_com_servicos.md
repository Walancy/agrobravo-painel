# Tabela: vw_atividades_com_servicos

```sql
-- Tabela: vw_atividades_com_servicos
CREATE TABLE public.vw_atividades_com_servicos (
  id uuid -- PRIMARY KEY,
  created_at timestamptz,
  missao_id uuid -- REFERENCES grupos(id) | id`.,
  servico_id integer -- REFERENCES servicos(id) | id`.,
  hora_inicio timestamptz,
  hora_fim timestamptz,
  nome text,
  tipo text,
  descricao text,
  imagem text,
  origem text,
  destino text
);

```