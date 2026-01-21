# Tabela: servicos_infinity_view

```sql
-- Tabela: servicos_infinity_view
CREATE TABLE public.servicos_infinity_view (
  id integer -- PRIMARY KEY,
  created_at timestamptz,
  tipo text,
  nomeServico text,
  cidade text,
  pais text,
  empresa text,
  preco text,
  moedaEmpresa text,
  deleted_at timestamptz,
  quemCriou uuid -- REFERENCES users(id) | id`.,
  nome_quem_criou text,
  search_field text
);

```