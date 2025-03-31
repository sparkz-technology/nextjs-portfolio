"use client";

import clsx from "clsx";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { Heart, MoreHorizontal } from "lucide-react";

import Table from "@/components/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useGuestSignatureDialog } from "@/lib/zustand/use-dialog-store";
import { toggleVisibilityByIdAction } from "@/app/dashboard/guestbook/action";
import { IGuestSignature } from "@/lib/types";

interface GustbookTableProps {
  data: IGuestSignature[];
  currentPage: number;
  totalCount: number;
  skillPageSize: number;
}

const GustbookTable: React.FC<GustbookTableProps> = (props) => {
  const { openDialogWithData } = useGuestSignatureDialog();
  const columns: ColumnDef<IGuestSignature>[] = [
    {
      id: "name",
      header: () => <span className="font-semibold text-sm uppercase">Username</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">@{row.original.user?.username}</span>
      ),
    },
    {
      accessorKey: "message",
      header: () => <span className="font-semibold text-sm uppercase">Message</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200"> {row.getValue("message")}</span>
      ),
    },
    {
      id: "likes",
      header: () => <span className="font-semibold text-xs uppercase text-gray-600 dark:text-gray-400">Likes</span>,
      cell: ({ row }) => {
        const hasLikes = !!row.original._count?.likes;
        const likeCount = row.original._count?.likes || 0;
        return (
          <div className="flex items-center space-x-1">
            <Heart
              className={clsx("h-4 w-4 transition-colors", {
                "text-red-500 dark:text-red-400": hasLikes,
                "text-gray-400 dark:text-gray-600": !hasLikes,
              })}
              style={{
                fill: hasLikes ? "currentColor" : "none",
              }}
            />
            <span
              className={`font-medium ${
                hasLikes ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {likeCount}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "visibility",
      header: () => <span className="font-semibold text-sm uppercase">Visibility</span>,
      cell: ({ row }) => (
        <Badge
          onClick={() => handleToggleVisibilityById(row.original.id)}
          variant="outline"
          className={`rounded-full border transition cursor-pointer
                ${row.getValue("visibility") ? "border-green-500 text-green-600" : "border-gray-400 text-gray-600"}`}
        >
          {row.getValue("visibility") ? "Visible" : "Hidden"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <span className="font-semibold text-sm uppercase">Actions</span>,
      cell: ({ row }) => {
        const guestSignature = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(guestSignature.id)}>
                Copy guest signature ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDialogWithData({ type: "deleteGuestSignature", data: guestSignature })}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleToggleVisibilityById = async (id: string) => {
    try {
      const { success, message } = await toggleVisibilityByIdAction(id);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Guest signature visibility updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };
  return (
    <Table<IGuestSignature>
      data={props.data}
      columns={columns}
      currentPage={props.currentPage}
      pageSize={props.skillPageSize}
      totalCount={props.totalCount}
    />
  );
};

export default GustbookTable;
