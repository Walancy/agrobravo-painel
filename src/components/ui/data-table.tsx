"use client"

import * as React from "react"
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onRowClick,
    sorting: externalSorting,
    onSortingChange: externalOnSortingChange,
}: DataTableProps<TData, TValue> & {
    onRowClick?: (row: any) => void
    sorting?: SortingState
    onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>
}) {
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([])

    const sorting = externalSorting ?? internalSorting
    const setSorting = externalOnSortingChange ?? setInternalSorting

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: "onChange",
        state: {
            sorting,
        },
        manualSorting: !!externalSorting, // If external sorting is provided, we assume manual sorting (or handled by parent)
    })

    return (
        <div className="rounded-none border-none w-full overflow-hidden flex flex-col h-full">
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-200">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className="relative group text-xs font-semibold text-gray-500 uppercase tracking-wider pb-4"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : (
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-2 cursor-pointer select-none",
                                                            header.column.getCanSort() && "hover:text-gray-700"
                                                        )}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                        {header.column.getCanSort() && (
                                                            <span className={cn(
                                                                "ml-2 transition-opacity",
                                                                !header.column.getIsSorted() && "opacity-0 group-hover:opacity-100"
                                                            )}>
                                                                {{
                                                                    asc: <ArrowUp className="h-3 w-3" />,
                                                                    desc: <ArrowDown className="h-3 w-3" />,
                                                                }[header.column.getIsSorted() as string] ?? (
                                                                        <ArrowUpDown className="h-3 w-3 text-gray-300" />
                                                                    )}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    onDoubleClick={() => table.resetColumnSizing()}
                                                    className={cn(
                                                        "absolute -right-2 top-0 h-full w-4 cursor-col-resize bg-transparent touch-none select-none",
                                                    )}
                                                />
                                            )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, index) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={cn(
                                        "border-none h-16 transition-colors",
                                        index % 2 !== 0 ? "bg-gray-50 hover:bg-gray-100/50" : "bg-transparent hover:bg-gray-50/50",
                                        onRowClick && "cursor-pointer"
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {row.getVisibleCells().map((cell, cellIndex) => (
                                        <TableCell
                                            key={cell.id}
                                            className={cn(
                                                "font-medium",
                                                index % 2 !== 0 && cellIndex === 0 && "rounded-l-2xl",
                                                index % 2 !== 0 && cellIndex === row.getVisibleCells().length - 1 && "rounded-r-2xl"
                                            )}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
