import { useState, useCallback, useEffect } from "react"

interface UseMissionDataProps {
    groupId?: string
}

export function useMissionData({ groupId }: UseMissionDataProps) {
    const [missionGroups, setMissionGroups] = useState<any[]>([])
    const [missionTravelers, setMissionTravelers] = useState<any[]>([])

    const fetchMissionData = useCallback(async () => {
        if (!groupId) return

        try {
            const { groupsService } = await import("@/services/groupsService")
            const { travelersService } = await import("@/services/travelersService")

            const currentGroup = await groupsService.getGroupById(groupId)

            if (currentGroup?.missao_id) {
                const [groups, missionTravelersList, groupTravelersList] = await Promise.all([
                    groupsService.getGroupsByMissionId(currentGroup.missao_id),
                    travelersService.getAllTravelers({ missionId: currentGroup.missao_id }),
                    travelersService.getAllTravelers({ groupId: groupId })
                ])

                // Combine and deduplicate travelers
                const allTravelers = [...missionTravelersList]
                groupTravelersList.forEach((t: any) => {
                    if (!allTravelers.find(mt => mt.id === t.id)) {
                        allTravelers.push(t)
                    }
                })

                setMissionGroups(groups)
                setMissionTravelers(allTravelers)
            } else {
                // Fallback: fetch travelers just for this group
                const groupTravelersList = await travelersService.getAllTravelers({ groupId: groupId })
                setMissionTravelers(groupTravelersList)
                setMissionGroups([currentGroup])
            }
        } catch (error) {
            console.error("Failed to fetch mission data:", error)
        }
    }, [groupId])

    useEffect(() => {
        fetchMissionData()
    }, [fetchMissionData])

    return {
        missionGroups,
        missionTravelers,
        fetchMissionData
    }
}
