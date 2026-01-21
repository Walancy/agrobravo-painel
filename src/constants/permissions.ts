export const AVAILABLE_PERMISSIONS = [
    { id: 'GERENCIAR_USUARIOS', label: 'Gerenciar Usuários', description: 'Criar, editar e excluir colaboradores e viajantes' },
    { id: 'EDITAR_MISSOES', label: 'Gerenciar Missões', description: 'Criar e editar missões e grupos' },
    { id: 'EDITAR_CATALOGOS_DE_SERVICO', label: 'Gerenciar Fornecedores', description: 'Gerenciar catálogo de fornecedores' },
    { id: 'TODAS_AS_PERMISSOES', label: 'Acesso Total', description: 'Acesso irrestrito a todo o sistema' },
] as const

export type PermissionId = typeof AVAILABLE_PERMISSIONS[number]['id']
