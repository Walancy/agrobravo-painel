"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HospedagemTab } from "./tabs/HospedagemTab"
import { RestauranteTab } from "./tabs/RestauranteTab"
import { VisitaTab } from "./tabs/VisitaTab"
import { TransferTab } from "./tabs/TransferTab"
import { CompanhiaAereaTab } from "./tabs/CompanhiaAereaTab"

export function SuppliersManagement() {
    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            <Tabs defaultValue="hospedagem" className="flex flex-col h-full">
                <div className="px-6">
                    <TabsList className="h-auto bg-transparent p-0 gap-0 border-none rounded-none shadow-none">
                        <TabsTrigger
                            value="hospedagem"
                            className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-4 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                        >
                            Hospedagem
                        </TabsTrigger>
                        <TabsTrigger
                            value="restaurante"
                            className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-4 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                        >
                            Restaurante
                        </TabsTrigger>
                        <TabsTrigger
                            value="visita"
                            className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-4 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                        >
                            Visita
                        </TabsTrigger>
                        <TabsTrigger
                            value="transfer"
                            className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-4 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                        >
                            Transfer
                        </TabsTrigger>
                        <TabsTrigger
                            value="companhia-aerea"
                            className="h-auto !flex-none !rounded-none !border-0 !border-b-0 !px-6 !py-4 text-gray-500 font-medium data-[state=active]:!border-b-[3px] data-[state=active]:!border-blue-600 data-[state=active]:!text-gray-900 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none hover:text-gray-700 transition-colors focus-visible:!ring-0"
                        >
                            Companhia aérea
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="hospedagem" className="flex-1 m-0 overflow-hidden">
                    <HospedagemTab />
                </TabsContent>
                <TabsContent value="restaurante" className="flex-1 m-0 overflow-hidden">
                    <RestauranteTab />
                </TabsContent>
                <TabsContent value="visita" className="flex-1 m-0 overflow-hidden">
                    <VisitaTab />
                </TabsContent>
                <TabsContent value="transfer" className="flex-1 m-0 overflow-hidden">
                    <TransferTab />
                </TabsContent>
                <TabsContent value="companhia-aerea" className="flex-1 m-0 overflow-hidden">
                    <CompanhiaAereaTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
