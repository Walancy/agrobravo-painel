# Verificação e Configuração do Supabase

## Checklist de Configuração

### 1. Verificar se a tabela `grupos` tem o campo `logo`

Execute no SQL Editor do Supabase:

```sql
-- Verificar estrutura da tabela grupos
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'grupos' 
  AND table_schema = 'public';
```

**Se o campo `logo` NÃO existir**, execute:

```sql
-- Adicionar campo logo à tabela grupos
ALTER TABLE grupos 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- Comentário para documentação
COMMENT ON COLUMN grupos.logo IS 'URL da imagem do logo do grupo';
```

### 2. Verificar Relacionamento Foreign Key

Execute no SQL Editor:

```sql
-- Verificar se existe FK entre gruposParticipantes e grupos
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'gruposParticipantes'
  AND kcu.column_name = 'grupo_id';
```

**Se NÃO existir a FK**, execute:

```sql
-- Criar Foreign Key entre gruposParticipantes e grupos
ALTER TABLE "gruposParticipantes"
ADD CONSTRAINT fk_gruposParticipantes_grupos
FOREIGN KEY (grupo_id) 
REFERENCES grupos(id)
ON DELETE CASCADE;
```

### 3. Configurar Row Level Security (RLS) - IMPORTANTE!

O Supabase precisa permitir que a API leia os dados. Execute:

```sql
-- Habilitar RLS na tabela gruposParticipantes (se ainda não estiver)
ALTER TABLE "gruposParticipantes" ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura via Service Role Key
CREATE POLICY "Allow service role to read gruposParticipantes"
ON "gruposParticipantes"
FOR SELECT
TO service_role
USING (true);

-- Habilitar RLS na tabela grupos (se ainda não estiver)
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura via Service Role Key
CREATE POLICY "Allow service role to read grupos"
ON grupos
FOR SELECT
TO service_role
USING (true);
```

### 4. Testar o Join no SQL Editor

Execute este teste para verificar se o join funciona:

```sql
-- Teste: Buscar grupos dos participantes de um evento
-- Substitua os IDs pelos IDs reais do seu banco
SELECT 
    gp.user_id,
    gp.grupo_id,
    g.id as grupo_id_join,
    g.nome as grupo_nome,
    g.logo as grupo_logo
FROM "gruposParticipantes" gp
LEFT JOIN grupos g ON g.id = gp.grupo_id
WHERE gp.user_id IN (
    -- Coloque aqui alguns user_ids que você sabe que existem
    SELECT user_id FROM "gruposParticipantes" LIMIT 5
);
```

Se este query retornar dados com `grupo_logo` preenchido, está tudo OK! ✅

### 5. Verificar Índices (Opcional, mas Recomendado)

Para melhor performance:

```sql
-- Criar índice no campo grupo_id da tabela gruposParticipantes
CREATE INDEX IF NOT EXISTS idx_gruposParticipantes_grupo_id 
ON "gruposParticipantes"(grupo_id);

-- Criar índice no campo user_id da tabela gruposParticipantes
CREATE INDEX IF NOT EXISTS idx_gruposParticipantes_user_id 
ON "gruposParticipantes"(user_id);

-- Criar índice no campo logo da tabela grupos (para buscas)
CREATE INDEX IF NOT EXISTS idx_grupos_logo 
ON grupos(logo) 
WHERE logo IS NOT NULL;
```

## Resumo do que você precisa fazer:

1. ✅ Abrir o Supabase Dashboard
2. ✅ Ir em "SQL Editor"
3. ✅ Executar os comandos acima na ordem
4. ✅ Testar o query de verificação

## Comandos Essenciais (Copie e Cole):

```sql
-- 1. Adicionar campo logo se não existir
ALTER TABLE grupos 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- 2. Criar FK se não existir
ALTER TABLE "gruposParticipantes"
ADD CONSTRAINT fk_gruposParticipantes_grupos
FOREIGN KEY (grupo_id) 
REFERENCES grupos(id)
ON DELETE CASCADE;

-- 3. Configurar RLS
ALTER TABLE "gruposParticipantes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role to read gruposParticipantes"
ON "gruposParticipantes" FOR SELECT TO service_role USING (true);

ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role to read grupos"
ON grupos FOR SELECT TO service_role USING (true);

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_gruposParticipantes_grupo_id ON "gruposParticipantes"(grupo_id);
CREATE INDEX IF NOT EXISTS idx_gruposParticipantes_user_id ON "gruposParticipantes"(user_id);
```

## Depois de executar:

Reinicie o servidor de desenvolvimento:
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
bun run dev
```

Agora os logos dos grupos devem aparecer nos cards! 🎉
