
import * as React from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { DollarSign } from "lucide-react"

interface CostSelectorProps {
    costType: string
    setCostType: (value: string) => void
    price?: string
    setPrice?: (value: string) => void
}

export function CostSelector({ costType, setCostType, price, setPrice }: CostSelectorProps) {
    return (
        <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium text-gray-500">Custo:</Label>
            <RadioGroup value={costType} onValueChange={setCostType} className="flex gap-4">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="r1" className="w-5 h-5 border-gray-400 text-blue-600 shadow-none" />
                    <Label htmlFor="r1" className="font-medium text-gray-700">Gratuito</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="confirmed" id="r2" className="w-5 h-5 border-gray-400 text-blue-600 shadow-none" />
                    <Label htmlFor="r2" className="font-medium text-gray-700">Confirmado</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quoting" id="r3" className="w-5 h-5 border-gray-400 text-blue-600 shadow-none" />
                    <Label htmlFor="r3" className="font-medium text-gray-700">Cotação pendente</Label>
                </div>
            </RadioGroup>

            {costType === 'confirmed' && (
                <div className="relative mt-2">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="0,00"
                        className="h-12 pl-9 bg-gray-50 border-gray-200 rounded-xl shadow-none"
                        value={price}
                        onChange={(e) => setPrice && setPrice(e.target.value)}
                    />
                </div>
            )}
        </div>
    )
}
