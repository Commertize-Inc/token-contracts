import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "../button";
import { Input } from "../input";
// import { DataTableViewOptions } from "./DataTableViewOptions";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	filterColumn?: string; // e.g., "name"
	searchPlaceholder?: string;
	filters?: {
		column: string;
		title: string;
		options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[];
	}[];
	sortOptions?: { label: string; value: string }[];
	onSortChange?: (value: string) => void;
}

export function DataTableToolbar<TData>({
	table,
	filterColumn = "name",
	searchPlaceholder = "Filter...",
	filters = [],
	sortOptions = [],
	onSortChange,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex items-center justify-between">
			<div className="flex flex-1 items-center space-x-2">
				<Input
					placeholder={searchPlaceholder}
					value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
					onChange={(event) =>
						table.getColumn(filterColumn)?.setFilterValue(event.target.value)
					}
					className="h-8 w-[150px] lg:w-[250px]"
				/>
				{filters.map(
					(filter) =>
						table.getColumn(filter.column) && (
							<DataTableFacetedFilter
								key={filter.column}
								column={table.getColumn(filter.column)}
								title={filter.title}
								options={filter.options}
							/>
						)
				)}
				{sortOptions.length > 0 && onSortChange && (
					<select
						onChange={(e) => onSortChange(e.target.value)}
						className="h-8 w-[150px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					>
						<option value="">Sort by...</option>
						{sortOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			{/* <DataTableViewOptions table={table} /> */}
		</div>
	);
}
