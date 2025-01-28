"use client";

import { toast } from "sonner";
import { format } from "timeago.js";
import { MoreHorizontal } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

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
import { IMessage } from "@/lib/type";
import { Badge } from "@/components/ui/badge";
import { toggleReadByIdAction } from "@/app/dashboard/message/action";

interface MessagekTableProps {
  data: IMessage[];
  currentPage: number;
  totalCount: number;
  skillPageSize: number;
}

const MessageTable: React.FC<MessagekTableProps> = (props) => {
  const columns: ColumnDef<IMessage>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: () => <span className="font-semibold text-sm uppercase">name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("name")}</span>
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
      accessorKey: "createdAt",
      header: () => <span className="font-semibold text-sm uppercase">
        Created At
      </span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">
          {format((row.getValue("createdAt") as number))}
        </span>
      ),
    },
    {
      accessorKey: "isRead",
      header: () => <span className="font-semibold text-sm uppercase">Status</span>,
      cell: ({ row }) => (
        <Badge
          onClick={() => handleToggleReadById(row.original.id)}
          variant="outline"
          className={`rounded-full border transition cursor-pointer
                ${row.getValue("isRead") ? "border-green-500 text-green-600" : "border-gray-400 text-gray-600"}`}
        >
          {row.getValue("isRead") ? "Read" : "Read"}
        </Badge>
      ),
    },
    {
      id: "actions",
      accessorKey: "userId",
      header: () => <span className="font-semibold text-sm uppercase">Actions</span>,
      cell: ({ row }) => {
        const userId = row.original.userId;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userId && navigator.clipboard.writeText(userId)}>
                {userId ? "Copy User ID" : "No User ID"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const handleToggleReadById = async (id: string) => {
    try {
      const { success, message } = await toggleReadByIdAction(id);
      if (!success) {
        throw new Error(message);
      }
      toast.success(message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Table<IMessage>
      data={props.data}
      columns={columns}
      currentPage={props.currentPage}
      pageSize={props.skillPageSize}
      totalCount={props.totalCount}
    />
  );
};

export default MessageTable;
