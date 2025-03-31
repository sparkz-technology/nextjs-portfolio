"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IEducation } from "@/lib/types";
import { toggleEducationVisibilityAction, updateEducationSequenceAction } from "@/app/dashboard/education/action";
import { useEducationDialog } from "@/lib/zustand/use-dialog-store";
import { parseCustomDate } from "@/lib/utils"


interface EducationTableProps {
  data: IEducation[];
  currentPage: number;
  totalCount: number;
  expriencePageSize: number;
}

export default function EducationTable(props: EducationTableProps) {
  const { openDialogWithData } = useEducationDialog();
  const columns: ColumnDef<IEducation>[] = [
    {
      accessorKey: "logoUrl",
      header: () => <span className="font-semibold text-sm uppercase">Logo</span>,
      cell: ({ row }) => (
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={row.getValue("logoUrl")} alt={row.getValue("school")} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "school",
      header: () => <span className="font-semibold text-sm uppercase">School Name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("school")}</span>
      ),
    },
    {
      accessorKey: "degree",
      header: () => <span className="font-semibold text-sm uppercase">Course Name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("degree")}</span>
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
      accessorKey: "link",
      header: () => <span className="font-semibold text-sm uppercase">Links</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link passHref href={row.getValue("link")}>
            <Button variant="link" className="p-0">
              Website
            </Button>
          </Link>
        </div>
      ),
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
        const education = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(education.id)}>Copy Education ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "education", data: education })}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "deleteEducation", data: education })}>
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
      toast.error("Invalid Work expreience ID");
      return;
    }
    const fromValue = from ? parseInt(from, 10) : undefined;
    const toValue = to ? parseInt(to, 10) : undefined;

    if (fromValue === undefined || toValue === undefined) {
      toast.error("Invalid sequence values");
      return;
    }
    try {
      const { success, message } = await updateEducationSequenceAction({ from: fromValue, id, to: toValue });
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
      const { success, message } = await toggleEducationVisibilityAction(id);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Work expreience visibility updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };
  return (
    <Table<IEducation>
      data={props.data}
      columns={columns}
      currentPage={props.currentPage}
      pageSize={props.expriencePageSize}
      totalCount={props.totalCount}
    />
  );
}
