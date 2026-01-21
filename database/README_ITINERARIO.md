# Scripts SQL para Integração do Itinerário

Este diretório contém os scripts SQL necessários para integrar o itinerário com o Supabase.

## 📁 Arquivos

### 1. **`create_eventos_table.sql`** ⭐ OBRIGATÓRIO
Cria a tabela principal `eventos` que armazena todos os eventos do itinerário.

**Execute este primeiro!**

### 2. **`migrate_grupos_atividades.sql`** ✅ USAR ESTE
Adiciona campos de itinerário à tabela `gruposAtividades` **existente** sem recriá-la.

**Use este em vez do `create_grupos_atividades_table.sql`**

### 3. ~~`create_grupos_atividades_table.sql`~~ ❌ NÃO USAR
Este arquivo cria uma nova tabela do zero. **Não use este**, pois você já tem a tabela.

## 🚀 Como Executar (Passo a Passo)

### Passo 1: Criar a tabela `eventos`

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Clique em **New Query**
4. Copie e cole o conteúdo de **`create_eventos_table.sql`**
5. Clique em **Run**

### Passo 2: Migrar a tabela `gruposAtividades` existente

1. No **SQL Editor**, clique em **New Query**
2. Copie e cole o conteúdo de **`migrate_grupos_atividades.sql`**
3. Clique em **Run**

✅ Pronto! A integração está completa.

## 📋 O que cada script faz

### `create_eventos_table.sql`
- ✅ Cria tabela `eventos` com todos os campos necessários
- ✅ Adiciona índices para performance
- ✅ Configura RLS (Row Level Security)
- ✅ Cria trigger para `updated_at`

### `migrate_grupos_atividades.sql`
- ✅ Adiciona campos faltantes à tabela existente
- ✅ Não remove dados existentes
- ✅ Verifica se cada campo já existe antes de adicionar
- ✅ Adiciona índices e triggers
- ✅ Configura RLS

## 🔍 Campos Adicionados à `gruposAtividades`

O script de migração adiciona os seguintes campos (apenas se não existirem):

**Informações Básicas:**
- `tipo`, `titulo`, `subtitulo`, `descricao`

**Data e Hora:**
- `data`, `hora_inicio`, `hora_fim`, `duracao`

**Financeiro:**
- `preco`, `status`

**Localização:**
- `localizacao`, `de`, `para`, `codigo_de`, `codigo_para`, `hora_de`, `hora_para`

**Extras:**
- `motorista`, `logos[]`, `passageiros[]`, `atrasado`, `atraso`, `favorito`

**Sistema:**
- `updated_at`

## ⚠️ Importante

- O script de migração é **seguro** - ele não remove dados existentes
- Cada campo é verificado antes de ser adicionado
- Se um campo já existir, ele é ignorado
- Você pode executar o script múltiplas vezes sem problemas

## 🧪 Verificação

Após executar os scripts, você pode verificar:

```sql
-- Ver estrutura da tabela eventos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'eventos'
ORDER BY ordinal_position;

-- Ver estrutura da tabela gruposAtividades
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gruposAtividades'
ORDER BY ordinal_position;

-- Contar registros
SELECT COUNT(*) FROM eventos;
SELECT COUNT(*) FROM gruposAtividades;
```

## 💡 Exemplo de Uso

```sql
-- Inserir um evento
INSERT INTO eventos (
    grupo_id, tipo, titulo, data, hora_inicio, preco, status
) VALUES (
    'uuid-do-grupo', 'flight', 'Voo GRU-CAC', 
    '2026-05-22', '08:00', 'R$ 850,00', 'confirmed'
);

-- Inserir uma atividade
INSERT INTO gruposAtividades (
    grupo_id, tipo, titulo, data, hora_inicio
) VALUES (
    'uuid-do-grupo', 'visit', 'Visita à Fazenda', 
    '2026-05-23', '14:00'
);
```

## 🆘 Troubleshooting

**Erro: "relation eventos does not exist"**
→ Execute primeiro o `create_eventos_table.sql`

**Erro: "column already exists"**
→ Normal! O script detecta e ignora campos existentes

**Erro: "permission denied"**
→ Verifique se você tem permissões de admin no Supabase

## 📞 Próximos Passos

Após executar os scripts:
1. ✅ A API já está configurada para buscar dados de ambas as tabelas
2. ✅ O frontend já está preparado para exibir os eventos
3. ✅ Você pode começar a adicionar eventos via interface ou SQL

A integração está completa! 🎉
