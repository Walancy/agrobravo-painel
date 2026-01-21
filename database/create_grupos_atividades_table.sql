-- Tabela de Atividades dos Grupos
-- Esta tabela armazena atividades específicas vinculadas aos grupos
-- (complementar à tabela eventos, para casos onde você precisa separar atividades de eventos gerais)

CREATE TABLE IF NOT EXISTS public.gruposAtividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    
    -- Informações básicas da atividade
    tipo TEXT NOT NULL, -- 'flight', 'transfer', 'food', 'meal', 'hotel', 'visit', 'ai_recommendation', 'leisure'
    titulo TEXT NOT NULL,
    subtitulo TEXT,
    descricao TEXT,
    
    -- Data e hora
    data DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    duracao TEXT, -- Formato: "2h 30m" ou "1h" ou "45m"
    
    -- Informações financeiras
    preco TEXT, -- Formato: "R$ 1.500,00"
    status TEXT CHECK (status IN ('confirmed', 'quoting', 'free')),
    
    -- Localização
    localizacao TEXT,
    de TEXT, -- Origem
    para TEXT, -- Destino
    codigo_de TEXT, -- Código de origem
    codigo_para TEXT, -- Código de destino
    hora_de TIME, -- Hora de partida
    hora_para TIME, -- Hora de chegada
    
    -- Informações adicionais
    motorista TEXT,
    logos TEXT[], -- Array de URLs de logos
    passageiros INTEGER[], -- Array de IDs de passageiros
    
    -- Status e flags
    atrasado BOOLEAN DEFAULT false,
    atraso TEXT,
    favorito BOOLEAN DEFAULT false,
    
    -- Campos específicos de atividades
    responsavel_id UUID REFERENCES auth.users(id), -- Responsável pela atividade
    confirmado BOOLEAN DEFAULT false,
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_grupos_atividades_grupo_id ON public.gruposAtividades(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupos_atividades_data ON public.gruposAtividades(data);
CREATE INDEX IF NOT EXISTS idx_grupos_atividades_grupo_data ON public.gruposAtividades(grupo_id, data);
CREATE INDEX IF NOT EXISTS idx_grupos_atividades_responsavel ON public.gruposAtividades(responsavel_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_grupos_atividades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grupos_atividades_updated_at
    BEFORE UPDATE ON public.gruposAtividades
    FOR EACH ROW
    EXECUTE FUNCTION update_grupos_atividades_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.gruposAtividades ENABLE ROW LEVEL SECURITY;

-- Política para leitura (todos podem ler)
CREATE POLICY "Permitir leitura de atividades para todos" 
    ON public.gruposAtividades
    FOR SELECT 
    USING (true);

-- Política para inserção (apenas usuários autenticados)
CREATE POLICY "Permitir inserção de atividades para usuários autenticados" 
    ON public.gruposAtividades
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (apenas usuários autenticados)
CREATE POLICY "Permitir atualização de atividades para usuários autenticados" 
    ON public.gruposAtividades
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para exclusão (apenas usuários autenticados)
CREATE POLICY "Permitir exclusão de atividades para usuários autenticados" 
    ON public.gruposAtividades
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.gruposAtividades IS 'Armazena atividades específicas vinculadas aos grupos';
COMMENT ON COLUMN public.gruposAtividades.tipo IS 'Tipo da atividade: flight, transfer, food, meal, hotel, visit, ai_recommendation, leisure';
COMMENT ON COLUMN public.gruposAtividades.status IS 'Status da atividade: confirmed (confirmado), quoting (cotando), free (sem custo)';
COMMENT ON COLUMN public.gruposAtividades.responsavel_id IS 'ID do usuário responsável pela atividade';
COMMENT ON COLUMN public.gruposAtividades.confirmado IS 'Indica se a atividade foi confirmada';
