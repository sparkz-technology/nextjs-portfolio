import { notFound } from "next/navigation";

import { DeleteDialog, EducationDialog } from "@/app/dashboard/education/education-dialog";
import EducationTable from "@/app/dashboard/education/education-table";
import { ISearchParams } from "@/lib/type";
import { listEducationAction } from "@/app/dashboard/education/action";

interface EducationPageProps {
  searchParams: Promise<ISearchParams>;
}

export default async function EducationPage({ searchParams }: EducationPageProps) {
  const { page, pageSize } = (await searchParams) || {};

  const currentPage = parseInt(page || "1", 10);
  const educationPageSize = parseInt(pageSize || "5", 10);
  const { education, totalCount } = await listEducationAction({
    pageNo: currentPage,
    pageSize: educationPageSize,
  });

  if (!education) {
    return notFound();
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Education</h1>
        <EducationDialog />
      </div>
      <DeleteDialog />
      <EducationTable
        data={education}
        totalCount={totalCount}
        currentPage={currentPage}
        expriencePageSize={educationPageSize}
      />
    </div>
  );
}
