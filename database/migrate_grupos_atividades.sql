-- Script completo para criar ou migrar a tabela gruposAtividades
-- Lida com case-sensitivity do PostgreSQL

DO $$ 
DECLARE
    actual_table_name TEXT;
    sql_cmd TEXT;
BEGIN
    -- Verificar se a tabela existe e obter o nome real
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND LOWER(table_name) = 'gruposatividades'
    LIMIT 1;
    
    IF actual_table_name IS NULL THEN
        -- CRIAR A TABELA DO ZERO
        RAISE NOTICE 'Criando tabela gruposAtividades...';
        
        CREATE TABLE IF NOT EXISTS public."gruposAtividades" (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
            tipo TEXT,
            titulo TEXT,
            subtitulo TEXT,
            descricao TEXT,
            data DATE,
            hora_inicio TIME,
            hora_fim TIME,
            duracao TEXT,
            preco TEXT,
            status TEXT CHECK (status IN ('confirmed', 'quoting', 'free')),
            localizacao TEXT,
            de TEXT,
            para TEXT,
            codigo_de TEXT,
            codigo_para TEXT,
            hora_de TIME,
            hora_para TIME,
            motorista TEXT,
            logos TEXT[],
            passageiros INTEGER[],
            atrasado BOOLEAN DEFAULT false,
            atraso TEXT,
            favorito BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        actual_table_name := 'gruposAtividades';
        RAISE NOTICE 'Tabela % criada com sucesso!', actual_table_name;
    ELSE
        RAISE NOTICE 'Tabela % já existe. Adicionando campos faltantes...', actual_table_name;
    END IF;
    
    -- Adicionar campos se não existirem (funciona tanto para tabela nova quanto existente)
    -- tipo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'tipo') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN tipo TEXT', actual_table_name);
        RAISE NOTICE 'Coluna tipo adicionada';
    END IF;

    -- titulo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'titulo') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN titulo TEXT', actual_table_name);
        RAISE NOTICE 'Coluna titulo adicionada';
    END IF;

    -- subtitulo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'subtitulo') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN subtitulo TEXT', actual_table_name);
    END IF;

    -- descricao
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'descricao') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN descricao TEXT', actual_table_name);
    END IF;

    -- data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'data') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN data DATE', actual_table_name);
    END IF;

    -- hora_inicio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'hora_inicio') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hora_inicio TIME', actual_table_name);
    END IF;

    -- hora_fim
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'hora_fim') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hora_fim TIME', actual_table_name);
    END IF;

    -- duracao
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'duracao') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN duracao TEXT', actual_table_name);
    END IF;

    -- preco
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'preco') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN preco TEXT', actual_table_name);
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'status') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN status TEXT', actual_table_name);
    END IF;

    -- localizacao
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'localizacao') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN localizacao TEXT', actual_table_name);
    END IF;

    -- de
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'de') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN de TEXT', actual_table_name);
    END IF;

    -- para
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'para') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN para TEXT', actual_table_name);
    END IF;

    -- codigo_de
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'codigo_de') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN codigo_de TEXT', actual_table_name);
    END IF;

    -- codigo_para
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'codigo_para') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN codigo_para TEXT', actual_table_name);
    END IF;

    -- hora_de
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'hora_de') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hora_de TIME', actual_table_name);
    END IF;

    -- hora_para
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'hora_para') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN hora_para TIME', actual_table_name);
    END IF;

    -- motorista
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'motorista') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN motorista TEXT', actual_table_name);
    END IF;

    -- logos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'logos') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN logos TEXT[]', actual_table_name);
    END IF;

    -- passageiros
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'passageiros') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN passageiros INTEGER[]', actual_table_name);
    END IF;

    -- atrasado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'atrasado') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN atrasado BOOLEAN DEFAULT false', actual_table_name);
    END IF;

    -- atraso
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'atraso') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN atraso TEXT', actual_table_name);
    END IF;

    -- favorito
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'favorito') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN favorito BOOLEAN DEFAULT false', actual_table_name);
    END IF;

    -- created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'created_at') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()', actual_table_name);
    END IF;

    -- updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' AND table_name = actual_table_name AND column_name = 'updated_at') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()', actual_table_name);
    END IF;
    
    RAISE NOTICE 'Campos verificados e adicionados com sucesso!';
END $$;

-- Criar índices
DO $$
DECLARE
    actual_table_name TEXT;
BEGIN
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND LOWER(table_name) = 'gruposatividades'
    LIMIT 1;
    
    IF actual_table_name IS NOT NULL THEN
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_grupos_atividades_grupo_id ON public.%I(grupo_id)', actual_table_name);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_grupos_atividades_data ON public.%I(data)', actual_table_name);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_grupos_atividades_grupo_data ON public.%I(grupo_id, data)', actual_table_name);
        RAISE NOTICE 'Índices criados com sucesso!';
    END IF;
END $$;

-- Criar trigger
DO $$
DECLARE
    actual_table_name TEXT;
BEGIN
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND LOWER(table_name) = 'gruposatividades'
    LIMIT 1;
    
    IF actual_table_name IS NOT NULL THEN
        -- Criar função se não existir
        CREATE OR REPLACE FUNCTION update_grupos_atividades_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        -- Drop e recriar trigger
        EXECUTE format('DROP TRIGGER IF EXISTS grupos_atividades_updated_at ON public.%I', actual_table_name);
        EXECUTE format('CREATE TRIGGER grupos_atividades_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_grupos_atividades_updated_at()', actual_table_name);
        
        RAISE NOTICE 'Trigger criado com sucesso!';
    END IF;
END $$;

-- Habilitar RLS e criar políticas
DO $$
DECLARE
    actual_table_name TEXT;
BEGIN
    SELECT table_name INTO actual_table_name
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND LOWER(table_name) = 'gruposatividades'
    LIMIT 1;
    
    IF actual_table_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', actual_table_name);
        
        -- Drop políticas antigas
        EXECUTE format('DROP POLICY IF EXISTS "Permitir leitura de atividades para todos" ON public.%I', actual_table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir inserção de atividades para usuários autenticados" ON public.%I', actual_table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir atualização de atividades para usuários autenticados" ON public.%I', actual_table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir exclusão de atividades para usuários autenticados" ON public.%I', actual_table_name);
        
        -- Criar políticas
        EXECUTE format('CREATE POLICY "Permitir leitura de atividades para todos" ON public.%I FOR SELECT USING (true)', actual_table_name);
        EXECUTE format('CREATE POLICY "Permitir inserção de atividades para usuários autenticados" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', actual_table_name);
        EXECUTE format('CREATE POLICY "Permitir atualização de atividades para usuários autenticados" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'') WITH CHECK (auth.role() = ''authenticated'')', actual_table_name);
        EXECUTE format('CREATE POLICY "Permitir exclusão de atividades para usuários autenticados" ON public.%I FOR DELETE USING (auth.role() = ''authenticated'')', actual_table_name);
        
        RAISE NOTICE 'RLS e políticas configurados com sucesso!';
    END IF;
END $$;

-- Verificação final
SELECT 
    table_name,
    COUNT(*) as total_colunas
FROM information_schema.columns
WHERE table_schema = 'public'
AND LOWER(table_name) = 'gruposatividades'
GROUP BY table_name;
