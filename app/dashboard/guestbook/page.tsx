import { notFound } from "next/navigation";

import { ISearchParams } from "@/lib/types";
import { DeleteDialog } from "./guestbook-dialog";
import GustbookTable from "@/app/dashboard/guestbook/guestbook-table";
import { listGuestSignatureAction } from "@/app/dashboard/guestbook/action";

interface GuestbookPageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function GuestbookPage({ searchParams }: GuestbookPageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const guestSignaturePageSize = parseInt(pageSize || "5", 10);
  const { guestSignature, totalCount } = await listGuestSignatureAction({
    pageNo: currentPage,
    pageSize: guestSignaturePageSize,
  });

  if (!guestSignature) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Guestbook</h1>
      <DeleteDialog />
      <GustbookTable
        data={guestSignature}
        totalCount={totalCount}
        currentPage={currentPage}
        skillPageSize={guestSignaturePageSize}
      />
    </div>
  );
}
