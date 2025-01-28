import { notFound } from "next/navigation";

import MessageTable from "@/app/dashboard/message/message-table";
import { ISearchParams } from "@/lib/type";
import { listMessageAction } from "@/app/dashboard/message/action";

interface MessagePageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function MessagePage({ searchParams }: MessagePageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const messagePageSize = parseInt(pageSize || "5", 10);
  const { message, totalCount } = await listMessageAction({
    pageNo: currentPage,
    pageSize: messagePageSize,
  });

  if (!message) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Message</h1>
      <MessageTable data={message} totalCount={totalCount} currentPage={currentPage} skillPageSize={messagePageSize} />
    </div>
  );
}
