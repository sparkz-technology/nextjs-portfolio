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
import { useBlogDialog } from "@/lib/zustand/use-dialog-store";
import { IPost } from "@/lib/type";
import dayjs from "dayjs";

interface BlogTableProps {
    data: IPost[];
    currentPage: number;
    totalCount: number;
    postPageSize: number;
}

const BlogTable: React.FC<BlogTableProps> = (props) => {
    const { openDialogWithData } = useBlogDialog();
    const columns: ColumnDef<IPost>[] = [
        {
            id: "title",
            header: () => <span className="font-semibold text-sm uppercase">Title</span>,
            cell: ({ row }) => (
                <span className="capitalize font-medium text-gray-800 dark:text-gray-200">@{row.original.title}</span>
            ),
        },
        {
            accessorKey: "published",
            header: () => <span className="font-semibold text-sm uppercase">Status</span>,
            cell: ({ row }) => (
                <Badge variant={row.original.published ? "default" : "secondary"}>
                    {row.original.published ? "Published" : "Draft"}
                </Badge>
            ),
        },
        {
            id: "likes",
            header: () => <span className="font-semibold text-xs uppercase text-gray-600 dark:text-gray-400">Likes</span>,
            cell: ({ row }) => {
                const hasLikes = !!row.original?.likes;
                const likeCount = row.original?.likes || 0;
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
                            className={`font-medium ${hasLikes ? "text-gray-800 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"
                                }`}
                        >
                            {likeCount}
                        </span>
                    </div>
                );
            },
        }, {
              id: "createdAt",
              header: () => <span className="font-semibold text-sm uppercase">Created At</span>,
              cell: ({ row }) => (
                <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{`${dayjs(row?.original?.createdAt).format("DD/MM/YYYY")}`}</span>
              ),
            },
        {
            id: "actions",
            header: () => <span className="font-semibold text-sm uppercase">Actions</span>,
            cell: ({ row }) => {
                const post = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(post.id)}>
                                Copy post ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => openDialogWithData({ type: "deletePost", data: post })}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <Table<IPost>
            data={props.data}
            columns={columns}
            currentPage={props.currentPage}
            pageSize={props.postPageSize}
            totalCount={props.totalCount}
        />
    );
};

export default BlogTable;
