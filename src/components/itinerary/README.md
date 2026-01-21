# Componente GroupItineraryTab - Documentação

## 📁 Estrutura de Arquivos

```
src/components/itinerary/
├── GroupItineraryTab.tsx          # Componente principal (refatorado)
├── ItineraryDayColumn.tsx         # Componente de coluna de dia
├── ItineraryEventItem.tsx         # Componente de item de evento
├── hooks/
│   ├── useItineraryData.ts        # Hook para gerenciar dados do itinerário
│   ├── useMissionData.ts          # Hook para gerenciar dados da missão
│   ├── useConflictDetection.ts    # Hook para detectar conflitos de horário
│   ├── useEditModals.ts           # Hook para gerenciar modais de edição
│   └── useItineraryActions.ts     # Hook para ações do itinerário (CRUD)
└── utils/
    ├── deleteEventHelpers.ts      # Helpers para deletar eventos e relacionados
    └── eventMappers.ts            # Mapeadores de eventos para o banco de dados
```

## 🎯 Melhorias Implementadas

### 1. **Remoção de Mocks**
- ✅ Removido `initialItineraryData` (dados mockados)
- ✅ Itinerário agora é gerado dinamicamente baseado em `startDate` e `endDate`

### 2. **Separação de Responsabilidades**
Cada hook tem uma responsabilidade específica:

#### `useItineraryData`
- Busca eventos do banco de dados
- Gera estrutura do itinerário baseado nas datas
- Ordena eventos por horário

#### `useMissionData`
- Busca grupos da missão
- Busca viajantes (missão + grupo)
- Deduplica viajantes

#### `useConflictDetection`
- Detecta conflitos de horário entre eventos
- Notifica componente pai via callback

#### `useEditModals`
- Gerencia estado de todos os modais de edição
- Abre modal correto baseado no tipo de evento
- Fecha todos os modais

#### `useItineraryActions`
- Salvar novos eventos
- Editar eventos existentes
- Deletar eventos (com lógica de eventos relacionados)
- Toggle de favoritos

### 3. **Utilitários Extraídos**

#### `deleteEventHelpers.ts`
Funções especializadas para deletar eventos e seus relacionados:
- `deleteEventWithRelated()` - Função principal
- `handleFlightDeletion()` - Deleta voo e transfer associado
- `handleHotelDeletion()` - Deleta hotel, check-in/out pareado e transfers
- `handleEventWithTransferDeletion()` - Deleta evento e transfer
- `handleTransferDeletion()` - Deleta transfer e atualiza evento pai

#### `eventMappers.ts`
- `mapEventToDatabase()` - Mapeia Event para formato do banco
- `handleTransferDeletion()` - Remove transfer ao desmarcar checkbox
- `handleFlightTransferDeletion()` - Remove transfer de voo

### 4. **Código Mais Limpo**
- ✅ Componente principal reduzido de **789 linhas** para **~220 linhas**
- ✅ Lógica complexa movida para hooks e utilitários
- ✅ Melhor legibilidade e manutenibilidade
- ✅ Fácil de testar (cada hook pode ser testado isoladamente)

## 🔧 Como Usar

```tsx
<GroupItineraryTab
  groupId="uuid-do-grupo"
  startDate="2026-05-22"
  endDate="2026-05-26"
  isEmpty={false}
  onConflictChange={(hasConflict) => console.log('Conflito:', hasConflict)}
/>
```

## 📝 Próximos Passos (Sugestões)

1. **Testes Unitários**: Criar testes para cada hook
2. **Error Handling**: Adicionar toasts para erros
3. **Loading States**: Melhorar feedback visual durante carregamento
4. **Otimizações**: Implementar debounce em operações custosas
5. **TypeScript**: Adicionar tipos mais específicos (remover `any`)

## 🎨 Boas Práticas Aplicadas

- ✅ **Single Responsibility Principle**: Cada módulo tem uma única responsabilidade
- ✅ **DRY (Don't Repeat Yourself)**: Lógica duplicada foi extraída
- ✅ **Custom Hooks**: Lógica reutilizável encapsulada
- ✅ **Separation of Concerns**: UI separada da lógica de negócio
- ✅ **Clean Code**: Nomes descritivos, funções pequenas e focadas
