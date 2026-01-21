'use client'

import { useEffect, useState } from 'react'
import {
    Plane,
    FileText,
    DollarSign,
    Bell,
    Calendar as CalendarIcon,
    Plus
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { UpcomingEventCard } from '@/components/dashboard/UpcomingEventCard'
import { NotificationItem } from '@/components/dashboard/NotificationItem'
import { PendencyItem } from '@/components/dashboard/PendencyItem'
import { GroupsCalendar } from '@/components/dashboard/GroupsCalendar'
import { EmptyState } from '@/components/dashboard/EmptyState'
import { dashboardService, DashboardData } from '@/services/dashboardService'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedMission, setSelectedMission] = useState<string>('all')
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await dashboardService.getDashboardData()
                setData(dashboardData)
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-xl" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        )
    }

    const stats = data?.stats || {
        groups_in_progress: { count: 0, missions_count: 0 },
        pending_documents: { count: 0, travelers_count: 0 },
        pending_expenses: { count: 0, guides_count: 0 }
    }

    const filteredEvents = data?.upcoming_events.filter(event =>
        selectedMission === 'all' || event.group_id === selectedMission // Actually mission_id would be better but group_id is what we have in the card
    ) || []

    // Get unique missions for the select
    const missions = Array.from(new Map(data?.upcoming_events.map(e => [e.mission_name, e])).values())

    return (
        <div className="flex flex-col lg:flex-row h-full bg-gray-50/50 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-4 lg:p-5 flex flex-col gap-4 overflow-hidden">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                    <StatCard
                        icon={Plane}
                        title="Grupos em andamento"
                        count={stats.groups_in_progress.count}
                        subtitle={`de ${stats.groups_in_progress.missions_count} Missões`}
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={FileText}
                        title="Documentos pendentes"
                        count={stats.pending_documents.count}
                        subtitle={`de ${stats.pending_documents.travelers_count} Viajante`}
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        icon={DollarSign}
                        title="Despesas pendentes"
                        count={stats.pending_expenses.count}
                        subtitle={`de ${stats.pending_expenses.guides_count} Guias`}
                        iconColor="text-blue-600"
                    />
                </div>

                {/* Middle Section: Events and Notifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Upcoming Events */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">Próximos eventos dos grupos</h3>
                                <p className="text-xs text-gray-500">Acompanhe os próximos eventos dos grupos de missões</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 uppercase font-medium">Missão:</span>
                                <Select value={selectedMission} onValueChange={setSelectedMission}>
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {missions.map(m => (
                                            <SelectItem key={m.id} value={m.group_id}>{m.mission_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map(event => (
                                    <UpcomingEventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center py-4">
                                    <EmptyState
                                        title="Sem missões cadastradas"
                                        description="Você ainda não cadastrou nenhuma missão."
                                        actionLabel="Cadastrar nova missão"
                                        onAction={() => router.push('/missoes')}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Notifications */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col min-h-0">
                        <div className="mb-3 flex-shrink-0">
                            <h3 className="text-base font-semibold text-gray-900">Notificações recentes</h3>
                            <p className="text-xs text-gray-500">Acompanhe suas notificações mais recentes</p>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                            {data?.recent_notifications && data.recent_notifications.length > 0 ? (
                                data.recent_notifications.map(notification => (
                                    <NotificationItem key={notification.id} notification={notification} />
                                ))
                            ) : (
                                <div className="h-full flex items-center justify-center py-4 text-gray-400 flex-col gap-2">
                                    <Bell className="w-5 h-5 opacity-20" />
                                    <span className="text-xs">Sem notificações</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Calendar */}
                <div className="w-full flex-shrink-0">
                    <GroupsCalendar
                        events={data?.calendar_events || []}
                        onEventClick={(id) => router.push(`/grupos/${id}`)}
                    />
                </div>
            </div>

            {/* Right Sidebar: Pendencies */}
            <div className="w-full lg:w-72 bg-white border-l border-gray-200 p-4 flex flex-col h-full overflow-hidden">
                <div className="mb-4 flex-shrink-0">
                    <h3 className="text-base font-semibold text-gray-900">
                        {data?.pendencies && data.pendencies.length > 0 ? 'Pendências totais' : 'Pendências'}
                    </h3>
                    <p className="text-xs text-gray-500">Acompanhe todas as suas pendências</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2">
                    {data?.pendencies && data.pendencies.length > 0 ? (
                        data.pendencies.map(pendency => (
                            <PendencyItem key={pendency.id} pendency={pendency} />
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center py-4 text-gray-400 flex-col gap-2">
                            <FileText className="w-5 h-5 opacity-20" />
                            <span className="text-xs">Sem pendencias</span>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    )
}
