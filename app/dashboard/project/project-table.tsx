"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { parse, isValid, format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Table from "@/components/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { IProject } from "@/lib/type";
import IconRenderer from "@/components/icon-renderer";
import { toast } from "sonner";
import { toggleProjectVisibilityAction, updateProjectSequenceAction } from "./action";
import { useProjectDialog } from "@/lib/zustand/use-dialog-store";
import { parseCustomDate } from "@/lib/utils"


interface ProjectTableProps {
  data: IProject[];
  currentPage: number;
  totalCount: number;
  projectPageSize: number;
}

export default function ProjectTable(props: ProjectTableProps) {
  const { openDialogWithData } = useProjectDialog();

  const columns: ColumnDef<IProject>[] = [
    {
      accessorKey: "title",
      header: () => <span className="font-semibold text-sm uppercase">Project Name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("title")}</span>
      ),
    },
    {
      id: "timeLine",
      header: () => <span className="font-semibold text-sm uppercase">Time Line</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{`${parseCustomDate(row?.original?.startDate)} - ${parseCustomDate(row?.original?.endDate)}`}</span>
      ),
    },
    {
      id: "links",
      header: () => <span className="font-semibold text-sm uppercase">Links</span>,
      cell: ({ row }) => {
        const links = row.original.projectLinks;
        return (
          <div className="flex items-center gap-2">
            {links.map((link, idx) => (
              <Link passHref href={link.href} key={idx}>
                {link.icon && <IconRenderer iconName={link.icon.name} />}
              </Link>
            ))}
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
                ${row.getValue("visibility") ? "border-green-500 text-green-600" : "border-gray-400 text-gray-600"}
                hover:shadow-md`}
        >
          {row.getValue("visibility") ? "Visible" : "Hidden"}
        </Badge>
      ),
    },

    {
      id: "actions",
      header: () => <span className="font-semibold text-sm uppercase">Actions</span>,
      cell: ({ row }) => {
        const project = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(project.id)}>
                Copy Project ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "project", data: project })}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "deleteProject", data: project })}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      id: "orderId",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-end justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleSequenceOrder}
                  data-id={row.original.id}
                  data-from={row.original.sequenceValue.toString()}
                  data-to={(row.original.sequenceValue - 1).toString()}
                  disabled={row.original.sequenceValue === 0}
                >
                  <ArrowUp size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={handleSequenceOrder}
                  data-id={row.original.id}
                  data-from={row.original.sequenceValue.toString()}
                  data-to={(row.original.sequenceValue + 1).toString()}
                  disabled={(row.original.sequenceValue + 1) === props.totalCount}
                >
                  <ArrowDown size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Down</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  const handleSequenceOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id, from, to } = event.currentTarget.dataset;
    if (!id) {
      toast.error("Invalid Project ID");
      return;
    }
    const fromValue = from ? parseInt(from, 10) : undefined;
    const toValue = to ? parseInt(to, 10) : undefined;

    if (fromValue === undefined || toValue === undefined) {
      toast.error("Invalid sequence values");
      return;
    }
    try {
      const { success, message } = await updateProjectSequenceAction({ from: fromValue, id, to: toValue });
      if (!success) {
        throw new Error(message);
      }
      toast.success("Work expreience sequence updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleToggleVisibilityById = async (id: string) => {
    try {
      const { success, message } = await toggleProjectVisibilityAction(id);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Project visibility updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Table<IProject>
      data={props.data}
      columns={columns}
      currentPage={props.currentPage}
      totalCount={props.totalCount}
      pageSize={props.projectPageSize}
    />
  );
}
