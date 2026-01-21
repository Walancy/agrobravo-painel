# Implementação de Logos de Grupos no Itinerário

## Resumo
Implementei um sistema completo para exibir os logos dos grupos nos cards de eventos do itinerário, substituindo os logos de companhias aéreas/hotéis. Agora, os avatares mostram quais grupos têm participantes em cada evento.

## Mudanças Implementadas

### 1. Backend - API de Itinerário (`src/app/api/itinerary/route.ts`)

**Funcionalidade Principal:**
- A API agora busca TODOS os eventos e filtra para mostrar:
  - Eventos criados pelo grupo atual
  - Eventos de outros grupos que têm participantes do grupo atual
  
**Lógica de Grupos:**
1. Busca todos os viajantes do grupo atual
2. Filtra eventos relevantes (criados pelo grupo OU com participantes do grupo)
3. Para cada evento, identifica todos os participantes únicos
4. Busca informações dos grupos desses participantes via join com `viajantes.grupos`
5. Extrai os logos dos grupos e adiciona ao evento como `groupLogos[]`

**Resultado:**
- Cada evento agora retorna um array `groupLogos` contendo os logos únicos dos grupos que têm participantes naquele evento
- Eventos aparecem no itinerário de TODOS os grupos que têm participantes, não apenas no grupo criador

### 2. Tipo Event (`src/types/itinerary.ts`)

Adicionado novo campo:
```typescript
groupLogos?: string[]  // Logos of groups that have participants in this event
```

### 3. Componente GroupAvatars (`src/components/itinerary/GroupAvatars.tsx`)

Novo componente reutilizável que implementa a lógica de prioridade para exibição de avatares:

**Prioridade de Exibição:**
1. **groupLogos** (PRIORIDADE MÁXIMA) - Logos dos grupos com participantes
2. **passengers** - Avatares individuais dos participantes (fallback)
3. **logos** - Logos de companhias/hotéis (fallback final)

**Características:**
- Exibe até 3 logos por padrão (configurável via `maxDisplay`)
- Mostra contador "+N" quando há mais grupos
- Design consistente com avatares circulares e bordas brancas

### 4. ItineraryEventItem (`src/components/itinerary/ItineraryEventItem.tsx`)

- Importado e integrado o componente `GroupAvatars`
- Substituído toda a lógica de renderização de avatares pelo novo componente
- Aplicado a TODOS os tipos de eventos (flight, hotel, visit, leisure, etc.)

## Comportamento do Sistema

### Cenário 1: Evento com Participantes de Múltiplos Grupos
```
Evento: Voo para São Paulo
Participantes:
  - João (Grupo A)
  - Maria (Grupo A)
  - Pedro (Grupo B)
  - Ana (Grupo C)

Resultado:
- Card mostra 3 logos: [Logo Grupo A] [Logo Grupo B] [Logo Grupo C]
- Evento aparece no itinerário dos Grupos A, B e C
```

### Cenário 2: Evento Criado em Grupo A com Participante do Grupo B
```
Grupo A cria evento de visita
Adiciona participantes:
  - 2 pessoas do Grupo A
  - 1 pessoa do Grupo B

Resultado:
- Evento aparece no itinerário do Grupo A (criador)
- Evento aparece no itinerário do Grupo B (tem participante)
- Card mostra: [Logo Grupo A] [Logo Grupo B]
```

### Cenário 3: Evento Sem Grupos (Fallback)
```
Se groupLogos estiver vazio:
  - Mostra avatares dos participantes individuais
  - Se não houver participantes, mostra logos de companhias
```

## Relacionamentos no Supabase

### Estrutura Necessária:
```
eventos
  ├─ grupo_id (FK para grupos)
  └─ passageiros[] (array de user IDs)

gruposParticipantes
  ├─ user_id (FK para users)
  ├─ grupo_id (FK para grupos)
  └─ grupos (join)
      └─ logo

grupos
  ├─ id (PK)
  └─ logo (URL da imagem)

users
  └─ id (PK)
```

### Query Join Implementada:
```sql
-- Buscar participantes do grupo
SELECT user_id
FROM gruposParticipantes
WHERE grupo_id = 'grupo-id'

-- Buscar informações dos grupos dos participantes
SELECT user_id, grupo_id, grupos(id, logo)
FROM gruposParticipantes
WHERE user_id IN (array_de_participantes)
```

### Nota Importante:
**NÃO é necessária nenhuma migration!** O sistema usa as tabelas e relacionamentos existentes:
- `gruposParticipantes` - já existe e relaciona users com grupos
- `grupos` - já tem o campo `logo`
- `eventos` - já tem o campo `passageiros[]` com IDs de users

### ⚠️ Problema de Relacionamento Ambíguo (RESOLVIDO):

Se você tiver **duas foreign keys** entre `gruposParticipantes` e `grupos`, o Supabase retornará erro:
```
Could not embed because more than one relationship was found for 'gruposParticipantes' and 'grupos'
```

**Solução aplicada**: Especificar explicitamente qual FK usar na query:
```typescript
// ❌ ERRADO (ambíguo)
.select('user_id, grupo_id, grupos(id, logo)')

// ✅ CORRETO (específico)
.select('user_id, grupo_id, grupos!gruposParticipantes_grupo_id_fkey(id, logo)')
```

Isso já está implementado no código!

## Benefícios

1. **Visibilidade Cross-Group**: Eventos compartilhados aparecem em todos os grupos relevantes
2. **Identificação Visual**: Fácil identificar quais grupos estão em cada evento
3. **Escalabilidade**: Sistema funciona com qualquer número de grupos
4. **Fallback Inteligente**: Sempre mostra algo relevante (grupos > participantes > logos)
5. **Performance**: Uma única query busca todos os dados necessários

## Próximos Passos Recomendados

1. **Adicionar Tooltip**: Mostrar nomes dos grupos ao passar o mouse sobre os logos
2. **Filtro por Grupo**: Permitir filtrar eventos por grupo específico
3. **Indicador Visual**: Destacar eventos criados pelo grupo atual vs. compartilhados
4. **Notificações**: Alertar grupos quando são adicionados a eventos de outros grupos

## Notas Técnicas

- Build passou sem erros
- Componente totalmente tipado com TypeScript
- Compatível com todos os tipos de eventos existentes
- Não quebra funcionalidade existente (fallback para comportamento anterior)
