
import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

export function GroupSelector() {
    return (
        <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-gray-500">Grupos</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full !h-12 bg-white border-gray-200 rounded-xl shadow-none focus:ring-0 px-3 text-gray-700 justify-between font-normal hover:bg-white">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <Avatar className="w-6 h-6 border-2 border-white"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                                <Avatar className="w-6 h-6 border-2 border-white"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                                <Avatar className="w-6 h-6 border-2 border-white"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                            </div>
                            <span className="text-sm text-gray-700">5 selecionados</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-2 space-y-1">
                        {['Grupo Alpha', 'Grupo Beta', 'Grupo Gama', 'Grupo Delta', 'Grupo Epsilon'].map((group, i) => (
                            <div key={i} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <Checkbox id={`g-${i}`} className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                <Avatar className="w-8 h-8 border border-gray-100">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>G{i + 1}</AvatarFallback>
                                </Avatar>
                                <Label htmlFor={`g-${i}`} className="flex-1 cursor-pointer font-medium text-gray-700">{group}</Label>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
