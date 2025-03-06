"use client";

import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useSkillDialog } from "@/lib/zustand/use-dialog-store";
import { toggleVisibilityByIdAction, updateSequenceAction } from "@/app/dashboard/skill/action";
import { ISkill } from "@/lib/type";

interface SkillTableProps {
  data: ISkill[];
  currentPage: number;
  totalCount: number;
  skillPageSize: number;
}

const SkillTable: React.FC<SkillTableProps> = (props) => {
  const { openDialogWithData } = useSkillDialog();
  const columns: ColumnDef<ISkill>[] = [
    {
      accessorKey: "name",
      header: () => <span className="font-semibold text-sm uppercase">Skill Name</span>,
      cell: ({ row }) => (
        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{row.getValue("name")}</span>
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
        const skill = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(skill.id)}>Copy Skill ID</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "skill", data: skill })}>
                Update
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialogWithData({ type: "deleteSkill", data: skill })}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
    {
      id: "sequenceValue",
      cell: ({ row }) => (
        <div className="flex items-end justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                data-id={row.original.id}
                data-from={row.original.sequenceValue.toString()}
                data-to={(row.original.sequenceValue - 1).toString()}
                disabled={row.original.sequenceValue === 0}
                onClick={handleSequenceOrder}
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
        </div>
      ),
    },
  ];

  const handleSequenceOrder = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { id, from, to } = event.currentTarget.dataset;
    if (!id) {
      toast.error("Invalid skill ID");
      return;
    }
    const fromValue = from ? parseInt(from, 10) : undefined;
    const toValue = to ? parseInt(to, 10) : undefined;

    if (fromValue === undefined || toValue === undefined) {
      toast.error("Invalid sequence values");
      return;
    }
    try {
      const { success, message } = await updateSequenceAction({ from: fromValue, id, to: toValue });
      if (!success) {
        throw new Error(message);
      }
      toast.success("Skill sequence updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleToggleVisibilityById = async (id: string) => {
    try {
      const { success, message } = await toggleVisibilityByIdAction(id);
      if (!success) {
        throw new Error(message);
      }
      toast.success("Skill visibility updated successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };
  return (
    <Table<ISkill>
      data={props.data}
      columns={columns}
      currentPage={props.currentPage}
      pageSize={props.skillPageSize}
      totalCount={props.totalCount}
    />
  );
};

export default SkillTable;
