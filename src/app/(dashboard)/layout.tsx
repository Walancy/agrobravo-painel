"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";
import { cn } from "@/lib/utils";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const { isExpanded } = useLayout()

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                isExpanded ? "h-0 opacity-0" : "h-16 opacity-100"
            )}>
                <Header />
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out flex flex-col",
                    isExpanded ? "w-0 opacity-0" : (isSidebarCollapsed ? "w-[70px]" : "w-[240px]") + " opacity-100"
                )}>
                    <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />
                </div>
                <main className="flex-1 bg-muted/30 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <LayoutProvider>
            <DashboardContent>{children}</DashboardContent>
        </LayoutProvider>
    );
}
