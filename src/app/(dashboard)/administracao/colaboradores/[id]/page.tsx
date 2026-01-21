import { CollaboratorForm } from "@/components/collaborators/CollaboratorForm"

export default async function EditCollaboratorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="p-4 h-full flex flex-col">
            <CollaboratorForm collaboratorId={id} />
        </div>
    )
}
