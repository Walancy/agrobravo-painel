"use client"

import React, { createContext, useContext, useState } from "react"

interface LayoutContextType {
    isExpanded: boolean
    toggleExpanded: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpanded = () => setIsExpanded(prev => !prev)

    return (
        <LayoutContext.Provider value={{ isExpanded, toggleExpanded }}>
            {children}
        </LayoutContext.Provider>
    )
}

export function useLayout() {
    const context = useContext(LayoutContext)
    if (context === undefined) {
        throw new Error("useLayout must be used within a LayoutProvider")
    }
    return context
}
