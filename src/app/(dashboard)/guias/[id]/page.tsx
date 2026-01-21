import { GuideForm } from "@/components/guides/GuideForm"

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="p-4 h-full flex flex-col">
            <GuideForm guideId={id} />
        </div>
    )
}
