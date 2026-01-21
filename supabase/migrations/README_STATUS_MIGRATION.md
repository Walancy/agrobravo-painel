# Como Executar a Migration do Status

## Problema
As tags de custo (Free, Pendente, valor cotado) não aparecem nos cards do itinerário porque a coluna `status` não existe na tabela `eventos` do Supabase.

## Solução

### Opção 1: Executar via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/add_status_column_to_eventos.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Executar via CLI do Supabase

Se você tem o Supabase CLI instalado:

```bash
# No diretório do projeto
cd e:\code\appmoove-agrobravo-painel

# Execute a migration
supabase db push
```

### Opção 3: Executar manualmente via SQL

Execute este SQL diretamente no Supabase:

```sql
-- Add status column to eventos table
ALTER TABLE eventos 
ADD COLUMN IF NOT EXISTS status TEXT 
CHECK (status IN ('free', 'quoted', 'quoting', 'confirmed'));

-- Add comment to explain the column
COMMENT ON COLUMN eventos.status IS 'Event cost status: free (gratuito), quoted (cotado), quoting (cotação pendente), confirmed (confirmado)';

-- Update existing records to have a default status if null
UPDATE eventos 
SET status = 'confirmed' 
WHERE status IS NULL AND preco IS NOT NULL;

UPDATE eventos 
SET status = 'free' 
WHERE status IS NULL AND (preco IS NULL OR preco = '0' OR preco = '');
```

## Verificação

Após executar a migration, você pode verificar se funcionou:

1. No Supabase Dashboard, vá em **Table Editor**
2. Selecione a tabela `eventos`
3. Verifique se a coluna `status` aparece nas colunas
4. Crie um novo evento no sistema e selecione um status de custo
5. Verifique se a tag aparece corretamente no card

## Valores Possíveis para Status

- `'free'` - Gratuito (tag verde "Free")
- `'quoted'` - Cotado (tag azul com o valor)
- `'quoting'` - Cotação pendente (tag laranja "Pendente")
- `'confirmed'` - Confirmado (tag azul com o valor)

## Troubleshooting

Se as tags ainda não aparecerem após a migration:

1. Limpe o cache do navegador (`Ctrl+Shift+R`)
2. Verifique o console do navegador para erros
3. Verifique se os eventos têm o campo `status` preenchido no banco
4. Reinicie o servidor de desenvolvimento (`bun run dev`)
