import * as React from "react";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	Table as TableInstance,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../table";

import { DataTablePagination } from "./DataTablePagination";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { Input } from "../input";
import { Button } from "../button";
import { Grid, List } from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	view?: "table" | "grid";
	renderGridItem?: (item: TData) => React.ReactNode;
	renderToolbar?: (table: TableInstance<TData>) => React.ReactNode;
	filterColumnName?: string; // For simple search
	searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	view: initialView = "table",
	renderGridItem,
	renderToolbar,
	filterColumnName,
	searchPlaceholder = "Filter...",
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [view, setView] = React.useState(initialView);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex flex-1 items-center space-x-2">
					{filterColumnName && (
						<Input
							placeholder={searchPlaceholder}
							value={
								(table
									.getColumn(filterColumnName)
									?.getFilterValue() as string) ?? ""
							}
							onChange={(event) =>
								table
									.getColumn(filterColumnName)
									?.setFilterValue(event.target.value)
							}
							className="h-8 w-[150px] lg:w-[250px]"
						/>
					)}
					{renderToolbar && renderToolbar(table as any)}
				</div>
				<div className="flex items-center space-x-2">
					{renderGridItem && (
						<div className="flex items-center border rounded-md p-1 bg-muted/20">
							<Button
								variant={view === "table" ? "secondary" : "ghost"}
								size="sm"
								className="h-7 w-7 p-0"
								onClick={() => setView("table")}
							>
								<List className="h-4 w-4" />
							</Button>
							<Button
								variant={view === "grid" ? "secondary" : "ghost"}
								size="sm"
								className="h-7 w-7 p-0"
								onClick={() => setView("grid")}
							>
								<Grid className="h-4 w-4" />
							</Button>
						</div>
					)}
					<DataTableViewOptions table={table} />
				</div>
			</div>

			{view === "table" ? (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext()
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{table.getRowModel().rows.map((row) => (
						<div key={row.id}>
							{renderGridItem && renderGridItem(row.original)}
						</div>
					))}
				</div>
			)}

			<DataTablePagination table={table} />
		</div>
	);
}
