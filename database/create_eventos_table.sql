-- Tabela de Eventos do Itinerário
-- Esta tabela armazena todos os eventos do itinerário de um grupo (voos, hospedagens, visitas, etc.)

CREATE TABLE IF NOT EXISTS public.eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    
    -- Informações básicas do evento
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
    de TEXT, -- Origem (para voos e transfers)
    para TEXT, -- Destino (para voos e transfers)
    codigo_de TEXT, -- Código do aeroporto de origem (ex: "GRU")
    codigo_para TEXT, -- Código do aeroporto de destino (ex: "CAC")
    hora_de TIME, -- Hora de partida (para voos)
    hora_para TIME, -- Hora de chegada (para voos)
    
    -- Informações adicionais
    motorista TEXT, -- Nome do motorista (para transfers)
    logos TEXT[], -- Array de URLs de logos (companhias aéreas, hotéis, etc.)
    passageiros INTEGER[], -- Array de IDs de passageiros
    
    -- Status e flags
    atrasado BOOLEAN DEFAULT false,
    atraso TEXT, -- Tempo de atraso (ex: "30m")
    favorito BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_eventos_grupo_id ON public.eventos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON public.eventos(data);
CREATE INDEX IF NOT EXISTS idx_eventos_grupo_data ON public.eventos(grupo_id, data);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_eventos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS eventos_updated_at ON public.eventos;
CREATE TRIGGER eventos_updated_at
    BEFORE UPDATE ON public.eventos
    FOR EACH ROW
    EXECUTE FUNCTION update_eventos_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Drop políticas antigas se existirem
DROP POLICY IF EXISTS "Permitir leitura de eventos para todos" ON public.eventos;
DROP POLICY IF EXISTS "Permitir inserção de eventos para usuários autenticados" ON public.eventos;
DROP POLICY IF EXISTS "Permitir atualização de eventos para usuários autenticados" ON public.eventos;
DROP POLICY IF EXISTS "Permitir exclusão de eventos para usuários autenticados" ON public.eventos;

-- Política para leitura (todos podem ler)
CREATE POLICY "Permitir leitura de eventos para todos" 
    ON public.eventos
    FOR SELECT 
    USING (true);

-- Política para inserção (apenas usuários autenticados)
CREATE POLICY "Permitir inserção de eventos para usuários autenticados" 
    ON public.eventos
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política para atualização (apenas usuários autenticados)
CREATE POLICY "Permitir atualização de eventos para usuários autenticados" 
    ON public.eventos
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política para exclusão (apenas usuários autenticados)
CREATE POLICY "Permitir exclusão de eventos para usuários autenticados" 
    ON public.eventos
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE public.eventos IS 'Armazena os eventos do itinerário de cada grupo';
COMMENT ON COLUMN public.eventos.tipo IS 'Tipo do evento: flight, transfer, food, meal, hotel, visit, ai_recommendation, leisure';
COMMENT ON COLUMN public.eventos.status IS 'Status do evento: confirmed (confirmado), quoting (cotando), free (sem custo)';
COMMENT ON COLUMN public.eventos.duracao IS 'Duração do evento no formato "Xh Ym" (ex: "2h 30m")';
COMMENT ON COLUMN public.eventos.preco IS 'Preço formatado como string (ex: "R$ 1.500,00")';
