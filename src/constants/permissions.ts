export const AVAILABLE_PERMISSIONS = [
    { id: 'GERENCIAR_USUARIOS', label: 'Gerenciar usuários', description: 'Criar, editar e excluir colaboradores e viajantes' },
    { id: 'EDITAR_MISSOES', label: 'Editar missões', description: 'Criar e editar missões e grupos' },
    { id: 'EDITAR_FORNECEDORES', label: 'Editar fornecedores', description: 'Gerenciar catálogo de fornecedores' },
    { id: 'TODAS_AS_PERMISSOES', label: 'Admin', description: 'Acesso irrestrito a todo o sistema' },
] as const

export type PermissionId = typeof AVAILABLE_PERMISSIONS[number]['id']
