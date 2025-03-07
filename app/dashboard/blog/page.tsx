import { notFound } from "next/navigation";

import { ISearchParams } from "@/lib/type";
import { DeleteDialog } from "./blog-dialog";
import { listPostAction } from "@/app/dashboard/blog/action";
import BlogTable from "./blog-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { BlogFormDrawer } from "./blog-form-drawer";

interface GuestbookPageProps {
    searchParams: Promise<ISearchParams>;
}

export default async function BlogPage({ searchParams }: GuestbookPageProps) {
    const { page, pageSize } = (await searchParams) || {};

    const currentPage = parseInt(page || "1", 10);
    const postPageSize = parseInt(pageSize || "5", 10);
    const { posts, totalCount } = await listPostAction({
        pageNo: currentPage,
        pageSize: postPageSize,
    });

    if (!posts) {
        return notFound();
    }

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Blog</h1>
                <BlogFormDrawer>
                    <Button className="shadow-lg">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        New Post
                    </Button>
                </BlogFormDrawer>
            </div>
            <DeleteDialog />
            <BlogTable
                data={posts}
                totalCount={totalCount}
                currentPage={currentPage}
                postPageSize={postPageSize}
            />
        </div>
    );
}
