"use client";

import * as React from "react";
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, ColumnDef } from "@tanstack/react-table";

import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationWithLinks } from "./ui/pagination-with-links";

interface TableProps<TData> {
  data: TData[];
  currentPage: number;
  totalCount: number;
  pageSize: number;
  columns: ColumnDef<TData, unknown>[];
}

function Table<TData>({ data = [], columns = [], currentPage, pageSize, totalCount }: TableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <UiTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data found in the table.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UiTable>
      </div>
      {data.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <PaginationWithLinks
            page={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            pageSizeSelectOptions={{
              pageSizeOptions: [5, 10, 25, 50],
            }}
          />
        </div>
      )}
    </div>
  );
}

export default React.memo(Table) as <TData>(props: TableProps<TData>) => React.ReactElement;
