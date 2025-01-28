"use client";

import { IAsset } from "@/lib/type";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "timeago.js";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssetDialog } from "@/lib/zustand/use-dialog-store";
import Table from "@/components/table";

interface AssetTableProps {
  data: IAsset[];
  currentPage: number;
  totalCount: number;
  assetPageSize: number;
}

export function AssetTable(props: AssetTableProps) {
  const { openDialogWithData } = useAssetDialog();

  const columns: ColumnDef<IAsset>[] = [
    {
      accessorKey: "name",
      header: () => <span className="font-semibold text-sm uppercase">Name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "type",
      header: () => <span className="font-semibold text-sm uppercase">Type</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("type")}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => <span className="font-semibold text-sm uppercase">Created At</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">
          {format(row.getValue("createdAt") as number)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="font-semibold text-sm uppercase">Actions</span>,
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(asset.publicId)}>
                Copy Public ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "viewAsset", data: asset })}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "deleteAsset", data: asset })}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
      <Table
        data={props.data}
        columns={columns}
        currentPage={props.currentPage}
        pageSize={props.assetPageSize}
        totalCount={props.totalCount}
      />
  );
}
